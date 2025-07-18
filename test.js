#!/usr/bin/env node

import { spawn } from 'child_process';
import { writeFileSync } from 'fs';

// 测试配置
const testConfig = {
  GITLAB_URL: 'https://gitlab.com',
  GITLAB_TOKEN: process.env.GITLAB_TOKEN || 'test_token',
  GITLAB_PROJECT_ID: process.env.GITLAB_PROJECT_ID || '12345',
};

// 创建测试用的 .env 文件
const envContent = `GITLAB_URL=${testConfig.GITLAB_URL}
GITLAB_TOKEN=${testConfig.GITLAB_TOKEN}
GITLAB_PROJECT_ID=${testConfig.GITLAB_PROJECT_ID}
DEFAULT_BRANCH=main
`;

writeFileSync('.env', envContent);

console.log('🚀 启动 GitLab MCP 服务器测试...');
console.log('配置信息:');
console.log(`- GitLab URL: ${testConfig.GITLAB_URL}`);
console.log(`- Project ID: ${testConfig.GITLAB_PROJECT_ID}`);
console.log(`- Token: ${testConfig.GITLAB_TOKEN.substring(0, 10)}...`);
console.log('');

// 启动服务器
const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env, ...testConfig }
});

server.stdout.on('data', (data) => {
  console.log('服务器输出:', data.toString());
});

server.stderr.on('data', (data) => {
  console.log('服务器错误:', data.toString());
});

server.on('close', (code) => {
  console.log(`服务器退出，代码: ${code}`);
});

// 5秒后关闭服务器
setTimeout(() => {
  console.log('⏰ 测试完成，关闭服务器...');
  server.kill();
  process.exit(0);
}, 5000); 