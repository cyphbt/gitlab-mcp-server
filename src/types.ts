export interface GitLabConfig {
  url: string;
  token: string;
  projectId: string;
  defaultBranch?: string;
}

export interface Tag {
  name: string;
  message?: string;
  commit?: {
    id: string;
    short_id: string;
    title: string;
    created_at: string;
  };
  release?: {
    tag_name: string;
    description: string;
  };
  protected: boolean;
}

export interface CreateTagRequest {
  tag_name: string;
  ref: string;
  message?: string;
  release_description?: string;
}

export interface MergeRequest {
  id: number;
  iid: number;
  title: string;
  description?: string;
  state: string;
  created_at: string;
  updated_at: string;
  target_branch: string;
  source_branch: string;
  web_url: string;
}

export interface CreateMergeRequestRequest {
  source_branch: string;
  target_branch: string;
  title: string;
  description?: string;
  remove_source_branch?: boolean;
  squash?: boolean;
}

export interface GitLabApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
} 