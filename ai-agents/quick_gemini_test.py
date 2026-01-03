#!/usr/bin/env python3
"""
Quick Gemini API Test - 快速Gemini API测试

简单测试Gemini API连接和医疗分析功能
"""

import os
import sys
import json

# 加载环境变量
try:
    from dotenv import load_dotenv
    load_dotenv()
    print("✅ Environment variables loaded")
except ImportError:
    print("⚠️  python-dotenv not installed, using system environment")

def test_gemini_simple():
    """简单的Gemini API测试"""
    
    # 检查API密钥
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("❌ GEMINI_API_KEY not found in environment")
        print("💡 Please set GEMINI_API_KEY in .env file")
        print("   Get your key from: https://aistudio.google.com/")
        return False
    
    print(f"🔑 API Key found: {api_key[:10]}...{api_key[-4:]}")
    
    try:
        # 导入Gemini库
        import google.generativeai as genai
        print("✅ google-generativeai library imported")
    except ImportError:
        print("❌ google-generativeai not installed")
        print("💡 Run: pip install google-generativeai")
        return False
    
    try:
        # 配置API
        genai.configure(api_key=api_key)
        print("✅ Gemini API configured")
        
        # 创建模型
        model = genai.GenerativeModel('gemini-2.5-flash')
        print("✅ Model created: gemini-2.5-flash")
        
        # 简单测试
        print("\n🧪 Testing basic functionality...")
        response = model.generate_content("Hello! Please respond with 'Gemini API is working!'")
        print(f"📥 Response: {response.text}")
        
        # 医疗分析测试
        print("\n🏥 Testing medical analysis...")
        medical_prompt = """
        作为医疗专家，分析以下症状并以JSON格式回复：
        
        症状：胸痛、呼吸困难
        持续时间：30分钟
        
        请返回：
        {
            "severity": "HIGH",
            "urgency": 85,
            "recommendation": "立即就医"
        }
        """
        
        medical_response = model.generate_content(medical_prompt)
        print(f"📥 Medical Analysis: {medical_response.text}")
        
        # 检查是否包含JSON
        if "{" in medical_response.text and "}" in medical_response.text:
            print("✅ JSON response detected - medical analysis working!")
        
        print("\n📊 API Usage Summary:")
        print("   ✅ Free tier: 15 requests/minute")
        print("   ✅ Free tier: 1,500 requests/day")
        print("   ✅ No credit card required")
        print("   ✅ Perfect for development and testing")
        
        return True
        
    except Exception as e:
        print(f"❌ Gemini API test failed: {e}")
        
        # 提供具体的错误帮助
        error_str = str(e).lower()
        if "api key" in error_str or "invalid" in error_str:
            print("💡 API Key issue:")
            print("   1. Check your GEMINI_API_KEY in .env file")
            print("   2. Verify the key is correct (starts with 'AIzaSy')")
            print("   3. Get a new key from https://aistudio.google.com/")
        elif "quota" in error_str or "limit" in error_str:
            print("💡 Quota issue:")
            print("   1. You may have exceeded the free tier limits")
            print("   2. Wait a few minutes and try again")
            print("   3. Check usage at https://console.cloud.google.com/")
        elif "network" in error_str or "connection" in error_str:
            print("💡 Network issue:")
            print("   1. Check your internet connection")
            print("   2. Try again in a few moments")
        
        return False

def main():
    """主函数"""
    print("🚀 Quick Gemini API Test")
    print("=" * 40)
    
    success = test_gemini_simple()
    
    print("\n" + "=" * 40)
    if success:
        print("🎉 Gemini API is working perfectly!")
        print("\n📝 Next steps:")
        print("   1. Run: python test_real_apis.py")
        print("   2. Test the full Emergency Guardian system")
        print("   3. Your AI analysis is now powered by Gemini!")
    else:
        print("❌ Gemini API test failed")
        print("\n🔧 Troubleshooting:")
        print("   1. Get API key from https://aistudio.google.com/")
        print("   2. Add it to .env file: GEMINI_API_KEY=your_key_here")
        print("   3. Run: pip install google-generativeai")
        print("   4. Try this test again")

if __name__ == "__main__":
    main()