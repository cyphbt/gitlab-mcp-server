#!/bin/bash

echo "🚀 安装 GitLab CLI (glab)..."

# 检测操作系统
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo "📱 检测到 macOS，使用 Homebrew 安装..."
    if command -v brew &> /dev/null; then
        brew install glab
    else
        echo "❌ 未找到 Homebrew，请先安装 Homebrew: https://brew.sh"
        exit 1
    fi
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    echo "🐧 检测到 Linux，使用官方安装脚本..."
    curl -s https://gitlab.com/gitlab-org/cli/-/raw/main/scripts/install.sh | bash
else
    echo "❌ 不支持的操作系统: $OSTYPE"
    echo "请手动安装 GitLab CLI: https://gitlab.com/gitlab-org/cli"
    exit 1
fi

echo "✅ GitLab CLI 安装完成！"

# 验证安装
if command -v glab &> /dev/null; then
    echo "🔍 验证安装..."
    glab --version
    echo ""
    echo "🎉 安装成功！现在你可以使用 SSH 模式了。"
    echo ""
    echo "📝 下一步："
    echo "1. 运行 'glab auth login' 进行身份验证"
    echo "2. 或者确保你的 SSH 密钥已添加到 GitLab"
    echo "3. 启动 MCP 服务器：npm start"
else
    echo "❌ 安装失败，请手动安装 GitLab CLI"
    exit 1
fi 