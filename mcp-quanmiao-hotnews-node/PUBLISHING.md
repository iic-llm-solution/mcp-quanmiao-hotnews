# NPM 发布指南

## 准备工作
1. 确保已有 npm 账号，如果没有请先注册：https://www.npmjs.com/signup
2. 在本地登录 npm 账号：
```bash
npm login
```
3. 确保 `package.json` 中的版本号、描述等信息正确

## 发布步骤
1. 更新版本号
```bash
# 升级补丁版本 (1.0.0 -> 1.0.1)
npm version patch

# 升级小版本 (1.0.0 -> 1.1.0)
npm version minor

# 升级大版本 (1.0.0 -> 2.0.0)
npm version major
```

2. 构建项目
```bash
npm run build
```

3. 发布到 npm
```bash
npm publish
```

4. 发布标签版本（可选）
```bash
# 发布 beta 版本
npm publish --tag beta

# 发布 alpha 版本
npm publish --tag alpha
```

## 版本管理规范
- 遵循语义化版本（Semantic Versioning）规范
- 主版本号：不兼容的 API 修改
- 次版本号：向下兼容的功能性新增
- 修订号：向下兼容的问题修正

## 发布检查清单
- [ ] 更新 CHANGELOG.md
- [ ] 更新版本号
- [ ] 确保所有测试通过
- [ ] 确保构建成功
- [ ] 确保 README.md 文档更新
- [ ] 确保 package.json 中的依赖是最新的
- [ ] 确保 .npmignore 文件配置正确 