/**
 * 服务器启动脚本 - 用于解决路径问题
 * 请使用: node start-server.js
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('当前工作目录:', process.cwd());

// 尝试确定实际server.js的位置
function findServerFile() {
  // 检查当前目录
  if (fs.existsSync('./server.js')) {
    return './server.js';
  }
  
  // 检查gcp-demo-agent子目录
  if (fs.existsSync('./gcp-demo-agent/server.js')) {
    return './gcp-demo-agent/server.js';
  }
  
  // 检查父目录
  if (fs.existsSync('../server.js')) {
    return '../server.js';
  }
  
  throw new Error('无法找到server.js文件，请确保在正确的目录中运行此脚本');
}

try {
  const serverPath = findServerFile();
  console.log('找到server.js路径:', path.resolve(serverPath));
  
  console.log('启动服务器...');
  
  // 使用原生Node.js API启动进程
  const serverProcess = spawn('node', [serverPath], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_DEBUG: 'http,net,stream,tls' // 附加网络调试信息
    }
  });
  
  serverProcess.on('error', (error) => {
    console.error('启动服务器时出错:', error);
  });
  
  serverProcess.on('exit', (code, signal) => {
    if (code !== 0) {
      console.log(`服务器进程异常退出，退出代码: ${code}`);
    }
  });
  
} catch (error) {
  console.error(error.message);
  process.exit(1);
} 