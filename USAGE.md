# GitLab MCP 服务器使用指南

## 快速开始

### 1. 环境准备

确保你已经安装了 Node.js (版本 16 或更高)。

### 2. 安装和配置

```bash
# 克隆或下载项目
cd gitlab-mcp-server

# 安装依赖
npm install

# 配置环境变量
cp env.example .env
```

编辑 `.env` 文件，填入你的 GitLab Token：

```env
# GitLab 配置
# 只需要设置 Token，其他信息会自动从当前 Git 仓库检测
GITLAB_TOKEN=your_personal_access_token
```

**注意**: 这个工具会自动检测当前 Git 仓库的 GitLab 项目信息，你只需要提供 Token 即可。

### 3. 构建项目

```bash
npm run build
```

### 4. 启动服务器

```bash
npm start
```

## 功能使用示例

### 功能 1: 获取项目信息

**工具名称**: `gitlab_get_project_info`

**功能**: 自动检测并显示当前 GitLab 项目的基本信息。

**参数**: 无

**使用示例**:

```json
{
  "name": "gitlab_get_project_info",
  "arguments": {}
}
```

**返回示例**:
```
📋 **项目信息**

- **项目名称**: my-awesome-project
- **项目描述**: A fantastic project for awesome features
- **GitLab URL**: https://gitlab.com
- **项目 ID**: 12345
- **项目路径**: my-group/my-awesome-project
- **当前分支**: feature/new-feature
- **默认分支**: main
- **可见性**: private
- **Web URL**: https://gitlab.com/my-group/my-awesome-project

👤 **Git 配置**
- **用户名**: John Doe
- **邮箱**: john.doe@example.com

📝 **最近提交**
- **a1b2c3d** Add new feature (John Doe, 2024-01-15)
- **e4f5g6h** Fix bug in authentication (John Doe, 2024-01-14)
- **i7j8k9l** Update documentation (John Doe, 2024-01-13)
```

### 功能 2: 查询最新标签

**工具名称**: `gitlab_get_latest_tags`

**功能**: 获取项目的最新标签列表，按版本号降序排列。

**参数**:
- `limit` (可选): 返回的标签数量，默认为 10

**使用示例**:

```json
{
  "name": "gitlab_get_latest_tags",
  "arguments": {
    "limit": 5
  }
}
```

**返回示例**:
```
获取到 5 个最新标签：

- **v2.1.0**: Release version 2.1.0 (a1b2c3d)
- **v2.0.1**: Bug fix release (e4f5g6h)
- **v2.0.0**: Major release (i7j8k9l)
- **v1.9.5**: Minor update (m0n1o2p)
- **v1.9.4**: Security patch (q3r4s5t)
```

### 功能 2: 创建标签

**工具名称**: `gitlab_create_tag`

**功能**: 在指定分支或提交上创建新的 Git 标签。

**必需参数**:
- `tag_name`: 标签名称（例如：v1.2.0）
- `ref`: 标签指向的分支或提交（例如：main, develop, commit-hash）

**可选参数**:
- `message`: 标签消息
- `release_description`: 发布描述

**使用示例**:

```json
{
  "name": "gitlab_create_tag",
  "arguments": {
    "tag_name": "v1.2.0",
    "ref": "main",
    "message": "Release version 1.2.0",
    "release_description": "This release includes:\n- Bug fixes\n- Performance improvements\n- New features"
  }
}
```

**返回示例**:
```
✅ 成功创建标签 **v1.2.0**

- 标签名称: v1.2.0
- 指向分支: main
- 消息: Release version 1.2.0
- 发布描述: This release includes:
- Bug fixes
- Performance improvements
- New features
```

### 功能 3: 创建合并请求

**工具名称**: `gitlab_create_merge_request`

**功能**: 创建新的合并请求。

**必需参数**:
- `source_branch`: 源分支名称
- `target_branch`: 目标分支名称
- `title`: 合并请求标题

**可选参数**:
- `description`: 合并请求描述
- `remove_source_branch`: 合并后是否删除源分支（默认 false）
- `squash`: 是否压缩提交（默认 false）

**使用示例**:

```json
{
  "name": "gitlab_create_merge_request",
  "arguments": {
    "source_branch": "feature/user-authentication",
    "target_branch": "main",
    "title": "Add user authentication system",
    "description": "This merge request implements a complete user authentication system including:\n\n- User registration and login\n- Password reset functionality\n- JWT token authentication\n- Role-based access control\n\nCloses #123",
    "remove_source_branch": true,
    "squash": false
  }
}
```

**返回示例**:
```
✅ 成功创建合并请求 **Add user authentication system**

- MR ID: !45
- 标题: Add user authentication system
- 源分支: feature/user-authentication
- 目标分支: main
- 状态: opened
- 链接: https://gitlab.com/your-group/your-project/-/merge_requests/45
- 描述: This merge request implements a complete user authentication system including:

- User registration and login
- Password reset functionality
- JWT token authentication
- Role-based access control

Closes #123
```

## 在 MCP 客户端中配置

### 在 Cursor 中配置

1. 打开 Cursor
2. 进入 Settings > Extensions > Model Context Protocol
3. 添加新的 MCP 服务器配置：

```json
{
  "mcpServers": {
    "gitlab": {
      "command": "node",
      "args": ["/path/to/your/gitlab-mcp-server/dist/index.js"],
      "env": {
        "GITLAB_TOKEN": "your_token"
      }
    }
  }
}
```

**注意**: 只需要设置 `GITLAB_TOKEN`，其他信息会自动从当前 Git 仓库检测。

### 在其他 MCP 客户端中配置

根据你的 MCP 客户端，配置方式可能略有不同，但基本结构是相同的：

```json
{
  "command": "node",
  "args": ["/path/to/your/gitlab-mcp-server/dist/index.js"],
  "env": {
    "GITLAB_URL": "https://gitlab.com",
    "GITLAB_TOKEN": "your_token",
    "GITLAB_PROJECT_ID": "your_project_id"
  }
}
```

## 实际使用场景

### 场景 1: 发布新版本

1. **查询当前版本**:
   ```
   请帮我查询项目的最新标签
   ```

2. **创建新版本标签**:
   ```
   请为项目创建一个新标签 v2.1.0，指向 main 分支，
   消息为 "Release version 2.1.0"，
   发布描述为 "This release includes bug fixes and performance improvements"
   ```

### 场景 2: 功能开发工作流

1. **创建功能分支的合并请求**:
   ```
   请创建一个合并请求，从 feature/new-feature 分支合并到 main 分支，
   标题为 "Add new feature"，
   描述为 "This feature improves user experience by adding..."
   ```

### 场景 3: 项目管理

1. **查看项目状态**:
   ```
   请显示项目的最新 10 个标签
   ```

2. **批量操作**:
   ```
   请为最近的几个提交创建标签，并创建相应的合并请求
   ```

## 错误处理

服务器会返回用户友好的中文错误消息：

- **配置错误**: "未设置 GITLAB_TOKEN 环境变量"
- **权限错误**: "获取标签失败: 401 Unauthorized"
- **参数错误**: "缺少必要的参数: tag_name 和 ref"
- **网络错误**: "获取标签失败: Network Error"

## 安全建议

1. **Token 管理**: 定期轮换你的 GitLab Personal Access Token
2. **权限最小化**: 只给 Token 必要的权限
3. **环境隔离**: 在不同环境中使用不同的 Token
4. **日志监控**: 监控 Token 的使用情况

## 故障排除

### 常见问题

1. **服务器无法启动**
   - 检查 Node.js 版本是否 >= 16
   - 确认所有依赖已安装：`npm install`
   - 确认项目已构建：`npm run build`

2. **GitLab API 错误**
   - 检查 Token 是否有效
   - 确认项目 ID 是否正确
   - 验证 Token 权限是否足够

3. **网络连接问题**
   - 检查 GitLab URL 是否正确
   - 确认网络连接正常
   - 检查防火墙设置

### 调试模式

启用调试模式来获取更多信息：

```bash
DEBUG=* npm start
```

## 扩展功能

这个 MCP 服务器可以轻松扩展更多功能：

- 获取项目信息
- 管理分支
- 查看提交历史
- 管理 Issues
- 处理 Pipeline
- 管理项目成员

只需要在 `src/index.ts` 中添加新的工具定义和处理器即可。 