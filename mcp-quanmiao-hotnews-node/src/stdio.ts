import server from "./create_server";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";

async function stdio_entry() {
    //change to sse
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCP Server running on stdio");
}

export default  function create_stdio_app() {
    return () => {
        stdio_entry().catch((error) => {
            console.error("Fatal error in main():", error);
            process.exit(1);
        });
    }
}