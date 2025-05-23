const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');
require('dotenv').config();

const app = express();
const PORT = process.env.API_PORT || 5002;

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件服务
app.use(express.static(path.join(__dirname, 'build')));

// 环境变量
const PROJECT_ID = process.env.PROJECT_ID || 'cy-aispeci-demo';
const AGENT_ID = process.env.AGENT_ID || 'deepvo_1743070579556';
const LOCATION = process.env.LOCATION || 'global';
const LANGUAGE_CODE = process.env.LANGUAGE_CODE || 'zh-cn';

// 为Dialogflow API初始化GoogleAuth
const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  projectId: PROJECT_ID // 明确设置配额项目
});

// API基础URL和端点选择
let DIALOGFLOW_API_ENDPOINT = 'dialogflow.googleapis.com:443';
if (LOCATION !== 'global') {
  DIALOGFLOW_API_ENDPOINT = `${LOCATION}-dialogflow.googleapis.com:443`;
}
console.log(`Using API endpoint: ${DIALOGFLOW_API_ENDPOINT}`);

const DIALOGFLOW_API_BASE = `https://${DIALOGFLOW_API_ENDPOINT.replace(':443', '')}/v3`;

// 会话存储
const sessions = {};

// 获取OAuth令牌
async function getAuthToken() {
  try {
    console.log('开始获取OAuth令牌...');
    console.log('使用项目ID:', PROJECT_ID);
    console.log('使用凭据路径:', process.env.GOOGLE_APPLICATION_CREDENTIALS || '默认路径');
    
    const client = await auth.getClient();
    console.log('已获取客户端，请求访问令牌...');
    
    const token = await client.getAccessToken();
    console.log('成功获取访问令牌');
    console.log(`使用配额项目: ${PROJECT_ID}`);
    
    return token.token;
  } catch (error) {
    console.error('获取认证令牌时出错:');
    console.error('错误类型:', error.constructor.name);
    console.error('错误消息:', error.message);
    console.error('错误堆栈:', error.stack);
    
    if (error.response) {
      console.error('API响应数据:', JSON.stringify(error.response.data, null, 2));
      console.error('API响应状态:', error.response.status);
      console.error('API响应头:', JSON.stringify(error.response.headers, null, 2));
    }
    
    throw error;
  }
}

// 创建或获取会话
app.post('/api/session', async (req, res) => {
  try {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessions[sessionId] = {
      messages: []
    };
    res.status(200).json({ sessionId });
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// 发送消息到Agent
app.post('/api/message', async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({ error: 'Session ID and message are required' });
    }
    
    if (!sessions[sessionId]) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // 构建正确的会话路径
    const sessionPath = `projects/${PROJECT_ID}/locations/${LOCATION}/agents/${AGENT_ID}/sessions/${sessionId}`;
    const requestUrl = `${DIALOGFLOW_API_BASE}/${sessionPath}:detectIntent`;
    console.log(`Session path: ${sessionPath}`);
    console.log(`Sending request to: ${requestUrl}`);
    
    // 获取OAuth令牌
    const token = await getAuthToken();
    console.log('Retrieved OAuth token');
    
    // 构建Headers
    const headers = { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-goog-user-project': PROJECT_ID  // 明确指定配额项目
    };
    
    console.log('Request headers:', JSON.stringify({
      'Content-Type': headers['Content-Type'],
      'Authorization': 'Bearer [REDACTED]',
      'x-goog-user-project': headers['x-goog-user-project']
    }));
    
    // 构建正确的请求体
    const requestBody = {
      queryInput: {
        text: {
          text: message
        },
        languageCode: LANGUAGE_CODE
      }
    };
    
    console.log('Request payload:', JSON.stringify(requestBody, null, 2));
    
    // 向Dialogflow发送请求
    const response = await axios.post(requestUrl, requestBody, { headers });
    
    console.log('Response status:', response.status);
    
    // 解析响应 - Dialogflow API格式
    let agentResponse = '抱歉，我无法理解您的请求';
    
    if (response.data && response.data.queryResult) {
      if (response.data.queryResult.responseMessages && 
          response.data.queryResult.responseMessages.length > 0 &&
          response.data.queryResult.responseMessages[0].text &&
          response.data.queryResult.responseMessages[0].text.text &&
          response.data.queryResult.responseMessages[0].text.text.length > 0) {
        agentResponse = response.data.queryResult.responseMessages[0].text.text[0];
      } else if (response.data.queryResult.text) {
        agentResponse = response.data.queryResult.text;
      }
    }
    
    console.log('Agent response:', agentResponse);
    
    // 更新会话
    sessions[sessionId].messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });
    
    sessions[sessionId].messages.push({
      role: 'agent',
      content: agentResponse,
      timestamp: new Date().toISOString()
    });
    
    res.status(200).json({ 
      response: agentResponse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Agent API error:', error.response?.data || error.message);
    console.error('Full error details:', JSON.stringify(error.response?.data, null, 2));
    res.status(500).json({ error: 'Failed to communicate with Agent API' });
  }
});

// 前端路由处理
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 