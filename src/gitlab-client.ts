import axios, { AxiosInstance } from 'axios';
import { GitLabConfig, Tag, CreateTagRequest, MergeRequest, CreateMergeRequestRequest } from './types.js';

export class GitLabClient {
  private client: AxiosInstance;
  private config: GitLabConfig;

  constructor(config: GitLabConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: `${config.url}/api/v4`,
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * 获取最新的标签列表
   */
  async getLatestTags(limit: number = 10): Promise<Tag[]> {
    try {
      const response = await this.client.get(`/projects/${this.config.projectId}/repository/tags`, {
        params: {
          per_page: limit,
          order_by: 'version',
          sort: 'desc'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`获取标签失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 创建新标签
   */
  async createTag(tagRequest: CreateTagRequest): Promise<Tag> {
    try {
      const response = await this.client.post(`/projects/${this.config.projectId}/repository/tags`, tagRequest);
      return response.data;
    } catch (error) {
      throw new Error(`创建标签失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取合并请求列表
   */
  async getMergeRequests(state: 'opened' | 'closed' | 'merged' | 'all' = 'opened', limit: number = 10): Promise<MergeRequest[]> {
    try {
      const response = await this.client.get(`/projects/${this.config.projectId}/merge_requests`, {
        params: {
          state,
          per_page: limit,
          order_by: 'created_at',
          sort: 'desc'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`获取合并请求失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 创建合并请求
   */
  async createMergeRequest(mrRequest: CreateMergeRequestRequest): Promise<MergeRequest> {
    try {
      const response = await this.client.post(`/projects/${this.config.projectId}/merge_requests`, mrRequest);
      return response.data;
    } catch (error) {
      throw new Error(`创建合并请求失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取项目信息
   */
  async getProjectInfo() {
    try {
      const response = await this.client.get(`/projects/${this.config.projectId}`);
      return response.data;
    } catch (error) {
      throw new Error(`获取项目信息失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
} 