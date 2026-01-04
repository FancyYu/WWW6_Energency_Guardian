#!/bin/bash

echo "🚀 Emergency Guardian 公网部署脚本"
echo "=================================="

# 检查必要的工具
check_tool() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 未安装，请先安装 $1"
        return 1
    else
        echo "✅ $1 已安装"
        return 0
    fi
}

# 选择部署平台
echo ""
echo "请选择部署平台："
echo "1) Vercel (推荐 - 静态网站，免费)"
echo "2) Railway (推荐 - 全栈应用，支持后端)"
echo "3) Netlify (静态网站，免费)"
echo "4) 手动部署指南"
echo ""
read -p "请输入选择 (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🔵 Vercel 部署"
        echo "=============="
        
        if check_tool "vercel"; then
            echo "开始部署到 Vercel..."
            
            # 构建前端
            echo "📦 构建前端应用..."
            cd frontend && npm run build && cd ..
            
            # 部署到 Vercel
            echo "🚀 部署到 Vercel..."
            vercel --prod
            
            echo "✅ Vercel 部署完成！"
            echo "📱 你的网站将在几分钟内可以通过 Vercel 提供的 URL 访问"
        else
            echo "请先安装 Vercel CLI:"
            echo "npm install -g vercel"
        fi
        ;;
        
    2)
        echo ""
        echo "🚂 Railway 部署"
        echo "==============="
        
        if check_tool "railway"; then
            echo "开始部署到 Railway..."
            
            # 登录 Railway
            echo "🔐 请先登录 Railway..."
            railway login
            
            # 创建项目
            echo "📦 创建 Railway 项目..."
            railway init
            
            # 部署
            echo "🚀 部署到 Railway..."
            railway up
            
            echo "✅ Railway 部署完成！"
            echo "📱 你的网站将在几分钟内可以通过 Railway 提供的 URL 访问"
        else
            echo "请先安装 Railway CLI:"
            echo "npm install -g @railway/cli"
        fi
        ;;
        
    3)
        echo ""
        echo "🟢 Netlify 部署"
        echo "==============="
        
        if check_tool "netlify"; then
            echo "开始部署到 Netlify..."
            
            # 构建前端
            echo "📦 构建前端应用..."
            cd frontend && npm run build && cd ..
            
            # 部署到 Netlify
            echo "🚀 部署到 Netlify..."
            netlify deploy --prod --dir=frontend/dist
            
            echo "✅ Netlify 部署完成！"
            echo "📱 你的网站将在几分钟内可以通过 Netlify 提供的 URL 访问"
        else
            echo "请先安装 Netlify CLI:"
            echo "npm install -g netlify-cli"
        fi
        ;;
        
    4)
        echo ""
        echo "📖 手动部署指南"
        echo "==============="
        echo ""
        echo "1. 构建前端应用:"
        echo "   cd frontend && npm run build"
        echo ""
        echo "2. 上传 frontend/dist 文件夹到你的服务器"
        echo ""
        echo "3. 配置 Web 服务器 (Nginx/Apache) 指向 dist 文件夹"
        echo ""
        echo "4. 配置 SPA 路由重定向到 index.html"
        echo ""
        echo "5. 设置环境变量:"
        echo "   VITE_BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
        echo "   VITE_CONTRACT_ADDRESS=0x6af445EA589D8f550a3D1dacf34745071a4D5b4F"
        echo ""
        ;;
        
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

echo ""
echo "🎉 部署脚本执行完成！"
echo ""
echo "📋 部署后检查清单:"
echo "- ✅ 网站可以正常访问"
echo "- ✅ 钱包连接功能正常"
echo "- ✅ 页面导航正常"
echo "- ✅ 紧急求助功能正常"
echo ""
echo "🔗 有用的链接:"
echo "- Vercel: https://vercel.com"
echo "- Railway: https://railway.app"
echo "- Netlify: https://netlify.com"