## 全妙新闻播报MCP Server

### 项目简介
全妙新闻播报MCP Server 是一个新闻聚合和处理服务，用于收集、处理和分发新闻内容。项目包含 Node.js 和 Python 两个服务端实现。

### 项目结构
```
.
├── mcp-quanmiao-hotnews-node/    # Node.js 服务端实现
├── mcp-quanmiao-hotnews-python/  # Python 服务端实现
├── .env.example                          # 环境变量配置示例文件
└── .gitignore                    # Git 忽略文件配置
```

### 环境要求
- Node.js 版本: >= 14.0.0
- Python 版本: >= 3.8
- 环境变量配置（.env 文件）

### 前置要求

#### 开通阿里云百炼

#### 获取AK SK

#### 获取百炼业务空间ID（workspace_id）

#### 授权AK、SK访问POP接口

#### 配置环境变量
```
ALIBABA_CLOUD_ACCESS_KEY_ID=<阿里云AccessKeyID>
ALIBABA_CLOUD_ACCESS_KEY_SECRET=<阿里云AccessKeySecret>
WORKSPACE_ID=<百炼业务空间ID>
```


### 开始运行
```
uvx mcp-quanmiao-hotnews-node
```

### 许可证
本项目采用 MIT 许可证
详细信息请查看 [LICENSE](./LICENSE) 文件。