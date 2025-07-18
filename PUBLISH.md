# npm 发布指南

## 🚀 发布到 npm

### 1. 准备工作

#### 注册 npm 账户
```bash
# 如果没有 npm 账户，先注册
npm adduser
```

#### 登录 npm
```bash
npm login
```

### 2. 更新版本号

```bash
# 补丁版本 (1.0.0 -> 1.0.1)
npm version patch

# 次要版本 (1.0.0 -> 1.1.0)
npm version minor

# 主要版本 (1.0.0 -> 2.0.0)
npm version major
```

### 3. 构建项目

```bash
npm run build
```

### 4. 发布到 npm

```bash
npm publish
```

### 5. 发布到 GitHub Packages（可选）

如果你想同时发布到 GitHub Packages：

```bash
# 设置 registry
npm publish --registry=https://npm.pkg.github.com
```

## 📦 包信息

### 包名称
- npm: `gitlab-mcp-server`
- 全局安装后命令: `gitlab-mcp`

### 安装方式

#### 全局安装
```bash
npm install -g gitlab-mcp-server
```

#### 本地安装
```bash
npm install gitlab-mcp-server
```

### 使用方式

#### 全局安装后
```bash
# 直接运行
gitlab-mcp

# 或在 Cursor 配置中使用
{
  "mcpServers": {
    "gitlab": {
      "command": "gitlab-mcp"
    }
  }
}
```

#### 本地安装后
```bash
# 使用 npx
npx gitlab-mcp-server

# 或在 Cursor 配置中使用
{
  "mcpServers": {
    "gitlab": {
      "command": "npx",
      "args": ["gitlab-mcp-server"]
    }
  }
}
```

## 🔧 发布前检查清单

- [ ] 更新 `package.json` 中的版本号
- [ ] 更新 `README.md` 中的安装说明
- [ ] 确保所有测试通过
- [ ] 构建项目 (`npm run build`)
- [ ] 检查 `dist/` 目录包含所有必要文件
- [ ] 验证许可证文件存在
- [ ] 检查 `.npmignore` 或 `files` 字段配置正确

## 📝 更新日志

### v1.0.0
- 初始版本
- 支持 Token 和 SSH 两种模式
- 自动检测 GitLab 项目信息
- 支持标签管理和合并请求创建
- 集成 GitLab CLI 支持

## 🎯 发布策略

### 版本号规则
- **补丁版本** (1.0.x): Bug 修复
- **次要版本** (1.x.0): 新功能，向后兼容
- **主要版本** (x.0.0): 重大更改，可能不向后兼容

### 发布频率
- 修复重要 bug 时立即发布补丁版本
- 新功能积累到一定程度时发布次要版本
- 重大架构更改时发布主要版本

## 🔍 发布后验证

### 1. 检查包信息
```bash
npm view gitlab-mcp-server
```

### 2. 测试安装
```bash
# 在新目录中测试
mkdir test-install
cd test-install
npm install gitlab-mcp-server
npx gitlab-mcp-server --help
```

### 3. 更新文档
- 更新 GitHub README
- 更新 npm 包描述（如果需要）
- 发布 GitHub Release

## 🚨 注意事项

1. **包名称唯一性**: 确保包名称在 npm 上是唯一的
2. **版本号**: 每次发布都要更新版本号
3. **依赖管理**: 确保所有依赖都正确声明
4. **文件大小**: 注意包的大小，避免包含不必要的文件
5. **许可证**: 确保包含适当的许可证文件

## 📚 相关链接

- [npm 发布文档](https://docs.npmjs.com/cli/v8/commands/npm-publish)
- [package.json 字段说明](https://docs.npmjs.com/cli/v8/configuring-npm/package-json)
- [npm 包最佳实践](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry) 