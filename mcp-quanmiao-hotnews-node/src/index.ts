import create_sse_app from './sse'
import create_stdio_app from "./stdio";
import dotenv from 'dotenv';
dotenv.config(); // 加载 .env 文件

//通过环境变量判断是 stdio 还是 sse
const isSse = process.env.TRANSPORT === "sse";

if (isSse) {
    create_sse_app()()
} else {
    create_stdio_app()()
}