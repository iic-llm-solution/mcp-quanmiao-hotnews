#!/usr/bin/env python3
import json
import os
from typing import Optional, List, Dict
from dotenv import load_dotenv
from alibabacloud_tea_openapi import models as open_api_models
from alibabacloud_tea_openapi.client import Client
from alibabacloud_tea_util import models as util_models
from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel, Field

# 加载环境变量
load_dotenv()

# 阿里云配置
config = open_api_models.Config(
    signature_version="V3",
    access_key_id=os.getenv("ALIBABA_CLOUD_ACCESS_KEY_ID"),
    access_key_secret=os.getenv("ALIBABA_CLOUD_ACCESS_KEY_SECRET"),
    endpoint="aimiaobi.cn-beijing.aliyuncs.com"
)

# 创建服务器实例
server = FastMCP(name="hot_news_agent", )

client = Client(config)


def do_request_aliyun(category: Optional[str] = None,
                      size: Optional[int] = None,
                      query: Optional[str] = None) -> List[Dict[str, str]]:
    params = {
        "WorkspaceId": os.getenv("WORKSPACE_ID"),
        "Category": category,
        "Size": size or 10,
        "Query": query
    }

    runtime = util_models.RuntimeOptions(
        read_timeout=10000,
        connect_timeout=10000
    )

    request = open_api_models.OpenApiRequest(body=params)

    result = client.do_rpcrequest(
        "GetHotTopicBroadcast",
        "2023-08-01",
        "https",
        "POST",
        "AK",
        "json",
        request,
        runtime
    )

    topics_array = result.get("body", {}).get("Data", {}).get("Data", [])

    return [
        {
            "content": topic["TextSummary"],
            "title": topic["HotTopic"]
        }
        for topic in topics_array
    ]


def format_to_text(topics: List[Dict[str, str]]) -> str:
    return "\n\n".join(
        f"标题：{topic['title']}\n摘要：{topic['content']}"
        for topic in topics
    )


@server.tool(
    name="fetch_hot_news",
    description="获取热点新闻列表、推荐新闻热点，支持分类筛选、数量限制和关键词搜索"
)
def fetch_hot_news(
        category: str = Field(description="新闻分类",
                              enum=["科技", "娱乐", "社会", "体育", "教育", "汽车", "旅游", "文化"], default=None,
                              min_length=1, max_length=100),
        size: int = Field(description="返回新闻数量", default=None, ge=1, le=100),
        keyword: str = Field(description="搜索关键词", default=None, min_length=1, max_length=100)
):
    """
    获取热点新闻列表
    
    Args:
        category: 新闻分类
        size: 返回新闻数量
        keyword: 搜索关键词
        
    Returns:
        Dict包含新闻内容列表，每条新闻包含标题和摘要
    """
    try:
        # 调用阿里云API获取热点新闻
        result = do_request_aliyun(
            category=category,
            size=size or 10,
            query=keyword
        )

        # 格式化返回结果
        return {
            "content": [{
                "type": "text",
                "text": format_to_text(result)
            }]
        }
    except Exception as err:
        # 错误处理
        return {
            "content": [{
                "type": "text",
                "text": f"Error: {str(err)}"
            }],
            "isError": True
        }


if __name__ == "__main__":
    server.run(transport='sse')
