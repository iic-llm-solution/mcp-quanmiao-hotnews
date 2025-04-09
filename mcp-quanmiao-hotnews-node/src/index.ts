import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import * as OpenApi from '@alicloud/openapi-client';
import * as $Util from '@alicloud/tea-util';
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {z} from "zod";

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
                                 pageNo: number | undefined,
                                 pageSize: number | undefined,
                                 location: string | undefined,
                                 query: string | undefined) {
    const params = {
        WorkspaceId: process.env.WORKSPACE_ID,
        Category: category,
        Current: pageNo,
        Size: pageSize || 10,
        Query: query,
        Locations: [] as string[],
    }

    if (location) {
        params['Locations'] = [location];
    }

    console.log(params)

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
    "获取热点新闻列表",
    {
        category: z.enum(["科技",
            "娱乐",
            "社会",
            "体育",
            "教育",
            "汽车",
            "旅游",
            "文化"]).optional().describe("新闻分类"),
        pageNo: z.number().int().min(1).max(100).optional().describe("页码"),
        pageSize: z.number().int().min(1).max(100).default(10).optional().describe("每页数量"),
        location: z.string().optional().describe("事件发生的地名（国家名或城市名或地区名）"),
    },
    async ({category, pageNo, pageSize, location}) => {
        try {
            let result = await do_request_aliyun(category, pageNo, pageSize, location, undefined);
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

server.tool(
    "search-hot-news-with-query",
    "根据关键词搜索新闻",
    {
        size: z.number().int().min(1).max(100).default(10).optional().describe("每页数量"),
        query: z.string().min(1).max(100).describe("搜索的关键词"),
    },
    async ({size, query}) => {
        try {
            let result = await do_request_aliyun(undefined, 1, size, undefined, query);
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
)


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


// async function main() {
//     let result = await do_request_aliyun(undefined, undefined, undefined, undefined, '杭州')
//     console.log(result)
// }
//
// main().catch((error) => {
//     console.error("Fatal error in main():", error);
//     process.exit(1);
// });