#!/usr/bin/env python3
"""
Firebase Setup Checker - Firebase配置检查器

检查Firebase服务账户JSON文件是否正确配置
"""

import os
import json
from pathlib import Path

def check_firebase_setup():
    """检查Firebase配置"""
    
    print("🔔 Firebase Configuration Checker")
    print("=" * 40)
    
    # 检查文件路径
    config_dir = Path("config")
    firebase_file = config_dir / "firebase-service-account.json"
    
    print(f"📁 Looking for file at: {firebase_file.absolute()}")
    
    # 检查config目录是否存在
    if not config_dir.exists():
        print("❌ Config directory not found!")
        print("💡 Creating config directory...")
        config_dir.mkdir(exist_ok=True)
        print("✅ Config directory created")
    else:
        print("✅ Config directory exists")
    
    # 检查Firebase JSON文件是否存在
    if not firebase_file.exists():
        print("❌ Firebase service account file not found!")
        print("\n📋 To fix this:")
        print("1. Go to https://console.firebase.google.com/")
        print("2. Select your project")
        print("3. Go to Project Settings ⚙️ → Service accounts")
        print("4. Click 'Generate new private key'")
        print("5. Download the JSON file")
        print("6. Rename it to 'firebase-service-account.json'")
        print(f"7. Save it to: {firebase_file.absolute()}")
        return False
    
    print("✅ Firebase service account file found")
    
    # 检查文件大小
    file_size = firebase_file.stat().st_size
    print(f"📊 File size: {file_size} bytes")
    
    if file_size < 100:
        print("⚠️  File seems too small, might be incomplete")
        return False
    
    # 检查JSON格式
    try:
        with open(firebase_file, 'r') as f:
            firebase_config = json.load(f)
        print("✅ JSON format is valid")
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON format: {e}")
        return False
    except Exception as e:
        print(f"❌ Error reading file: {e}")
        return False
    
    # 检查必需字段
    required_fields = [
        'type',
        'project_id', 
        'private_key_id',
        'private_key',
        'client_email',
        'client_id'
    ]
    
    missing_fields = []
    for field in required_fields:
        if field not in firebase_config:
            missing_fields.append(field)
    
    if missing_fields:
        print(f"❌ Missing required fields: {missing_fields}")
        return False
    
    print("✅ All required fields present")
    
    # 显示项目信息
    print(f"\n📋 Firebase Project Info:")
    print(f"   Project ID: {firebase_config.get('project_id')}")
    print(f"   Client Email: {firebase_config.get('client_email')}")
    print(f"   Type: {firebase_config.get('type')}")
    
    # 检查环境变量配置
    print(f"\n⚙️  Environment Configuration:")
    
    # 检查.env文件
    env_file = Path(".env")
    if env_file.exists():
        print("✅ .env file found")
        
        with open(env_file, 'r') as f:
            env_content = f.read()
        
        if 'FIREBASE_CREDENTIALS_PATH' in env_content:
            print("✅ FIREBASE_CREDENTIALS_PATH configured in .env")
        else:
            print("⚠️  FIREBASE_CREDENTIALS_PATH not found in .env")
            print("💡 Add this line to your .env file:")
            print("   FIREBASE_CREDENTIALS_PATH=config/firebase-service-account.json")
        
        if 'USE_REAL_FIREBASE=true' in env_content:
            print("✅ USE_REAL_FIREBASE=true configured")
        else:
            print("⚠️  USE_REAL_FIREBASE not set to true")
            print("💡 Add this line to your .env file:")
            print("   USE_REAL_FIREBASE=true")
    else:
        print("⚠️  .env file not found")
        print("💡 Copy .env.example to .env and configure it")
    
    print("\n🎉 Firebase configuration looks good!")
    print("\n📝 Next steps:")
    print("1. Run: python test_real_apis.py")
    print("2. Look for Firebase test results")
    print("3. If successful, Firebase push notifications are ready!")
    
    return True

def main():
    """主函数"""
    try:
        success = check_firebase_setup()
        
        if success:
            print("\n✅ Firebase setup verification completed successfully!")
        else:
            print("\n❌ Firebase setup needs attention. Please follow the instructions above.")
            
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        print("Please check your file permissions and try again.")

if __name__ == "__main__":
    main()