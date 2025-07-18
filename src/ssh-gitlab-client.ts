import { execSync } from 'child_process';
import { GitLabConfig, Tag, CreateTagRequest, MergeRequest, CreateMergeRequestRequest } from './types.js';

export class SSHGitLabClient {
  private config: GitLabConfig;

  constructor(config: GitLabConfig) {
    this.config = config;
  }

  /**
   * 通过 Git 命令获取标签列表
   */
  async getLatestTags(limit: number = 10): Promise<Tag[]> {
    try {
      // 使用 git ls-remote 获取远程标签
      const output = execSync('git ls-remote --tags origin', {
        cwd: process.cwd(),
        encoding: 'utf8',
      });

      const lines = output.trim().split('\n').filter(line => line);
      const tags: Tag[] = [];

      for (const line of lines) {
        const [hash, ref] = line.split('\t');
        const tagName = ref.replace('refs/tags/', '');
        
        // 跳过轻量标签的引用
        if (ref.endsWith('^{}')) continue;

        tags.push({
          name: tagName,
          commit: {
            id: hash,
            short_id: hash.substring(0, 8),
            title: `Tag: ${tagName}`,
            created_at: new Date().toISOString(),
          },
          protected: false,
        });
      }

      // 按版本号排序（降序）
      tags.sort((a, b) => this.compareVersions(b.name, a.name));
      
      return tags.slice(0, limit);
    } catch (error) {
      throw new Error(`获取标签失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 通过 Git 命令创建标签
   */
  async createTag(tagRequest: CreateTagRequest): Promise<Tag> {
    try {
      const { tag_name, ref, message } = tagRequest;

      // 创建本地标签
      if (message) {
        execSync(`git tag -a ${tag_name} ${ref} -m "${message}"`, {
          cwd: process.cwd(),
        });
      } else {
        execSync(`git tag ${tag_name} ${ref}`, {
          cwd: process.cwd(),
        });
      }

      // 推送标签到远程
      execSync(`git push origin ${tag_name}`, {
        cwd: process.cwd(),
      });

      // 如果有发布描述，创建 GitLab Release
      if (tagRequest.release_description) {
        await this.createGitLabRelease(tag_name, tagRequest.release_description);
      }

      return {
        name: tag_name,
        message,
        commit: {
          id: execSync(`git rev-parse ${ref}`, { cwd: process.cwd(), encoding: 'utf8' }).trim(),
          short_id: execSync(`git rev-parse --short ${ref}`, { cwd: process.cwd(), encoding: 'utf8' }).trim(),
          title: `Tag: ${tag_name}`,
          created_at: new Date().toISOString(),
        },
        protected: false,
      };
    } catch (error) {
      throw new Error(`创建标签失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 通过 Git 命令创建合并请求（使用 GitLab CLI）
   */
  async createMergeRequest(mrRequest: CreateMergeRequestRequest): Promise<MergeRequest> {
    try {
      // 检查是否安装了 GitLab CLI
      try {
        execSync('glab --version', { stdio: 'ignore' });
      } catch {
        throw new Error('需要安装 GitLab CLI (glab)。请运行: brew install glab 或访问 https://gitlab.com/gitlab-org/cli');
      }

      // 构建 glab 命令
      const args = [
        'mr', 'create',
        '--source-branch', mrRequest.source_branch,
        '--target-branch', mrRequest.target_branch,
        '--title', mrRequest.title,
      ];

      if (mrRequest.description) {
        args.push('--description', mrRequest.description);
      }

      if (mrRequest.remove_source_branch) {
        args.push('--delete-source-branch');
      }

      if (mrRequest.squash) {
        args.push('--squash');
      }

      // 执行命令
      const output = execSync(`glab ${args.join(' ')}`, {
        cwd: process.cwd(),
        encoding: 'utf8',
      });

      // 解析输出获取 MR 信息
      const mrMatch = output.match(/!(\d+)/);
      const mrId = mrMatch ? parseInt(mrMatch[1]) : 0;

      return {
        id: mrId,
        iid: mrId,
        title: mrRequest.title,
        description: mrRequest.description,
        state: 'opened',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        target_branch: mrRequest.target_branch,
        source_branch: mrRequest.source_branch,
        web_url: `${this.config.url}/${this.config.projectId}/-/merge_requests/${mrId}`,
      };
    } catch (error) {
      throw new Error(`创建合并请求失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取项目信息
   */
  async getProjectInfo() {
    try {
      // 使用 git remote 获取项目信息
      const remoteUrl = execSync('git remote get-url origin', {
        cwd: process.cwd(),
        encoding: 'utf8',
      }).trim();

      const currentBranch = execSync('git branch --show-current', {
        cwd: process.cwd(),
        encoding: 'utf8',
      }).trim();

      const defaultBranch = execSync('git symbolic-ref refs/remotes/origin/HEAD', {
        cwd: process.cwd(),
        encoding: 'utf8',
      }).trim().replace('refs/remotes/origin/', '');

      return {
        id: this.config.projectId,
        name: remoteUrl.split('/').pop()?.replace('.git', '') || 'Unknown',
        description: '',
        path_with_namespace: remoteUrl.replace(/^.*?[:/](.+?)\.git$/, '$1'),
        default_branch: defaultBranch,
        visibility: 'private',
        web_url: remoteUrl.replace('.git', ''),
      };
    } catch (error) {
      throw new Error(`获取项目信息失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 创建 GitLab Release（使用 GitLab CLI）
   */
  private async createGitLabRelease(tagName: string, description: string): Promise<void> {
    try {
      execSync(`glab release create ${tagName} --notes "${description}"`, {
        cwd: process.cwd(),
      });
    } catch (error) {
      console.warn(`创建 GitLab Release 失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 比较版本号
   */
  private compareVersions(a: string, b: string): number {
    const normalize = (v: string) => {
      return v.replace(/^v/, '').split('.').map(n => parseInt(n) || 0);
    };

    const va = normalize(a);
    const vb = normalize(b);

    for (let i = 0; i < Math.max(va.length, vb.length); i++) {
      const na = va[i] || 0;
      const nb = vb[i] || 0;
      if (na !== nb) {
        return na - nb;
      }
    }

    return 0;
  }
} 