# Git 命令替代方案

如果你不想使用 MCP 工具，也可以直接使用 Git 命令来实现相同的功能。

## 🔍 查看项目信息

### 查看远程仓库信息
```bash
# 查看远程仓库 URL
git remote -v

# 查看当前分支
git branch --show-current

# 查看所有分支
git branch -a

# 查看 Git 配置
git config user.name
git config user.email
```

### 查看最近提交
```bash
# 查看最近 5 个提交
git log --oneline -5

# 查看详细提交信息
git log --pretty=format:"%h - %an, %ar : %s" -5
```

## 🏷️ 标签管理

### 查看标签
```bash
# 查看本地标签
git tag

# 查看远程标签
git ls-remote --tags origin

# 查看标签详细信息
git show v1.0.0
```

### 创建标签
```bash
# 创建轻量标签
git tag v1.0.0

# 创建带注释的标签
git tag -a v1.0.0 -m "Release version 1.0.0"

# 推送标签到远程
git push origin v1.0.0

# 推送所有标签
git push origin --tags
```

### 删除标签
```bash
# 删除本地标签
git tag -d v1.0.0

# 删除远程标签
git push origin --delete v1.0.0
```

## 🔄 分支管理

### 查看分支
```bash
# 查看本地分支
git branch

# 查看所有分支
git branch -a

# 查看远程分支
git branch -r
```

### 创建和切换分支
```bash
# 创建新分支
git checkout -b feature/new-feature

# 切换到分支
git checkout main

# 推送新分支到远程
git push -u origin feature/new-feature
```

## 📋 合并请求（使用 GitLab CLI）

### 安装 GitLab CLI
```bash
# macOS
brew install glab

# Linux
curl -s https://gitlab.com/gitlab-org/cli/-/raw/main/scripts/install.sh | bash
```

### 身份验证
```bash
# 登录 GitLab
glab auth login

# 或者使用 SSH
glab auth login --with-token
```

### 创建合并请求
```bash
# 创建合并请求
glab mr create --title "Add new feature" --description "This adds a new feature"

# 指定源分支和目标分支
glab mr create --source-branch feature/new-feature --target-branch main --title "Add new feature"

# 创建后删除源分支
glab mr create --delete-source-branch --title "Add new feature"

# 压缩提交
glab mr create --squash --title "Add new feature"
```

### 管理合并请求
```bash
# 查看合并请求列表
glab mr list

# 查看合并请求详情
glab mr view 123

# 合并请求
glab mr merge 123

# 关闭合并请求
glab mr close 123
```

## 🚀 发布管理

### 创建 GitLab Release
```bash
# 创建发布
glab release create v1.0.0 --notes "Release version 1.0.0"

# 从文件读取发布说明
glab release create v1.0.0 --notes-file CHANGELOG.md

# 标记为预发布
glab release create v1.0.0-beta --notes "Beta release" --pre-release
```

## 📊 项目状态

### 查看工作区状态
```bash
# 查看修改的文件
git status

# 查看暂存的更改
git diff --cached

# 查看未暂存的更改
git diff
```

### 查看提交历史
```bash
# 图形化查看提交历史
git log --graph --oneline --all

# 查看特定文件的提交历史
git log --follow filename

# 查看提交统计
git log --stat
```

## 🔧 实用脚本

### 创建标签脚本
```bash
#!/bin/bash
# create-tag.sh

VERSION=$1
MESSAGE=$2

if [ -z "$VERSION" ]; then
    echo "Usage: $0 <version> [message]"
    exit 1
fi

# 创建标签
if [ -z "$MESSAGE" ]; then
    git tag $VERSION
else
    git tag -a $VERSION -m "$MESSAGE"
fi

# 推送标签
git push origin $VERSION

echo "✅ 标签 $VERSION 创建并推送成功"
```

### 创建合并请求脚本
```bash
#!/bin/bash
# create-mr.sh

SOURCE_BRANCH=$1
TARGET_BRANCH=${2:-main}
TITLE=$3
DESCRIPTION=$4

if [ -z "$SOURCE_BRANCH" ] || [ -z "$TITLE" ]; then
    echo "Usage: $0 <source-branch> [target-branch] <title> [description]"
    exit 1
fi

# 创建合并请求
if [ -z "$DESCRIPTION" ]; then
    glab mr create --source-branch $SOURCE_BRANCH --target-branch $TARGET_BRANCH --title "$TITLE"
else
    glab mr create --source-branch $SOURCE_BRANCH --target-branch $TARGET_BRANCH --title "$TITLE" --description "$DESCRIPTION"
fi

echo "✅ 合并请求创建成功"
```

## 🎯 工作流程示例

### 功能开发流程
```bash
# 1. 创建功能分支
git checkout -b feature/new-feature

# 2. 开发并提交
git add .
git commit -m "Add new feature"

# 3. 推送分支
git push -u origin feature/new-feature

# 4. 创建合并请求
glab mr create --source-branch feature/new-feature --target-branch main --title "Add new feature"

# 5. 合并后删除分支
git checkout main
git pull origin main
git branch -d feature/new-feature
```

### 发布流程
```bash
# 1. 确保主分支是最新的
git checkout main
git pull origin main

# 2. 创建发布标签
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# 3. 创建 GitLab Release
glab release create v1.0.0 --notes "Release version 1.0.0"
```

这些 Git 命令可以实现与 MCP 工具相同的功能，但需要手动执行。MCP 工具的优势是可以与 AI 助手集成，提供更智能的交互体验。 