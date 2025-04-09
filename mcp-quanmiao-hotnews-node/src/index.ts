#!/usr/bin/env node
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import * as OpenApi from '@alicloud/openapi-client';
import * as $Util from '@alicloud/tea-util';
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {z} from "zod";
import dotenv from 'dotenv';
dotenv.config(); // 加载 .env 文件


// 阿里云配置
const config = new OpenApi.Config({
    signatureVersion: "V3",
    accessKeyId: process.env.ALIBABA_CLOUD_ACCESS_KEY_ID,
    accessKeySecret: process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET,
    endpoint: 'aimiaobi.cn-beijing.aliyuncs.com'
});

// Create server instance
const server = new McpServer({
    name: "fetch-hot-news",
    version: "0.0.1",
    capabilities: {
        resources: {},
        tools: {},
    },
});

const client = new OpenApi.default(config);

async function do_request_aliyun(category: string | undefined,
                                 size: number | undefined,
                                 query: string | undefined) {
    const params = {
        WorkspaceId: process.env.WORKSPACE_ID,
        Category: category,
        Size: size || 10,
        Query: query,
        Locations: [] as string[],
    }

    const runtime = new $Util.RuntimeOptions({
        readTimeout: 10000,
        connectTimeout: 10000,
    });

    const request = new OpenApi.OpenApiRequest();
    request.body = params;

    let result = await client.doRPCRequest('GetHotTopicBroadcast', '2023-08-01', 'https', 'POST', 'AK', 'json', request, runtime);
    let topics_array = result['body']['Data']['Data'];
    return topics_array.map((topic: any) => {
        return {
            content: topic['TextSummary'],
            title: topic['HotTopic']
        }
    })
}

function format_to_text(topics: any[]) {
    return topics.map((topic: any) => {
        return `标题：${topic.title}\n摘要：${topic.content}`
    }).join("\n\n")
}

// Register Alibaba Cloud tool
server.tool(
    "fetch-hot-news",
    "获取热点新闻列表、推荐新闻热点",
    {
        category: z.enum(["科技", "娱乐", "社会", "体育", "教育", "汽车", "旅游", "文化"]).optional().describe("新闻分类，可以为空"),
        size: z.number().int().min(1).max(100).default(10).optional().describe("新闻数量，可以为空"),
        keyword: z.string().min(1).max(100).optional().describe("搜索的关键词，可以为空"),
    },
    async ({category, size, keyword}) => {
        try {
            let result = await do_request_aliyun(category, size, keyword);
            return {
                content: [{
                    type: "text",
                    text: format_to_text(result)
                }]
            };
        } catch (err) {
            const error = err as Error;
            console.error('Error calling Alibaba Cloud API:', error);
            return {
                content: [{
                    type: "text",
                    text: `Error: ${error.message}`
                }],
                isError: true
            };
        }
    }
);


async function main() {
    //change to sse
    const transport = new StdioServerTransport();

    await server.connect(transport);
    console.error("Hot News MCP Server running on stdio");
}


main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});


// async function test() {
//     let result = await do_request_aliyun('时政', 1, 20, undefined, undefined)
//     console.log(result)
// }
//
// test().catch((error) => {
//     console.error("Fatal error in main():", error);
//     process.exit(1);
// });