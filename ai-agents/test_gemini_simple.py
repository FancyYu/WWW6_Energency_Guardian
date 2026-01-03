#!/usr/bin/env python3
"""
Simple Gemini Test - 简单Gemini测试

使用最保守的方式测试Gemini API连接
"""

import os
import time
from dotenv import load_dotenv

load_dotenv()

def test_gemini_connection():
    """测试Gemini连接"""
    
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("❌ GEMINI_API_KEY not found")
        return False
    
    print(f"🔑 API Key: {api_key[:10]}...{api_key[-4:]}")
    
    try:
        # 尝试新版API
        import google.genai as genai
        client = genai.Client(api_key=api_key)
        print("✅ New Gemini client created")
        
        # 等待配额重置
        print("⏳ Waiting for quota reset (40 seconds)...")
        time.sleep(40)
        
        # 尝试最简单的请求
        print("🧪 Testing with minimal request...")
        response = client.models.generate_content(
            model='gemini-1.5-flash',  # 使用更稳定的模型
            contents="Hi"  # 最短的请求
        )
        
        print(f"✅ Success! Response: {response.text}")
        return True
        
    except Exception as e:
        print(f"❌ New API failed: {e}")
        
        # 尝试旧版API
        try:
            print("🔄 Trying legacy API...")
            import google.generativeai as old_genai
            old_genai.configure(api_key=api_key)
            
            model = old_genai.GenerativeModel('gemini-pro')
            response = model.generate_content("Hi")
            
            print(f"✅ Legacy API works! Response: {response.text}")
            return True
            
        except Exception as e2:
            print(f"❌ Legacy API also failed: {e2}")
            
            if "quota" in str(e2).lower() or "429" in str(e2):
                print("💡 Quota exceeded. Please:")
                print("   1. Wait a few minutes")
                print("   2. Check your usage at https://ai.dev/usage")
                print("   3. Consider getting a new API key if needed")
            
            return False

if __name__ == "__main__":
    success = test_gemini_connection()
    
    if success:
        print("\n🎉 Gemini API is working!")
        print("📝 You can now proceed with the full system test")
    else:
        print("\n❌ Gemini API test failed")
        print("💡 You may need to wait or get a new API key")