# GitLab MCP 服务器

这是一个 GitLab 的 Model Context Protocol (MCP) 服务器，提供了三个主要功能：

1. **查询最新标签** - 获取项目的最新标签列表
2. **创建标签** - 创建新的标签（支持描述信息）
3. **创建合并请求** - 提交新的合并请求

## 功能特性

### 1. 自动检测项目信息 (`gitlab_get_project_info`)
- 自动检测当前 Git 仓库的 GitLab 项目信息
- 显示项目名称、描述、可见性等基本信息
- 显示当前分支和 Git 配置信息
- 显示最近的提交历史

### 2. 查询最新标签 (`gitlab_get_latest_tags`)
- 获取项目的最新标签列表
- 支持限制返回数量
- 按版本号排序（降序）

### 3. 创建标签 (`gitlab_create_tag`)
- 创建新的 Git 标签
- 支持标签消息和发布描述
- 可以指向任意分支或提交

### 4. 创建合并请求 (`gitlab_create_merge_request`)
- 创建新的合并请求
- 支持详细的描述信息
- 可配置是否删除源分支和压缩提交

### 5. 智能自动检测
- **零配置**: 只需要设置 GitLab Token 或使用 SSH 模式
- **自动解析**: 从 Git 远程仓库自动解析 GitLab URL 和项目路径
- **动态获取**: 通过 API 自动获取项目 ID
- **实时状态**: 自动获取当前分支和项目状态

### 6. 双模式支持
- **Token 模式**: 使用 GitLab API，功能完整
- **SSH 模式**: 使用 Git 命令和 GitLab CLI，无需 Token

## 安装和配置

### 方式 1: npm 安装（推荐）

#### 全局安装
```bash
npm install -g @cyphbt/gitlab-mcp-server
```

#### 本地安装
```bash
npm install @cyphbt/gitlab-mcp-server
```

### 方式 2: 从源码安装

```bash
# 克隆仓库
git clone https://github.com/yourusername/gitlab-mcp-server.git
cd gitlab-mcp-server

# 安装依赖
npm install

# 构建项目
npm run build
```

### 配置环境变量

#### Token 模式
复制 `env.example` 文件为 `.env` 并填写你的 GitLab Token：

```bash
cp env.example .env
```

编辑 `.env` 文件：

```env
# GitLab 配置
GITLAB_TOKEN=your_gitlab_personal_access_token
```

#### SSH 模式
如果你选择 SSH 模式，无需设置 Token，但需要安装 GitLab CLI：

```bash
# 安装 GitLab CLI
./install-glab.sh

# 验证 SSH 连接
git ls-remote origin
```

**注意**: 这个工具会自动检测当前 Git 仓库的 GitLab 项目信息。

### 配置方式选择

#### 方式 1: Token 模式（推荐）

1. 登录你的 GitLab 账户
2. 进入 Settings > Access Tokens
3. 创建一个新的 Personal Access Token
4. 确保勾选以下权限：
   - `api` - 完整的 API 访问权限
   - `read_repository` - 读取仓库
   - `write_repository` - 写入仓库

#### 方式 2: SSH 模式（无需 Token）

如果你已经有 SSH 密钥配置，可以选择 SSH 模式：

1. 安装 GitLab CLI：
   ```bash
   ./install-glab.sh
   ```

2. 验证 SSH 连接：
   ```bash
   git ls-remote origin
   ```

3. 不设置 `GITLAB_TOKEN` 环境变量，工具会自动使用 SSH 模式

### 4. 自动检测功能

这个 MCP 工具会自动检测：

- **GitLab URL**: 从 Git 远程仓库 URL 自动解析
- **项目 ID**: 通过 GitLab API 自动获取（Token 模式）或使用项目路径（SSH 模式）
- **当前分支**: 从 Git 仓库状态自动获取
- **项目信息**: 包括项目名称、描述、可见性等

支持以下 Git 远程 URL 格式：
- HTTPS: `https://gitlab.com/group/project.git`
- SSH: `git@gitlab.com:group/project.git`

### 5. 构建项目

```bash
npm run build
```

## 使用方法

### 启动服务器

#### npm 安装后
```bash
# 全局安装
gitlab-mcp

# 本地安装
npx @cyphbt/gitlab-mcp-server
```

#### 源码安装后
```bash
npm start
```

### 在 Cursor 中配置

1. 打开 Cursor
2. 进入 Settings > Extensions > Model Context Protocol
3. 添加新的 MCP 服务器配置：

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

#### 源码安装后
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

**注意**: SSH 模式下无需设置 `GITLAB_TOKEN`，其他信息会自动从当前 Git 仓库检测。

### 在其他 MCP 客户端中使用

根据你的 MCP 客户端，配置方式可能略有不同，但基本结构是相同的：

```json
{
  "command": "gitlab-mcp",
  "env": {
    "GITLAB_TOKEN": "your_token"
  }
}
```

## API 使用示例

### 查询最新标签

```json
{
  "name": "gitlab_get_latest_tags",
  "arguments": {
    "limit": 5
  }
}
```

### 创建标签

```json
{
  "name": "gitlab_create_tag",
  "arguments": {
    "tag_name": "v1.2.0",
    "ref": "main",
    "message": "Release version 1.2.0",
    "release_description": "This release includes bug fixes and performance improvements."
  }
}
```

### 创建合并请求

```json
{
  "name": "gitlab_create_merge_request",
  "arguments": {
    "source_branch": "feature/new-feature",
    "target_branch": "main",
    "title": "Add new feature",
    "description": "This merge request adds a new feature that improves user experience.",
    "remove_source_branch": true,
    "squash": false
  }
}
```

## 开发

### 开发模式运行

```bash
npm run dev
```

### 构建项目

```bash
npm run build
```

## 错误处理

服务器会处理各种错误情况：

- 配置错误（缺少必要的环境变量）
- GitLab API 错误
- 网络连接错误
- 权限错误

所有错误都会以用户友好的中文消息返回。

## 安全注意事项

1. **Token 安全**: 确保你的 GitLab Personal Access Token 安全存储，不要提交到版本控制系统
2. **权限最小化**: 只给 Token 必要的权限
3. **环境变量**: 使用 `.env` 文件存储敏感信息，确保该文件被 `.gitignore` 忽略

## 故障排除

### 常见问题

1. **"未设置 GITLAB_TOKEN 环境变量"**
   - 确保在 `.env` 文件中设置了 `GITLAB_TOKEN`

2. **"未设置 GITLAB_PROJECT_ID 环境变量"**
   - 确保在 `.env` 文件中设置了正确的项目 ID

3. **"获取标签失败: 401 Unauthorized"**
   - 检查你的 GitLab Token 是否有效
   - 确保 Token 有足够的权限

4. **"获取标签失败: 404 Not Found"**
   - 检查项目 ID 是否正确
   - 确保你有访问该项目的权限

## 许可证

MIT License # gitlab-mcp-server
