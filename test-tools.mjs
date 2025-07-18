#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('🔍 测试工具列表...');

const child = spawn('gitlab-mcp', {
  stdio: ['pipe', 'pipe', 'pipe']
});

// 发送初始化请求
const initRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'cursor',
      version: '1.0.0'
    }
  }
};

console.log('📤 发送初始化请求...');
child.stdin.write(JSON.stringify(initRequest) + '\n');

let hasRequestedTools = false;
let responseBuffer = '';

child.stdout.on('data', (data) => {
  const dataStr = data.toString();
  responseBuffer += dataStr;
  console.log('📥 收到原始数据:', dataStr);
  
  // 尝试解析 JSON 响应
  const lines = responseBuffer.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    try {
      const response = JSON.parse(line);
      console.log('📋 解析的响应:', JSON.stringify(response, null, 2));
      
      if (response.method === 'initialize' && response.result && !hasRequestedTools) {
        console.log('✅ 初始化成功，发送工具列表请求...');
        hasRequestedTools = true;
        
        // 发送工具列表请求
        const toolsListRequest = {
          jsonrpc: '2.0',
          id: 2,
          method: 'tools/list'
        };
        
        console.log('📤 发送工具列表请求:', JSON.stringify(toolsListRequest));
        child.stdin.write(JSON.stringify(toolsListRequest) + '\n');
      }
      
      if (response.method === 'tools/list' && response.result) {
        console.log('✅ 工具列表获取成功！');
        console.log('📋 工具数量:', response.result.tools?.length || 0);
        child.kill();
        process.exit(0);
      }
    } catch (e) {
      // 忽略解析错误
    }
  }
});

child.stderr.on('data', (data) => {
  console.log('❌ 错误:', data.toString());
});

setTimeout(() => {
  console.log('⏰ 超时');
  child.kill();
  process.exit(1);
}, 15000); 