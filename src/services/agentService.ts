import axios from 'axios';

// API基础URL
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // 生产环境中使用相对路径
  : 'http://localhost:5002/api';  // 开发环境中使用本地服务器

// 消息接口
interface Message {
  role: 'user' | 'agent';
  content: string;
  timestamp?: string;
}

// 会话ID
let sessionId = '';

/**
 * 创建一个新的会话
 */
export const createSession = async (): Promise<string> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/session`);
    sessionId = response.data.sessionId;
    return sessionId;
  } catch (error) {
    console.error('Failed to create session:', error);
    throw new Error('无法创建聊天会话');
  }
};

/**
 * 发送消息给Agent并获取回复
 */
export const sendMessage = async (message: string): Promise<Message> => {
  try {
    if (!sessionId) {
      await createSession();
    }
    
    const response = await axios.post(`${API_BASE_URL}/message`, {
      sessionId,
      message
    });
    
    return {
      role: 'agent',
      content: response.data.response,
      timestamp: response.data.timestamp
    };
  } catch (error) {
    console.error('Agent API Error:', error);
    return {
      role: 'agent',
      content: '与Agent通信时发生错误，请稍后再试。',
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * 结束会话
 */
export const endSession = (): void => {
  sessionId = '';
};

export default {
  createSession,
  sendMessage,
  endSession
}; 