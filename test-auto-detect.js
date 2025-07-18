#!/usr/bin/env node

import { GitDetector } from './dist/git-detector.js';

console.log('🔍 测试 GitLab 自动检测功能...\n');

// 检测 Git 信息
console.log('1. 检测 Git 仓库信息:');
const gitInfo = GitDetector.detectGitInfo();
console.log(gitInfo);

if (gitInfo.isGitRepo) {
  console.log('\n2. 解析 GitLab 信息:');
  const gitlabInfo = GitDetector.parseGitLabInfo(gitInfo);
  console.log(gitlabInfo);

  console.log('\n3. 获取 Git 配置:');
  const gitConfig = GitDetector.getGitConfig();
  console.log(gitConfig);

  console.log('\n4. 获取最近提交:');
  const recentCommits = GitDetector.getRecentCommits();
  console.log(recentCommits);

  if (process.env.GITLAB_TOKEN) {
    console.log('\n5. 测试 GitLab API 连接:');
    try {
      const projectId = await GitDetector.getProjectId(
        gitlabInfo.gitlabUrl,
        gitlabInfo.projectPath,
        process.env.GITLAB_TOKEN
      );
      console.log('项目 ID:', projectId);
    } catch (error) {
      console.log('API 连接失败:', error.message);
    }
  } else {
    console.log('\n5. 跳过 API 测试 (未设置 GITLAB_TOKEN)');
  }
} else {
  console.log('❌ 当前目录不是 Git 仓库');
}

console.log('\n✅ 测试完成'); 