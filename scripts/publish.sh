#!/bin/bash

set -e

echo "🚀 准备发布 GitLab MCP Server 到 npm..."

# 检查是否登录 npm
if ! npm whoami &> /dev/null; then
    echo "❌ 请先登录 npm: npm login"
    exit 1
fi

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ 有未提交的更改，请先提交或暂存"
    git status
    exit 1
fi

# 构建项目
echo "📦 构建项目..."
npm run build

# 检查构建是否成功
if [ ! -f "dist/index.js" ]; then
    echo "❌ 构建失败，dist/index.js 不存在"
    exit 1
fi

# 检查包名称是否可用
echo "🔍 检查包名称..."
if npm view gitlab-mcp-server &> /dev/null; then
    echo "⚠️  包 gitlab-mcp-server 已存在，将更新版本"
else
    echo "✅ 包名称可用"
fi

# 询问版本类型
echo ""
echo "选择版本类型:"
echo "1) patch (1.0.0 -> 1.0.1) - Bug 修复"
echo "2) minor (1.0.0 -> 1.1.0) - 新功能"
echo "3) major (1.0.0 -> 2.0.0) - 重大更改"
echo "4) 自定义版本"
read -p "请选择 (1-4): " choice

case $choice in
    1)
        npm version patch
        ;;
    2)
        npm version minor
        ;;
    3)
        npm version major
        ;;
    4)
        read -p "请输入版本号 (例如: 1.0.0): " version
        npm version $version
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

# 显示新版本
NEW_VERSION=$(node -p "require('./package.json').version")
echo "📋 新版本: $NEW_VERSION"

# 确认发布
echo ""
read -p "确认发布版本 $NEW_VERSION 到 npm? (y/N): " confirm
if [[ $confirm != [yY] ]]; then
    echo "❌ 发布已取消"
    exit 1
fi

# 发布到 npm
echo "🚀 发布到 npm..."
npm publish

echo "✅ 发布成功！"
echo ""
echo "📋 发布信息:"
echo "- 包名: gitlab-mcp-server"
echo "- 版本: $NEW_VERSION"
echo "- 命令: gitlab-mcp"
echo ""
echo "🔗 查看包信息: npm view gitlab-mcp-server"
echo "📦 安装命令: npm install -g gitlab-mcp-server"
echo ""
echo "🎉 发布完成！" 