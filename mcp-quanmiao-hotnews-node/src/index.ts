// Copyright 2025 全妙新闻播报

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import create_sse_app from './sse'
import create_stdio_app from "./stdio";
import dotenv from 'dotenv';
dotenv.config(); // 加载 .env 文件

//通过环境变量判断是 stdio 还是 sse
const isSse = process.env.QUANMIAO_MCP_TRANSPORT === "sse";

if (isSse) {
    create_sse_app()()
} else {
    create_stdio_app()()
}