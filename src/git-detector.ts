import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export interface GitInfo {
  remoteUrl: string;
  currentBranch: string;
  projectPath: string;
  isGitRepo: boolean;
}

export interface GitLabInfo {
  gitlabUrl: string;
  projectPath: string;
  currentBranch: string;
}

export class GitDetector {
  /**
   * 检测当前目录的 Git 信息
   */
  static detectGitInfo(projectPath: string = process.cwd()): GitInfo {
    try {
      // 检查是否是 Git 仓库
      const gitDir = join(projectPath, '.git');
      if (!existsSync(gitDir)) {
        return {
          remoteUrl: '',
          currentBranch: '',
          projectPath,
          isGitRepo: false,
        };
      }

      // 获取远程仓库 URL
      const remoteUrl = execSync('git remote get-url origin', {
        cwd: projectPath,
        encoding: 'utf8',
      }).trim();

      // 获取当前分支
      const currentBranch = execSync('git branch --show-current', {
        cwd: projectPath,
        encoding: 'utf8',
      }).trim();

      return {
        remoteUrl,
        currentBranch,
        projectPath,
        isGitRepo: true,
      };
    } catch (error) {
      return {
        remoteUrl: '',
        currentBranch: '',
        projectPath,
        isGitRepo: false,
      };
    }
  }

  /**
   * 从 Git 远程 URL 解析 GitLab 信息
   */
  static parseGitLabInfo(gitInfo: GitInfo): GitLabInfo | null {
    if (!gitInfo.isGitRepo || !gitInfo.remoteUrl) {
      return null;
    }

    const { remoteUrl } = gitInfo;

    // 支持多种 GitLab URL 格式
    let gitlabUrl = '';
    let projectPath = '';

    // HTTPS 格式: https://gitlab.com/group/project.git
    if (remoteUrl.startsWith('https://')) {
      const url = new URL(remoteUrl);
      gitlabUrl = `${url.protocol}//${url.host}`;
      projectPath = url.pathname.replace(/\.git$/, '').replace(/^\//, '');
    }
    // SSH 格式: git@gitlab.com:group/project.git
    else if (remoteUrl.startsWith('git@')) {
      const match = remoteUrl.match(/git@([^:]+):(.+)\.git/);
      if (match) {
        gitlabUrl = `https://${match[1]}`;
        projectPath = match[2];
      }
    }
    // 其他格式
    else {
      return null;
    }

    if (!gitlabUrl || !projectPath) {
      return null;
    }

    return {
      gitlabUrl,
      projectPath,
      currentBranch: gitInfo.currentBranch,
    };
  }

  /**
   * 获取项目 ID（需要调用 GitLab API）
   */
  static async getProjectId(gitlabUrl: string, projectPath: string, token: string): Promise<string | null> {
    try {
      const { default: axios } = await import('axios');
      
      const response = await axios.get(`${gitlabUrl}/api/v4/projects/${encodeURIComponent(projectPath)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return response.data.id.toString();
    } catch (error) {
      console.error('获取项目 ID 失败:', error);
      return null;
    }
  }

  /**
   * 检测 GitLab 配置
   */
  static async detectGitLabConfig(token: string, projectPath?: string): Promise<{
    gitlabUrl: string;
    projectId: string;
    currentBranch: string;
  } | null> {
    const gitInfo = this.detectGitInfo(projectPath);
    
    if (!gitInfo.isGitRepo) {
      throw new Error('当前目录不是 Git 仓库');
    }

    const gitlabInfo = this.parseGitLabInfo(gitInfo);
    
    if (!gitlabInfo) {
      throw new Error('无法解析 GitLab 仓库信息');
    }

    const projectId = await this.getProjectId(gitlabInfo.gitlabUrl, gitlabInfo.projectPath, token);
    
    if (!projectId) {
      throw new Error('无法获取项目 ID，请检查 Token 权限');
    }

    return {
      gitlabUrl: gitlabInfo.gitlabUrl,
      projectId,
      currentBranch: gitlabInfo.currentBranch,
    };
  }

  /**
   * 获取 Git 配置信息
   */
  static getGitConfig(projectPath: string = process.cwd()): { user: { name: string; email: string } } {
    try {
      const name = execSync('git config user.name', {
        cwd: projectPath,
        encoding: 'utf8',
      }).trim();

      const email = execSync('git config user.email', {
        cwd: projectPath,
        encoding: 'utf8',
      }).trim();

      return { user: { name, email } };
    } catch (error) {
      return { user: { name: '', email: '' } };
    }
  }

  /**
   * 获取最近的提交信息
   */
  static getRecentCommits(projectPath: string = process.cwd(), limit: number = 5): Array<{
    hash: string;
    shortHash: string;
    message: string;
    author: string;
    date: string;
  }> {
    try {
      const output = execSync(
        `git log --oneline --format="%H|%h|%s|%an|%ad" --date=short -${limit}`,
        { cwd: projectPath, encoding: 'utf8' }
      );

      return output.trim().split('\n').map(line => {
        const [hash, shortHash, message, author, date] = line.split('|');
        return { hash, shortHash, message, author, date };
      });
    } catch (error) {
      return [];
    }
  }
} 