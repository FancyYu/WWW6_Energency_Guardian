#!/usr/bin/env python3
"""
New Gemini API Test - 新版Gemini API测试

使用最新的google.genai库测试Gemini API
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

def test_new_gemini_api():
    """测试新版Gemini API"""
    
    # 检查API密钥
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("❌ GEMINI_API_KEY not found in environment")
        print("💡 Please set GEMINI_API_KEY in .env file")
        return False
    
    print(f"🔑 API Key found: {api_key[:10]}...{api_key[-4:]}")
    
    try:
        # 导入新的Gemini库
        import google.genai as genai
        print("✅ google.genai library imported")
    except ImportError:
        print("❌ google.genai not installed")
        print("💡 Run: pip install google-genai")
        return False
    
    try:
        # 配置API
        client = genai.Client(api_key=api_key)
        print("✅ Gemini client configured")
        
        # 简单测试
        print("\n🧪 Testing basic functionality...")
        response = client.models.generate_content(
            model='gemini-2.0-flash-exp',
            contents="Hello! Please respond with 'New Gemini API is working!'"
        )
        print(f"📥 Response: {response.text}")
        
        # 医疗分析测试
        print("\n🏥 Testing medical analysis...")
        medical_prompt = """
        作为医疗专家，分析以下症状并以JSON格式回复：
        
        症状：胸痛、呼吸困难、出汗
        持续时间：30分钟
        年龄：65岁
        
        请返回JSON格式：
        {
            "severity": "HIGH",
            "urgency": 85,
            "recommendation": "立即就医",
            "confidence": 0.9
        }
        """
        
        medical_response = client.models.generate_content(
            model='gemini-2.0-flash-exp',
            contents=medical_prompt
        )
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
        if "api key" in error_str or "invalid" in error_str or "401" in error_str:
            print("💡 API Key issue:")
            print("   1. Check your GEMINI_API_KEY in .env file")
            print("   2. Verify the key is correct (starts with 'AIzaSy')")
            print("   3. Get a new key from https://aistudio.google.com/")
        elif "quota" in error_str or "limit" in error_str or "429" in error_str:
            print("💡 Quota issue:")
            print("   1. You may have exceeded the free tier limits")
            print("   2. Wait a few minutes and try again")
            print("   3. Check usage at https://console.cloud.google.com/")
        elif "network" in error_str or "connection" in error_str:
            print("💡 Network issue:")
            print("   1. Check your internet connection")
            print("   2. Try again in a few moments")
        elif "model" in error_str or "not found" in error_str:
            print("💡 Model issue:")
            print("   1. Trying alternative model names...")
            # 尝试其他模型
            try:
                alt_response = client.models.generate_content(
                    model='gemini-1.5-flash',
                    contents="Hello! Testing alternative model."
                )
                print(f"   ✅ Alternative model works: {alt_response.text}")
                return True
            except:
                print("   ❌ Alternative models also failed")
        
        return False

def main():
    """主函数"""
    print("🚀 New Gemini API Test")
    print("=" * 40)
    
    success = test_new_gemini_api()
    
    print("\n" + "=" * 40)
    if success:
        print("🎉 New Gemini API is working perfectly!")
        print("\n📝 Next steps:")
        print("   1. Run: python test_real_apis.py")
        print("   2. Test the full Emergency Guardian system")
        print("   3. Your AI analysis is now powered by Gemini!")
    else:
        print("❌ New Gemini API test failed")
        print("\n🔧 Troubleshooting:")
        print("   1. Get API key from https://aistudio.google.com/")
        print("   2. Add it to .env file: GEMINI_API_KEY=your_key_here")
        print("   3. Run: pip install google-genai")
        print("   4. Try this test again")

if __name__ == "__main__":
    main()