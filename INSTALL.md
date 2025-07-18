# 快速安装指南

## 🚀 一键安装

### 全局安装（推荐）
```bash
npm install -g @cyphbt/gitlab-mcp-server
```

### 本地安装
```bash
npm install @cyphbt/gitlab-mcp-server
```

## 📋 配置步骤

### 1. 选择认证方式

#### 方式 A: Token 模式（推荐）
1. 获取 GitLab Token：
   - 登录 GitLab
   - 进入 Settings > Access Tokens
   - 创建新 Token，勾选 `api` 权限
   - 复制 Token

2. 设置环境变量：
   ```bash
   export GITLAB_TOKEN=your_token_here
   ```

#### 方式 B: SSH 模式（无需 Token）
1. 安装 GitLab CLI：
   ```bash
   # macOS
   brew install glab
   
   # Linux
   curl -s https://gitlab.com/gitlab-org/cli/-/raw/main/scripts/install.sh | bash
   ```

2. 验证 SSH 连接：
   ```bash
   git ls-remote origin
   ```

### 2. 在 Cursor 中配置

#### 全局安装后
```json
{
  "mcpServers": {
    "gitlab": {
      "command": "gitlab-mcp",
      "env": {
        "GITLAB_TOKEN": "your_token"
      }
    }
  }
}
```

#### 本地安装后
```json
{
  "mcpServers": {
    "gitlab": {
      "command": "npx",
      "args": ["@cyphbt/gitlab-mcp-server"],
      "env": {
        "GITLAB_TOKEN": "your_token"
      }
    }
  }
}
```

**注意**: SSH 模式下无需设置 `GITLAB_TOKEN`。

## 🎯 开始使用

在 Cursor 中，你可以直接使用：

- `请帮我查看当前项目信息`
- `请显示最新的标签`
- `请为当前分支创建一个标签 v1.0.0`
- `请创建一个合并请求`

## 🔧 故障排除

### 问题 1: 命令未找到
```bash
# 检查是否安装成功
npm list -g @cyphbt/gitlab-mcp-server

# 重新安装
npm uninstall -g @cyphbt/gitlab-mcp-server
npm install -g @cyphbt/gitlab-mcp-server
```

### 问题 2: 权限错误
```bash
# 检查 GitLab Token 权限
# 确保勾选了 api, read_repository, write_repository

# 或者检查 SSH 连接
git ls-remote origin
```

### 问题 3: 项目检测失败
```bash
# 确保在 Git 仓库目录中
git status

# 检查远程仓库配置
git remote -v
```

## 📚 更多信息

- [完整文档](README.md)
- [使用示例](USAGE.md)
- [快速开始](QUICKSTART.md)
- [Git 命令替代方案](GIT-COMMANDS.md)

## 🆘 获取帮助

- 查看 [GitHub Issues](https://github.com/yourusername/gitlab-mcp-server/issues)
- 阅读 [完整文档](README.md)
- 检查 [故障排除指南](README.md#故障排除) 