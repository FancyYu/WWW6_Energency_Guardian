#!/usr/bin/env python3
"""
Check Available Gemini Models - 检查可用的Gemini模型
"""

import os
from dotenv import load_dotenv

load_dotenv()

def check_available_models():
    """检查可用的Gemini模型"""
    
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("❌ GEMINI_API_KEY not found")
        return
    
    try:
        import google.genai as genai
        
        client = genai.Client(api_key=api_key)
        
        print("🔍 Checking available models...")
        
        # 列出可用模型
        models = client.models.list()
        
        print("📋 Available Models:")
        for model in models:
            print(f"   - {model.name}")
            if hasattr(model, 'display_name'):
                print(f"     Display: {model.display_name}")
            if hasattr(model, 'description'):
                print(f"     Description: {model.description}")
            print()
        
    except Exception as e:
        print(f"❌ Error checking models: {e}")
        
        # 尝试使用旧版API检查
        try:
            import google.generativeai as old_genai
            old_genai.configure(api_key=api_key)
            
            print("\n🔄 Trying with legacy API...")
            models = old_genai.list_models()
            
            print("📋 Available Models (Legacy API):")
            for model in models:
                print(f"   - {model.name}")
                if hasattr(model, 'display_name'):
                    print(f"     Display: {model.display_name}")
                print()
                
        except Exception as e2:
            print(f"❌ Legacy API also failed: {e2}")

if __name__ == "__main__":
    check_available_models()