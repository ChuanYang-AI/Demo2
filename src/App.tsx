import React from 'react';
import './App.css';
import ChatInterface from './components/ChatInterface';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Google Agent API 集成演示</h1>
      </header>
      <main className="App-main">
        <div className="api-info">
          <h2>通过API集成Google Agent</h2>
          <p>这个演示使用Vertex AI Agent Builder REST API与Google Agent进行通信。</p>
        </div>
        <ChatInterface />
      </main>
    </div>
  );
}

export default App;
