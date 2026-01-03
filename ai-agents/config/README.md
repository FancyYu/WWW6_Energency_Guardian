# Configuration Directory

## Firebase Service Account

将从 Firebase Console 下载的服务账户 JSON 文件放在此目录下，命名为 `firebase-service-account.json`

### 获取步骤:

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 选择您的项目
3. 点击项目设置 ⚙️ → "Service accounts"
4. 点击 "Generate new private key"
5. 下载 JSON 文件并重命名为 `firebase-service-account.json`
6. 将文件放在此目录下

### 文件结构示例:

```
ai-agents/
├── config/
│   ├── firebase-service-account.json  ← 放在这里
│   └── README.md
├── src/
└── .env
```

### 安全提醒:

- 此目录已添加到 .gitignore，不会被提交到 Git
- 请妥善保管服务账户密钥文件
- 不要将密钥文件分享给他人
