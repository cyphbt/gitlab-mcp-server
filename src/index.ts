#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { GitLabClient } from './gitlab-client.js';
import { SSHGitLabClient } from './ssh-gitlab-client.js';
import { GitLabConfig, CreateTagRequest, CreateMergeRequestRequest } from './types.js';
import { GitDetector } from './git-detector.js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 全局变量存储 GitLab 配置和客户端
let gitlabConfig: GitLabConfig | null = null;
let gitlabClient: GitLabClient | SSHGitLabClient | null = null;
let useSSHMode = false;

// 初始化 GitLab 配置
async function initializeGitLabConfig(): Promise<void> {
  try {
    const token = process.env.GITLAB_TOKEN;
    
    // 检查是否使用 SSH 模式
    if (!token) {
      console.error('🔑 未设置 GITLAB_TOKEN，尝试使用 SSH 模式...');
      await initializeSSHMode();
      return;
    }

    // Token 模式
    console.error('🔑 使用 Token 模式...');
    await initializeTokenMode(token);
  } catch (error) {
    console.error(`❌ GitLab 配置初始化失败: ${error instanceof Error ? error.message : '未知错误'}`);
    throw error;
  }
}

// 初始化 Token 模式
async function initializeTokenMode(token: string): Promise<void> {
  // 自动检测 GitLab 配置
  const detectedConfig = await GitDetector.detectGitLabConfig(token);
  
  if (!detectedConfig) {
    throw new Error('无法检测 GitLab 配置');
  }

  gitlabConfig = {
    url: detectedConfig.gitlabUrl,
    token,
    projectId: detectedConfig.projectId,
    defaultBranch: detectedConfig.currentBranch,
  };

  gitlabClient = new GitLabClient(gitlabConfig);
  useSSHMode = false;
  
  console.error(`✅ Token 模式 - 自动检测到 GitLab 项目: ${detectedConfig.gitlabUrl} (ID: ${detectedConfig.projectId})`);
  console.error(`📍 当前分支: ${detectedConfig.currentBranch}`);
}

// 初始化 SSH 模式
async function initializeSSHMode(): Promise<void> {
  // 检测 Git 仓库信息
  const gitInfo = GitDetector.detectGitInfo();
  
  if (!gitInfo.isGitRepo) {
    throw new Error('当前目录不是 Git 仓库');
  }

  const gitlabInfo = GitDetector.parseGitLabInfo(gitInfo);
  
  if (!gitlabInfo) {
    throw new Error('无法解析 GitLab 仓库信息');
  }

  // 测试 SSH 连接
  try {
    const { execSync } = await import('child_process');
    execSync('git ls-remote origin', { stdio: 'ignore' });
  } catch (error) {
    throw new Error('SSH 连接失败，请检查 SSH 密钥配置');
  }

  gitlabConfig = {
    url: gitlabInfo.gitlabUrl,
    token: '', // SSH 模式不需要 token
    projectId: gitlabInfo.projectPath, // 使用项目路径作为 ID
    defaultBranch: gitlabInfo.currentBranch,
  };

  gitlabClient = new SSHGitLabClient(gitlabConfig);
  useSSHMode = true;
  
  console.error(`✅ SSH 模式 - 检测到 GitLab 项目: ${gitlabInfo.gitlabUrl}/${gitlabInfo.projectPath}`);
  console.error(`📍 当前分支: ${gitlabInfo.currentBranch}`);
  console.error(`🔧 使用 Git 命令和 GitLab CLI 进行操作`);
}

// 定义工具
const tools: Tool[] = [
  {
    name: 'gitlab_get_project_info',
    description: '获取当前 GitLab 项目的基本信息（支持 Token 和 SSH 模式）',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'gitlab_get_latest_tags',
    description: '获取 GitLab 项目的最新标签列表（支持 Token 和 SSH 模式）',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: '返回的标签数量限制，默认为 10',
          default: 10,
        },
      },
      required: [],
    },
  },
  {
    name: 'gitlab_create_tag',
    description: '在 GitLab 项目中创建新标签（支持 Token 和 SSH 模式）',
    inputSchema: {
      type: 'object',
      properties: {
        tag_name: {
          type: 'string',
          description: '标签名称（例如：v1.0.0）',
        },
        ref: {
          type: 'string',
          description: '标签指向的分支或提交（例如：main, develop, commit-hash）',
        },
        message: {
          type: 'string',
          description: '标签消息（可选）',
        },
        release_description: {
          type: 'string',
          description: '发布描述（可选，SSH 模式需要 GitLab CLI）',
        },
      },
      required: ['tag_name', 'ref'],
    },
  },
  {
    name: 'gitlab_create_merge_request',
    description: '在 GitLab 项目中创建合并请求（SSH 模式需要 GitLab CLI）',
    inputSchema: {
      type: 'object',
      properties: {
        source_branch: {
          type: 'string',
          description: '源分支名称',
        },
        target_branch: {
          type: 'string',
          description: '目标分支名称',
        },
        title: {
          type: 'string',
          description: '合并请求标题',
        },
        description: {
          type: 'string',
          description: '合并请求描述（可选）',
        },
        remove_source_branch: {
          type: 'boolean',
          description: '合并后是否删除源分支（可选）',
          default: false,
        },
        squash: {
          type: 'boolean',
          description: '是否压缩提交（可选）',
          default: false,
        },
      },
      required: ['source_branch', 'target_branch', 'title'],
    },
  },
];

// 创建 MCP 服务器
const server = new Server(
  {
    name: 'gitlab-mcp-server',
    version: '1.0.0',
  }
);

// 处理工具列表请求
server.setRequestHandler(ListToolsRequestSchema, async () => {
  // 立即返回工具列表，不等待 GitLab 初始化
  return {
    tools,
  };
});

// 处理工具调用请求
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // 确保 GitLab 客户端已初始化
  if (!gitlabClient) {
    return {
      content: [
        {
          type: 'text',
          text: '❌ GitLab 客户端未初始化，请检查配置',
        },
      ],
      isError: true,
    };
  }

  try {
    switch (name) {
      case 'gitlab_get_project_info': {
        const projectInfo = await gitlabClient.getProjectInfo();
        const gitInfo = GitDetector.detectGitInfo();
        const gitConfig = GitDetector.getGitConfig();
        const recentCommits = GitDetector.getRecentCommits();
        
        return {
          content: [
            {
              type: 'text',
              text: `📋 **项目信息**\n\n` +
                    `- **项目名称**: ${projectInfo.name}\n` +
                    `- **项目描述**: ${projectInfo.description || '无描述'}\n` +
                    `- **GitLab URL**: ${gitlabConfig?.url}\n` +
                    `- **项目 ID**: ${projectInfo.id}\n` +
                    `- **项目路径**: ${projectInfo.path_with_namespace}\n` +
                    `- **当前分支**: ${gitInfo.currentBranch}\n` +
                    `- **默认分支**: ${projectInfo.default_branch}\n` +
                    `- **可见性**: ${projectInfo.visibility}\n` +
                    `- **Web URL**: ${projectInfo.web_url}\n\n` +
                    `🔧 **连接模式**: ${useSSHMode ? 'SSH 模式' : 'Token 模式'}\n` +
                    `${useSSHMode ? '- 使用 Git 命令和 GitLab CLI 进行操作\n' : '- 使用 GitLab API 进行操作\n'}` +
                    `\n👤 **Git 配置**\n` +
                    `- **用户名**: ${gitConfig.user.name}\n` +
                    `- **邮箱**: ${gitConfig.user.email}\n\n` +
                    `📝 **最近提交**\n` +
                    `${recentCommits.map(commit => 
                      `- **${commit.shortHash}** ${commit.message} (${commit.author}, ${commit.date})`
                    ).join('\n')}`,
            },
          ],
        };
      }

      case 'gitlab_get_latest_tags': {
        const limit = (args?.limit as number) || 10;
        const tags = await gitlabClient.getLatestTags(limit);
        
        return {
          content: [
            {
              type: 'text',
              text: `获取到 ${tags.length} 个最新标签：\n\n${tags.map(tag => 
                `- **${tag.name}**${tag.message ? `: ${tag.message}` : ''}${tag.commit ? ` (${tag.commit.short_id})` : ''}`
              ).join('\n')}`,
            },
          ],
        };
      }

      case 'gitlab_create_tag': {
        if (!args?.tag_name || !args?.ref) {
          throw new Error('缺少必要的参数: tag_name 和 ref');
        }

        const tagRequest: CreateTagRequest = {
          tag_name: args.tag_name as string,
          ref: args.ref as string,
          message: args.message as string | undefined,
          release_description: args.release_description as string | undefined,
        };

        const tag = await gitlabClient.createTag(tagRequest);
        
        return {
          content: [
            {
              type: 'text',
              text: `✅ 成功创建标签 **${tag.name}**\n\n` +
                    `- 标签名称: ${tag.name}\n` +
                    `- 指向分支: ${args.ref}\n` +
                    `${tag.message ? `- 消息: ${tag.message}\n` : ''}` +
                    `${tag.release?.description ? `- 发布描述: ${tag.release.description}\n` : ''}`,
            },
          ],
        };
      }

      case 'gitlab_create_merge_request': {
        if (!args?.source_branch || !args?.target_branch || !args?.title) {
          throw new Error('缺少必要的参数: source_branch, target_branch 和 title');
        }

        const mrRequest: CreateMergeRequestRequest = {
          source_branch: args.source_branch as string,
          target_branch: args.target_branch as string,
          title: args.title as string,
          description: args.description as string | undefined,
          remove_source_branch: args.remove_source_branch as boolean | undefined,
          squash: args.squash as boolean | undefined,
        };

        const mr = await gitlabClient.createMergeRequest(mrRequest);
        
        return {
          content: [
            {
              type: 'text',
              text: `✅ 成功创建合并请求 **${mr.title}**\n\n` +
                    `- MR ID: !${mr.iid}\n` +
                    `- 标题: ${mr.title}\n` +
                    `- 源分支: ${mr.source_branch}\n` +
                    `- 目标分支: ${mr.target_branch}\n` +
                    `- 状态: ${mr.state}\n` +
                    `- 链接: ${mr.web_url}\n` +
                    `${mr.description ? `- 描述: ${mr.description}\n` : ''}`,
            },
          ],
        };
      }

      default:
        throw new Error(`未知工具: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ 操作失败: ${error instanceof Error ? error.message : '未知错误'}`,
        },
      ],
      isError: true,
    };
  }
});

// 启动服务器
async function main() {
  try {
    // 初始化 GitLab 配置
    await initializeGitLabConfig();
    
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('GitLab MCP 服务器已启动');
  } catch (error) {
    console.error(`❌ 服务器启动失败: ${error instanceof Error ? error.message : '未知错误'}`);
    process.exit(1);
  }
}

main().catch(console.error); 