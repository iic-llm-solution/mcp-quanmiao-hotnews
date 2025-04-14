import {SSEServerTransport} from "@modelcontextprotocol/sdk/server/sse.js";
import express from 'express'
import server from "./create_server";

export default function create_sse_app() {
    return () => {
        const app = express();
        let transport: SSEServerTransport;
        app.get("/sse", async (req, res) => {
            console.log("Received connection");
            transport = new SSEServerTransport("/message", res);
            await server.connect(transport);
        });

        app.post("/message", async (req, res) => {
            console.log("Received message");
            await transport.handlePostMessage(req, res);
        });

        const PORT = process.env.QUANMIAO_MCP_PORT || 8080;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
}