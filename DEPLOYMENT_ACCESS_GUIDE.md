# Emergency Guardian 系统访问指南

## 🌐 当前访问方式

### ✅ 本地开发环境 (立即可用)

#### 1. **前端网站**

- **访问地址**: http://localhost:5173
- **状态**: ✅ 运行中
- **功能**:
  - 完整的用户界面
  - 钱包连接 (MetaMask)
  - 紧急情况管理
  - 监护人配置
  - 已连接到 Sepolia 测试网合约

#### 2. **AI 代理服务 API**

- **访问地址**: http://localhost:8001
- **健康检查**: http://localhost:8001/health
- **API 文档**: http://localhost:8001 (根路径显示所有端点)
- **功能**:
  - 紧急情况 AI 分析
  - 多渠道通知系统
  - 个性化操作手册
  - 用户配置管理

#### 3. **智能合约 (Sepolia 测试网)**

- **网络**: Sepolia 测试网 (公开可访问)
- **主合约**: `0x6af445EA589D8f550a3D1dacf34745071a4D5b4F`
- **ZK 验证合约**: `0xf9D10528B5b1837cd12be6A449475a1288832263`
- **区块链浏览器**:
  - [主合约](https://sepolia.etherscan.io/address/0x6af445EA589D8f550a3D1dacf34745071a4D5b4F)
  - [ZK 验证合约](https://sepolia.etherscan.io/address/0xf9D10528B5b1837cd12be6A449475a1288832263)

## 🚀 如何使用当前系统

### 步骤 1: 访问前端网站

1. 打开浏览器访问: http://localhost:5173
2. 连接 MetaMask 钱包
3. 切换到 Sepolia 测试网 (Chain ID: 11155111)
4. 确保有一些 Sepolia ETH (可从水龙头获取)

### 步骤 2: 配置监护人

1. 在前端界面添加监护人地址
2. 设置紧急联系信息
3. 配置个人偏好设置

### 步骤 3: 测试紧急功能

1. 创建紧急提议
2. 查看 AI 分析结果
3. 测试通知系统
4. 验证多签流程

## 🌍 部署到公网 (可选)

如果您想让其他人也能访问，可以按以下步骤部署到公网：

### 前端部署到 Vercel

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 在 frontend 目录下部署
cd frontend
vercel --prod

# 3. 按提示配置项目
# - 选择项目名称
# - 确认构建设置
# - 等待部署完成
```

### AI 服务部署到 Railway

```bash
# 1. 安装 Railway CLI
npm install -g @railway/cli

# 2. 在 ai-agents 目录下部署
cd ai-agents
railway login
railway init
railway up

# 3. 配置环境变量
railway variables set USE_MOCK_NOTIFICATIONS=true
railway variables set LOG_LEVEL=INFO
```

## 📱 移动端访问

### 本地网络访问

如果您想在手机上测试，可以：

1. 确保手机和电脑在同一 WiFi 网络
2. 找到电脑的 IP 地址 (如 192.168.1.100)
3. 在手机浏览器访问: http://192.168.1.100:5173

### 获取电脑 IP 地址

```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig | findstr "IPv4"
```

## 🔧 系统配置信息

### 智能合约配置

- **网络**: Sepolia 测试网
- **Chain ID**: 11155111
- **RPC URL**: https://ethereum-sepolia-rpc.publicnode.com
- **紧急时间锁**: 1 小时
- **监护人变更时间锁**: 24 小时
- **多签阈值**: Level 1(1 签名), Level 2(2 签名), Level 3(3 签名)

### AI 服务配置

- **模式**: Mock 模式 (无需真实 API 密钥)
- **Gemini AI**: 模拟模式
- **通知服务**: 模拟模式
- **数据库**: 内存存储

### 前端配置

- **框架**: React + TypeScript + Vite
- **钱包支持**: MetaMask, WalletConnect
- **网络**: 自动连接到 Sepolia

## 🧪 测试功能

### 可测试的完整功能

1. ✅ **钱包连接和网络切换**
2. ✅ **监护人管理和配置**
3. ✅ **紧急提议创建和投票**
4. ✅ **AI 紧急情况分析**
5. ✅ **多渠道通知系统**
6. ✅ **个性化操作手册**
7. ✅ **智能合约交互**
8. ✅ **实时状态更新**

### 测试用例

1. **基础流程**: 连接钱包 → 添加监护人 → 创建紧急提议
2. **AI 分析**: 提交医疗紧急情况 → 查看 AI 分析结果
3. **通知测试**: 发送紧急通知 → 查看通知状态
4. **个性化**: 创建个人资料 → 生成定制操作手册

## 📊 系统状态监控

### 健康检查端点

- **前端**: http://localhost:5173 (页面加载正常)
- **AI 服务**: http://localhost:8001/health
- **合约状态**: 通过 Etherscan 查看交易历史

### 日志查看

```bash
# AI 服务日志
curl http://localhost:8001/api/v1/status

# 前端控制台
# 打开浏览器开发者工具查看
```

## 🎯 下一步计划

### 立即可做

1. ✅ **完整功能测试**: 所有功能都可以测试
2. ✅ **演示准备**: 系统已准备好进行演示
3. ✅ **用户体验测试**: 可以邀请其他人测试

### 可选增强

1. **公网部署**: 部署到 Vercel + Railway
2. **真实 API**: 配置真实的 Gemini、Firebase 等服务
3. **域名配置**: 配置自定义域名
4. **SSL 证书**: 启用 HTTPS

## 🎉 总结

**Emergency Guardian 系统现在完全可用！**

- ✅ **前端**: http://localhost:5173 - 完整用户界面
- ✅ **API**: http://localhost:8001 - AI 服务和通知系统
- ✅ **合约**: Sepolia 测试网 - 去中心化智能合约
- ✅ **功能**: 完整的紧急管理流程

您现在就可以：

1. 打开 http://localhost:5173 开始使用
2. 连接 MetaMask 钱包
3. 体验完整的紧急管理功能
4. 测试 AI 分析和通知系统

系统已经完全部署并可以使用了！🚀
