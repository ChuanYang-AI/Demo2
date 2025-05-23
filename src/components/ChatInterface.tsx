import React, { useState, useEffect, useRef } from 'react';
import agentService from '../services/agentService';
import './ChatInterface.css';

// 消息类型
interface Message {
  role: 'user' | 'agent';
  content: string;
  timestamp?: string;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 初始化聊天会话
  useEffect(() => {
    const initSession = async () => {
      await agentService.createSession();
      
      // 添加欢迎消息
      setMessages([
        {
          role: 'agent',
          content: '你好！我是AI助手，有什么可以帮助你的吗？',
          timestamp: new Date().toISOString()
        }
      ]);
    };
    
    initSession();
    
    // 组件卸载时结束会话
    return () => {
      agentService.endSession();
    };
  }, []);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 发送消息
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // 添加用户消息
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // 获取Agent回复
      const agentResponse = await agentService.sendMessage(input);
      setMessages(prevMessages => [...prevMessages, agentResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      // 添加错误消息
      setMessages(prevMessages => [
        ...prevMessages,
        {
          role: 'agent',
          content: '发生错误，请稍后再试。',
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>AI 助手</h2>
      </div>
      
      <div className="messages-container">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`message ${message.role === 'user' ? 'user-message' : 'agent-message'}`}
          >
            <div className="message-content">{message.content}</div>
            {message.timestamp && (
              <div className="message-timestamp">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="message agent-message">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form className="input-container" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入消息..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()}>
          发送
        </button>
      </form>
    </div>
  );
};

export default ChatInterface; 