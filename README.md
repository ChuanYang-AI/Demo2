# Google Agent API 集成演示

这个项目展示了如何通过API方式集成Google Dialogflow Agents。与使用Web Messenger相比，API集成方式提供了更大的灵活性和定制能力。

## 项目概述

- 使用React前端创建自定义聊天界面
- 使用Express后端代理API请求到Google Dialogflow
- 通过OAuth认证与Dialogflow API通信

## 技术栈

- 前端：React + TypeScript + CSS
- 后端：Node.js + Express
- API：Google Dialogflow API (Vertex AI Agent Builder)

## 先决条件

1. 安装Node.js和npm
2. 安装Google Cloud CLI (gcloud)
3. 拥有有效的Google Cloud项目，并启用Dialogflow API

## 快速开始

### 1. 克隆仓库
```bash
git clone git@gitlab.liebaopay.com:ai/gcp-demo-agent.git
cd gcp-demo-agent
```

### 2. 安装依赖
```bash
npm install
```

### 3. 认证设置

Google Dialogflow API需要使用OAuth认证。请按照以下步骤设置：

#### 使用用户凭据（推荐用于开发）

```bash
# 安装gcloud命令行工具（如果尚未安装）
# 然后登录并设置应用默认凭据
gcloud auth application-default login

# 重要：设置配额项目
gcloud auth application-default set-quota-project cy-aispeci-demo
```

### 4. 构建前端应用
```bash
npm run build
```

### 5. 启动开发服务器
```bash
npm run dev
```

这将同时启动React前端（端口3000）和Express后端（端口5001）。

### 6. 访问应用
在浏览器中访问 http://localhost:3000

## 功能特点

- 自定义聊天界面
- 完整的会话管理
- 实时打字指示器
- 响应式设计
- 安全的OAuth认证

## 常见问题解决

### 1. "Cannot find module" 错误

确保已运行`npm install`安装所有依赖。

### 2. "ENOENT: no such file or directory, stat '.../build/index.html'" 错误

这表示您尚未构建React应用。请先运行：
```bash
npm run build
```

### 3. 认证错误

如果您看到认证错误，请确保：

- 使用了正确的API端点 (dialogflow.googleapis.com)
- 设置了配额项目 (x-goog-user-project header)
- 使用了正确的OAuth令牌
- 成功运行了 `gcloud auth application-default login`
- 成功运行了 `gcloud auth application-default set-quota-project cy-aispeci-demo`

### 4. 服务未启用错误

确保在Google Cloud控制台中为您的项目启用了Dialogflow API：
- 访问 [API库](https://console.cloud.google.com/apis/library)
- 搜索"Dialogflow API"
- 点击"启用" 