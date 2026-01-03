# 🚀 Real API Setup Guide - Gemini & Firebase

本指南将帮助您设置 Gemini API 和 Firebase 推送通知，这两个服务都有很好的免费试用额度。

## 📋 前置条件

1. Google 账户（用于 Gemini API 和 Firebase）
2. Python 3.8+
3. 已安装项目依赖

## 🔧 Step 1: 安装依赖

```bash
cd ai-agents
pip install -r requirements.txt
```

## 🤖 Step 2: 获取 Gemini API 密钥

### 免费额度（非常慷慨！）

- ✅ **每分钟**: 15 个请求
- ✅ **每天**: 1,500 个请求
- ✅ **完全免费**，无需信用卡
- ✅ 适合开发和测试

### 获取步骤

1. 访问 [Google AI Studio](https://aistudio.google.com/)
2. 使用 Google 账户登录
3. 点击左侧 "Get API Key"
4. 点击 "Create API Key"
5. 选择项目或创建新项目
6. 复制生成的 API 密钥（格式：`AIzaSyC...`）

## 🔔 Step 3: 设置 Firebase 推送通知

### 免费额度

- ✅ **推送通知**: 完全免费
- ✅ **存储**: 1GB 免费
- ✅ **数据库**: 100 个并发连接

### 获取步骤

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 点击 "Add project" 创建新项目
3. 项目名称: `emergency-guardian`（或您喜欢的名称）
4. 可选择启用 Google Analytics
5. 创建完成后，进入项目

### 下载服务账户密钥

1. 点击项目设置 ⚙️ → "Service accounts"
2. 点击 "Generate new private key"
3. 下载 JSON 文件
4. 将文件重命名为 `firebase-service-account.json`
5. 放在 `ai-agents/config/` 目录下

## ⚙️ Step 4: 配置环境变量

1. 复制示例配置文件：

```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，填入您的 API 密钥：

```bash
# AI 分析服务 (Gemini API)
GEMINI_API_KEY=AIzaSyC-your-actual-gemini-api-key-here

# 推送通知服务 (Firebase)
FIREBASE_CREDENTIALS_PATH=config/firebase-service-account.json

# 启用真实API服务
USE_REAL_GEMINI=true
USE_REAL_FIREBASE=true
USE_MOCK_NOTIFICATIONS=true

# 其他服务保持Mock模式
WEB3_PROVIDER_URL=https://rpc.sepolia.org
AI_AGENT_PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

## 🧪 Step 5: 测试 API 连接

运行测试脚本：

```bash
python test_real_apis.py
```

### 预期输出

```
🧪 Emergency Guardian - Real API Testing
============================================================

📋 Configuration Status:
   Gemini API: ✅ Enabled
   Firebase: ✅ Enabled

🤖 Testing Gemini API Connection...
   📤 Sending test request to Gemini...
   📥 Response received:
   {
     "severity": "HIGH",
     "urgency": 85,
     "recommendation": "建议立即就医"
   }...
   📊 API Usage Info:
   ✅ Model: gemini-1.5-flash
   ✅ Response length: 245 characters
   ✅ Free tier: 15 requests/minute, 1500 requests/day

🔔 Testing Firebase Push Notifications...
   ✅ Firebase initialized successfully
   ✅ Test message created successfully
   📱 Message structure:
      Title: 🚨 Emergency Guardian Test
      Body: Firebase推送通知测试成功！

🔗 Testing Integrated Emergency System...
   📋 Processing test emergency with real APIs...
   ✅ Emergency processed successfully!
      Proposal ID: emergency_REAL_API_TEST_001_1767384567
      AI Confidence: 92.0%
      Severity: high
      Urgency Score: 85

============================================================
📊 Test Results Summary:
   Gemini API: ✅ PASSED
   Firebase Push: ✅ PASSED
   Integrated System: ✅ PASSED

🎯 Overall: 3/3 tests passed
🎉 All tests passed! Your real APIs are working correctly.
```

## 🎯 Step 6: 运行完整系统测试

测试完整的紧急协调流程：

```bash
python test_integrated_emergency_flow.py
```

现在系统将使用真实的 Gemini AI 进行医疗分析，而不是 Mock 响应！

## 💡 使用提示

### Gemini API 最佳实践

1. **请求频率**: 保持在每分钟 15 个请求以内
2. **提示优化**: 使用清晰、结构化的提示词
3. **错误处理**: 处理 API 限制和网络错误
4. **成本控制**: 免费额度足够开发使用

### Firebase 推送通知

1. **设备 Token**: 需要移动应用获取设备注册 token
2. **消息格式**: 支持通知和数据消息
3. **批量发送**: 可以批量发送给多个设备
4. **统计分析**: Firebase Console 提供详细统计

## 🔍 故障排除

### Gemini API 常见问题

- **API_KEY_INVALID**: 检查 API 密钥是否正确
- **QUOTA_EXCEEDED**: 等待配额重置或升级计划
- **网络错误**: 检查网络连接

### Firebase 常见问题

- **Credentials 错误**: 检查 JSON 文件路径和格式
- **权限问题**: 确保服务账户有正确权限
- **初始化失败**: 检查项目 ID 和配置

## 📈 监控使用情况

### Gemini API 使用监控

- 访问 [Google Cloud Console](https://console.cloud.google.com/)
- 查看 API 使用情况和配额

### Firebase 使用监控

- 访问 [Firebase Console](https://console.firebase.google.com/)
- 查看推送通知统计和使用情况

## 🚀 下一步

1. ✅ Gemini API - AI 分析功能已启用
2. ✅ Firebase - 推送通知已配置
3. 🔄 可选：添加 SendGrid 邮件通知
4. 🔄 可选：添加 Twilio 短信通知
5. 🔄 部署到生产环境

现在您的 Emergency Guardian 系统已经具备真实的 AI 分析能力！🎉
