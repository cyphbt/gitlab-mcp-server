# GitLab MCP 工具快速开始指南

## 🚀 5分钟快速配置

### 1. 安装依赖
```bash
npm install
npm run build
```

### 2. 选择配置方式

#### 方式 A: Token 模式（推荐）
```bash
# 获取 GitLab Token
# 1. 登录 GitLab
# 2. 进入 Settings > Access Tokens
# 3. 创建新 Token，勾选 api 权限
# 4. 复制 Token

# 配置环境变量
cp env.example .env
echo "GITLAB_TOKEN=your_token_here" > .env
```

#### 方式 B: SSH 模式（无需 Token）
```bash
# 安装 GitLab CLI
./install-glab.sh

# 验证 SSH 连接
git ls-remote origin

# 不设置 GITLAB_TOKEN，工具会自动使用 SSH 模式
```

### 3. 测试自动检测
```bash
npm run test:detect
```

### 5. 在 Cursor 中配置
1. 打开 Cursor
2. 进入 Settings > Extensions > Model Context Protocol
3. 添加配置：

```json
{
  "mcpServers": {
    "gitlab": {
      "command": "node",
      "args": ["/Users/cyp/mobby/mcp/gitlab/dist/index.js"],
      "env": {
        "GITLAB_TOKEN": "your_token_here"
      }
    }
  }
}
```

### 6. 开始使用
在 Cursor 中，你可以直接使用以下命令：

- `请帮我查看当前项目信息`
- `请显示最新的标签`
- `请为当前分支创建一个标签 v1.0.0`
- `请创建一个合并请求`

## 🎯 使用场景

### 场景 1: 查看项目状态
```
请帮我查看当前项目的基本信息
```

### 场景 2: 发布新版本
```
请显示最新的标签，然后为当前分支创建一个新标签 v1.2.0
```

### 场景 3: 创建功能分支的合并请求
```
请从当前分支创建一个合并请求到 main 分支，
标题为 "Add new feature"，
描述为 "This feature improves user experience"
```

## 🔧 故障排除

### 问题 1: "当前目录不是 Git 仓库"
- 确保你在 Git 仓库目录中
- 运行 `git status` 确认

### 问题 2: "无法解析 GitLab 仓库信息"
- 检查远程仓库 URL: `git remote -v`
- 确保是 GitLab 仓库

### 问题 3: "无法获取项目 ID"
- 检查 Token 权限
- 确认项目存在且你有访问权限

### 问题 4: MCP 服务器连接失败
- 检查 Cursor 配置路径是否正确
- 确认 Token 已正确设置

## 📝 常用命令

```bash
# 构建项目
npm run build

# 启动服务器（测试用）
npm start

# 测试自动检测
npm run test:detect

# 开发模式
npm run dev
```

## 🎉 完成！

现在你可以在 Cursor 中直接使用 GitLab 功能了！工具会自动检测你的项目信息，无需手动配置。 