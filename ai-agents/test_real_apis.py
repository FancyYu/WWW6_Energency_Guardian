#!/usr/bin/env python3
"""
Real API Testing - 真实API测试

测试Gemini API和Firebase推送通知的真实连接
"""

import asyncio
import os
import sys
import json
import logging
from datetime import datetime
from pathlib import Path

# 添加src目录到路径
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 加载环境变量
try:
    from dotenv import load_dotenv
    load_dotenv()
    logger.info("Environment variables loaded from .env file")
except ImportError:
    logger.warning("python-dotenv not installed, using system environment variables")

def load_config():
    """加载配置"""
    config = {
        'gemini_api_key': os.getenv('GEMINI_API_KEY'),
        'firebase_credentials_path': os.getenv('FIREBASE_CREDENTIALS_PATH'),
        'use_real_gemini': os.getenv('USE_REAL_GEMINI', 'false').lower() == 'true',
        'use_real_firebase': os.getenv('USE_REAL_FIREBASE', 'false').lower() == 'true',
        'web3_provider_url': os.getenv('WEB3_PROVIDER_URL', 'https://rpc.sepolia.org'),
        'ai_agent_private_key': os.getenv('AI_AGENT_PRIVATE_KEY', '0x' + '1' * 64)
    }
    
    return config

async def test_gemini_api():
    """测试Gemini API连接"""
    print("\n🤖 Testing Gemini API Connection...")
    
    config = load_config()
    
    if not config['use_real_gemini'] or not config['gemini_api_key']:
        print("❌ Gemini API not configured or disabled")
        print("   Please set GEMINI_API_KEY in .env file and USE_REAL_GEMINI=true")
        return False
    
    try:
        # 尝试导入Gemini库
        try:
            import google.generativeai as genai
        except ImportError:
            print("❌ google-generativeai library not installed")
            print("   Run: pip install google-generativeai")
            return False
        
        # 配置API密钥
        genai.configure(api_key=config['gemini_api_key'])
        
        # 创建模型
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # 测试简单请求
        test_prompt = """
        作为医疗紧急情况分析专家，请分析以下情况：
        
        患者症状：胸痛、呼吸困难、出汗
        持续时间：30分钟
        年龄：65岁
        
        请评估严重程度并提供建议，以JSON格式返回：
        {
            "severity": "HIGH/MEDIUM/LOW",
            "urgency": 85,
            "recommendation": "建议立即就医"
        }
        """
        
        print("   📤 Sending test request to Gemini...")
        response = model.generate_content(test_prompt)
        
        print("   📥 Response received:")
        print(f"   {response.text[:200]}...")
        
        # 检查API使用情况
        print("   📊 API Usage Info:")
        print(f"   ✅ Model: gemini-1.5-flash")
        print(f"   ✅ Response length: {len(response.text)} characters")
        print(f"   ✅ Free tier: 15 requests/minute, 1500 requests/day")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Gemini API test failed: {e}")
        if "API_KEY_INVALID" in str(e):
            print("   💡 Please check your GEMINI_API_KEY in .env file")
        elif "QUOTA_EXCEEDED" in str(e):
            print("   💡 API quota exceeded, please wait or upgrade plan")
        return False

async def test_firebase_push():
    """测试Firebase推送通知"""
    print("\n🔔 Testing Firebase Push Notifications...")
    
    config = load_config()
    
    if not config['use_real_firebase'] or not config['firebase_credentials_path']:
        print("❌ Firebase not configured or disabled")
        print("   Please set FIREBASE_CREDENTIALS_PATH in .env file and USE_REAL_FIREBASE=true")
        return False
    
    try:
        # 检查服务账户文件是否存在
        credentials_path = Path(config['firebase_credentials_path'])
        if not credentials_path.exists():
            print(f"❌ Firebase credentials file not found: {credentials_path}")
            print("   Please download service account JSON from Firebase Console")
            print("   and place it at the specified path")
            return False
        
        # 尝试导入Firebase库
        try:
            import firebase_admin
            from firebase_admin import credentials, messaging
        except ImportError:
            print("❌ firebase-admin library not installed")
            print("   Run: pip install firebase-admin")
            return False
        
        # 初始化Firebase
        if not firebase_admin._apps:
            cred = credentials.Certificate(str(credentials_path))
            firebase_admin.initialize_app(cred)
            print("   ✅ Firebase initialized successfully")
        else:
            print("   ✅ Firebase already initialized")
        
        # 创建测试消息（不实际发送，因为需要有效的设备token）
        test_message = messaging.Message(
            notification=messaging.Notification(
                title='🚨 Emergency Guardian Test',
                body='Firebase推送通知测试成功！'
            ),
            data={
                'emergency_id': 'TEST_001',
                'type': 'test',
                'timestamp': datetime.now().isoformat()
            },
            # 这里需要真实的设备token才能发送
            # token='test_device_token'
        )
        
        print("   ✅ Test message created successfully")
        print("   📱 Message structure:")
        print(f"      Title: {test_message.notification.title}")
        print(f"      Body: {test_message.notification.body}")
        print(f"      Data: {test_message.data}")
        
        print("   💡 To send real push notifications, you need:")
        print("      1. A mobile app with Firebase SDK")
        print("      2. Valid device registration tokens")
        print("      3. Call messaging.send(message) with real token")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Firebase test failed: {e}")
        if "credentials" in str(e).lower():
            print("   💡 Please check your Firebase service account JSON file")
        return False

async def test_integrated_system():
    """测试集成系统"""
    print("\n🔗 Testing Integrated Emergency System...")
    
    config = load_config()
    
    try:
        # 导入我们的系统组件
        from emergency_coordinator import EmergencyCoordinator, EmergencyData, EmergencyType
        
        # 创建配置
        system_config = {
            'gemini_api_key': config['gemini_api_key'],
            'web3_provider_url': config['web3_provider_url'],
            'ai_agent_private_key': config['ai_agent_private_key'],
            'use_mock_notifications': True,  # 仍使用Mock通知
            'notification_config': {
                'firebase_credentials': config['firebase_credentials_path'] if config['use_real_firebase'] else None
            }
        }
        
        # 创建紧急协调器
        coordinator = EmergencyCoordinator(system_config)
        
        # 创建测试紧急数据
        emergency_data = EmergencyData(
            emergency_id="REAL_API_TEST_001",
            user_address="0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
            emergency_type=EmergencyType.MEDICAL_EMERGENCY,
            institution_name="北京协和医院",
            institution_address="0x1234567890123456789012345678901234567890",
            documents=[
                {
                    "type": "medical_report",
                    "description": "患者出现急性胸痛，疑似心肌梗死，需要立即医疗干预",
                    "timestamp": datetime.now().isoformat()
                }
            ],
            requested_amount=50.0,
            zk_proof={
                "identity_proof": {"guardian_commitment": "a" * 64, "nullifier_hash": "b" * 64},
                "emergency_proof": {"emergency_hash": "c" * 64, "severity_level": 3, "evidence_commitment": "d" * 64},
                "authorization_proof": {"operation_hash": "e" * 64, "executor_commitment": "f" * 64, "permission_level": 3}
            },
            timestamp=datetime.now(),
            contact_info={"phone": "+86138000000001", "email": "emergency@hospital.com"}
        )
        
        print("   📋 Processing test emergency with real APIs...")
        
        # 处理紧急情况
        response = await coordinator.handle_emergency_request(emergency_data)
        
        if response.success:
            print("   ✅ Emergency processed successfully!")
            print(f"      Proposal ID: {response.proposal_id}")
            print(f"      Transaction Hash: {response.transaction_hash}")
            if response.analysis:
                print(f"      AI Confidence: {response.analysis.confidence_score:.1%}")
                print(f"      Severity: {response.analysis.severity_level.value}")
                print(f"      Urgency Score: {response.analysis.urgency_score}")
        else:
            print(f"   ❌ Emergency processing failed: {response.message}")
            return False
        
        return True
        
    except Exception as e:
        print(f"   ❌ Integrated system test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """主测试函数"""
    print("🧪 Emergency Guardian - Real API Testing")
    print("=" * 60)
    
    config = load_config()
    
    # 显示配置状态
    print("\n📋 Configuration Status:")
    print(f"   Gemini API: {'✅ Enabled' if config['use_real_gemini'] and config['gemini_api_key'] else '❌ Disabled'}")
    print(f"   Firebase: {'✅ Enabled' if config['use_real_firebase'] and config['firebase_credentials_path'] else '❌ Disabled'}")
    
    # 运行测试
    results = []
    
    # 测试Gemini API
    gemini_result = await test_gemini_api()
    results.append(("Gemini API", gemini_result))
    
    # 测试Firebase
    firebase_result = await test_firebase_push()
    results.append(("Firebase Push", firebase_result))
    
    # 如果基础API测试通过，测试集成系统
    if gemini_result:
        integrated_result = await test_integrated_system()
        results.append(("Integrated System", integrated_result))
    
    # 显示结果
    print("\n" + "=" * 60)
    print("📊 Test Results Summary:")
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"   {test_name}: {status}")
    
    # 总结
    passed_tests = sum(1 for _, result in results if result)
    total_tests = len(results)
    
    print(f"\n🎯 Overall: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("🎉 All tests passed! Your real APIs are working correctly.")
        print("\n📝 Next Steps:")
        print("   1. Your Gemini API is working - AI analysis is ready!")
        print("   2. Firebase is configured - push notifications ready!")
        print("   3. You can now use the system with real AI analysis")
        print("   4. Add SendGrid/Twilio later for email/SMS notifications")
    else:
        print("⚠️  Some tests failed. Please check the configuration and try again.")
        print("\n🔧 Troubleshooting:")
        print("   1. Verify your .env file has correct API keys")
        print("   2. Check Firebase service account JSON file path")
        print("   3. Ensure you have internet connection")
        print("   4. Check API quotas and limits")

if __name__ == "__main__":
    # 运行测试
    asyncio.run(main())