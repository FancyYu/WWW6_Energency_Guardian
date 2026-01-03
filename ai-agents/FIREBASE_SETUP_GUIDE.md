# 🔔 Firebase 设置详细指南

## 📍 文件保存位置

将 Firebase 服务账户 JSON 文件保存到：

```
ai-agents/config/firebase-service-account.json
```

## 🔥 Firebase Console 操作步骤

### Step 1: 创建 Firebase 项目

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 点击 **"Add project"** (添加项目)
3. 输入项目名称：`emergency-guardian` (或您喜欢的名称)
4. 选择是否启用 Google Analytics (可选)
5. 点击 **"Create project"** 创建项目

### Step 2: 获取服务账户密钥

1. 项目创建完成后，点击左上角的 **⚙️ 齿轮图标**
2. 选择 **"Project settings"** (项目设置)
3. 点击顶部的 **"Service accounts"** 标签页
4. 在页面中找到 **"Firebase Admin SDK"** 部分
5. 点击 **"Generate new private key"** (生成新的私钥)
6. 在弹出的确认对话框中点击 **"Generate key"**
7. JSON 文件会自动下载到您的电脑

### Step 3: 重命名和移动文件

1. 找到下载的 JSON 文件（通常在 Downloads 文件夹）
2. 文件名类似：`emergency-guardian-firebase-adminsdk-xxxxx-xxxxxxxxxx.json`
3. **重命名**为：`firebase-service-account.json`
4. **移动**到项目目录：`ai-agents/config/firebase-service-account.json`

## 📂 具体操作示例

### macOS/Linux 用户：

```bash
# 假设文件下载到了Downloads目录
cd ~/Downloads

# 找到Firebase JSON文件（文件名会有所不同）
ls *firebase*.json

# 复制并重命名到正确位置
cp emergency-guardian-firebase-adminsdk-xxxxx-xxxxxxxxxx.json /path/to/your/project/ai-agents/config/firebase-service-account.json
```

### Windows 用户：

1. 打开文件资源管理器
2. 导航到 `Downloads` 文件夹
3. 找到 Firebase JSON 文件
4. 复制文件
5. 导航到项目的 `ai-agents\config\` 文件夹
6. 粘贴文件并重命名为 `firebase-service-account.json`

## ✅ 验证文件位置

运行以下命令检查文件是否在正确位置：

### macOS/Linux：

```bash
ls -la ai-agents/config/firebase-service-account.json
```

### Windows：

```cmd
dir ai-agents\config\firebase-service-account.json
```

如果文件存在，您应该看到类似输出：

```
-rw-r--r-- 1 user user 2345 Jan  3 10:30 ai-agents/config/firebase-service-account.json
```

## 📋 JSON 文件内容示例

您的 Firebase JSON 文件应该包含类似以下内容：

```json
{
  "type": "service_account",
  "project_id": "emergency-guardian-xxxxx",
  "private_key_id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@emergency-guardian-xxxxx.iam.gserviceaccount.com",
  "client_id": "xxxxxxxxxxxxxxxxxxxxx",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40emergency-guardian-xxxxx.iam.gserviceaccount.com"
}
```

## 🔒 安全注意事项

1. **不要提交到 Git**: 此文件包含敏感信息，已添加到 `.gitignore`
2. **妥善保管**: 不要分享此文件给他人
3. **定期轮换**: 建议定期生成新的服务账户密钥

## 🧪 测试配置

文件保存完成后，运行测试：

```bash
cd ai-agents
python test_real_apis.py
```

如果配置正确，您应该看到：

```
🔔 Testing Firebase Push Notifications...
   ✅ Firebase initialized successfully
   ✅ Test message created successfully
```

## ❌ 常见问题

### 问题 1: 文件路径错误

```
❌ Firebase credentials file not found: config/firebase-service-account.json
```

**解决方案**: 检查文件是否在正确位置，文件名是否正确

### 问题 2: JSON 格式错误

```
❌ Firebase test failed: credentials
```

**解决方案**: 检查 JSON 文件是否完整，没有被截断

### 问题 3: 权限问题

```
❌ Firebase initialization failed: permissions
```

**解决方案**: 确保服务账户有正确的权限，重新生成密钥

## 📞 需要帮助？

如果遇到问题，请检查：

1. 文件路径是否正确：`ai-agents/config/firebase-service-account.json`
2. 文件名是否正确：必须是 `firebase-service-account.json`
3. JSON 文件是否完整且有效
4. 网络连接是否正常

完成后就可以使用 Firebase 推送通知功能了！🎉
