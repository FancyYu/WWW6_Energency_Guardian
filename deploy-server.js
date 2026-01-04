#!/usr/bin/env node

/**
 * Emergency Guardian Production Server
 * 简单的生产环境部署服务器
 */

const express = require("express");
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = process.env.PORT || 3000;

// 启用信任代理
app.set("trust proxy", true);

// 安全头部
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer-when-downgrade");
  next();
});

// 健康检查端点
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "Emergency Guardian Frontend",
  });
});

// API代理 - 代理到AI服务
app.use(
  "/ai",
  createProxyMiddleware({
    target: "http://localhost:8001",
    changeOrigin: true,
    pathRewrite: {
      "^/ai": "",
    },
    onError: (err, req, res) => {
      console.error("AI Service Proxy Error:", err.message);
      res.status(503).json({ error: "AI Service Unavailable" });
    },
  })
);

// 静态文件服务 - 服务构建后的React应用
app.use(
  express.static(path.join(__dirname, "frontend/dist"), {
    maxAge: "1y",
    etag: true,
    lastModified: true,
  })
);

// SPA路由支持 - 所有未匹配的路由都返回index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/dist/index.html"));
});

// 错误处理
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

// 启动服务器
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Emergency Guardian is running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  console.log(`🤖 AI Service Proxy: http://localhost:${PORT}/ai`);
  console.log(`⚡ Environment: ${process.env.NODE_ENV || "production"}`);
});

// 优雅关闭
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully...");
  process.exit(0);
});
