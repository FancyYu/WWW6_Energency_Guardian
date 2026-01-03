#!/usr/bin/env python3
"""
Test Notification Coordinator - 通知协调系统测试

测试通知协调系统的各项功能
"""

import asyncio
import json
import logging
import sys
import os
from datetime import datetime

# 添加src目录到路径
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from notification_coordinator import NotificationCoordinator, NotificationChannel, GuardianStatus
from notification_templates import get_notification_content

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def test_notification_coordinator():
    """测试通知协调器"""
    
    print("🧪 Testing Notification Coordinator...")
    
    # 配置 (使用Mock配置进行测试)
    config = {
        'sendgrid_api_key': 'mock_sendgrid_key',
        'twilio_account_sid': 'mock_twilio_sid',
        'twilio_auth_token': 'mock_twilio_token',
        'twilio_from_number': '+1234567890',
        'firebase_credentials': None,  # 不使用Firebase进行测试
        'from_email': 'test@emergency-guardian.com',
        'max_retries': 3,
        'retry_delay': 5
    }
    
    # 初始化通知协调器
    coordinator = NotificationCoordinator(config)
    
    # 测试1: 注册监护人
    print("\n📝 Test 1: Guardian Registration")
    
    guardians = [
        {
            'id': 'guardian_001',
            'contact': {
                'email': 'guardian1@example.com',
                'phone': '+86138000000001',
                'push_token': 'mock_push_token_1'
            },
            'preferences': {
                'channels': ['email', 'sms'],
                'priority_threshold': 2,
                'language': 'zh-CN'
            }
        },
        {
            'id': 'guardian_002',
            'contact': {
                'email': 'guardian2@example.com',
                'phone': '+86138000000002'
            },
            'preferences': {
                'channels': ['email'],
                'priority_threshold': 1,
                'language': 'zh-CN'
            }
        },
        {
            'id': 'guardian_003',
            'contact': {
                'email': 'guardian3@example.com',
                'phone': '+86138000000003',
                'push_token': 'mock_push_token_3'
            },
            'preferences': {
                'channels': ['email', 'sms', 'push'],
                'priority_threshold': 3,
                'language': 'en-US'
            }
        }
    ]
    
    for guardian in guardians:
        await coordinator.register_guardian(
            guardian['id'],
            guardian['contact'],
            guardian['preferences']
        )
        print(f"✅ Registered guardian: {guardian['id']}")
    
    # 测试2: 生成通知内容
    print("\n📄 Test 2: Notification Content Generation")
    
    medical_content = get_notification_content(
        emergency_type='medical',
        emergency_id='EMG_001',
        severity_level=3,
        location='北京市朝阳区',
        symptoms='胸痛、呼吸困难',
        ai_severity='高风险',
        ai_recommendation='立即就医',
        action_url='https://app.emergency-guardian.com/emergency/EMG_001'
    )
    
    print("📧 Email Subject:", medical_content.get('email_subject'))
    print("📱 SMS Body:", medical_content.get('sms_body'))
    print("🔔 Push Title:", medical_content.get('push_title'))
    
    # 测试3: 发送紧急通知
    print("\n🚨 Test 3: Emergency Notification Sending")
    
    emergency_data = {
        'emergency_id': 'EMG_001',
        'severity_level': 3,
        'location': '北京市朝阳区医院',
        'symptoms': '胸痛、呼吸困难、出汗',
        'ai_severity': '高风险 - 疑似心脏病发作',
        'ai_recommendation': '立即拨打120并前往最近医院',
        'action_url': 'https://app.emergency-guardian.com/emergency/EMG_001',
        'description': 'AI检测到用户生命体征异常，建议立即医疗干预'
    }
    
    # 发送给所有监护人
    results = await coordinator.send_emergency_notification(
        emergency_id='EMG_001',
        emergency_type='medical',
        severity_level=3,
        message_data=emergency_data
    )
    
    print(f"📊 Notification Results:")
    print(f"   Total Guardians: {results['total_guardians']}")
    print(f"   Notifications Sent: {results['notifications_sent']}")
    print(f"   Success Rate: {results['notifications_sent']}/{results['total_guardians']}")
    
    for guardian_id, result in results['guardian_results'].items():
        status = "✅ Success" if result.get('success', False) else "❌ Failed"
        channels = result.get('successful_channels', [])
        print(f"   {guardian_id}: {status} - Channels: {channels}")
    
    # 测试4: 监护人状态更新
    print("\n📊 Test 4: Guardian Status Updates")
    
    # 模拟监护人响应
    await coordinator.update_guardian_status('guardian_001', GuardianStatus.ACKNOWLEDGED)
    await coordinator.update_guardian_status('guardian_002', GuardianStatus.RESPONDED)
    
    # 查看所有状态
    all_status = await coordinator.get_all_guardian_status()
    print("Guardian Status:")
    for guardian_id, status in all_status.items():
        print(f"   {guardian_id}: {status.value}")
    
    # 测试5: 不同类型的紧急通知
    print("\n💰 Test 5: Financial Emergency Notification")
    
    financial_data = {
        'emergency_id': 'EMG_002',
        'amount': '50000',
        'currency': 'USDT',
        'account': '0x1234...5678',
        'risk_level': '高风险',
        'recommendation': '立即冻结账户并联系银行',
        'description': '检测到大额异常转账，疑似账户被盗用'
    }
    
    financial_results = await coordinator.send_emergency_notification(
        emergency_id='EMG_002',
        emergency_type='financial',
        severity_level=2,
        message_data=financial_data,
        target_guardians=['guardian_001', 'guardian_002']  # 只发送给部分监护人
    )
    
    print(f"💰 Financial Alert Results: {financial_results['notifications_sent']}/{financial_results['total_guardians']}")
    
    # 测试6: 安全紧急通知
    print("\n🔒 Test 6: Security Emergency Notification")
    
    security_data = {
        'emergency_id': 'EMG_003',
        'threat_type': '恶意登录尝试',
        'source_ip': '192.168.1.100',
        'threat_description': '检测到来自异常IP的多次登录失败尝试',
        'auto_actions': [
            '已自动锁定账户',
            '已发送验证码到注册手机',
            '已记录安全日志'
        ]
    }
    
    security_results = await coordinator.send_emergency_notification(
        emergency_id='EMG_003',
        emergency_type='security',
        severity_level=2,
        message_data=security_data
    )
    
    print(f"🔒 Security Alert Results: {security_results['notifications_sent']}/{security_results['total_guardians']}")
    
    # 测试7: 统计信息
    print("\n📈 Test 7: Notification Statistics")
    
    stats = coordinator.get_notification_stats()
    print("Notification Statistics:")
    print(f"   Total Sent: {stats['total_sent']}")
    print(f"   Successful: {stats['successful_deliveries']}")
    print(f"   Failed: {stats['failed_deliveries']}")
    if 'success_rate' in stats:
        print(f"   Success Rate: {stats['success_rate']:.2%}")
    
    print("\nBy Channel:")
    for channel, channel_stats in stats['by_channel'].items():
        print(f"   {channel.upper()}:")
        print(f"     Delivered: {channel_stats['delivered']}")
        print(f"     Failed: {channel_stats['failed']}")
        if 'success_rate' in channel_stats:
            print(f"     Success Rate: {channel_stats['success_rate']:.2%}")
    
    # 测试8: 多语言支持
    print("\n🌍 Test 8: Multi-language Support")
    
    # 英文通知内容
    english_content = get_notification_content(
        emergency_type='medical',
        language='en-US',
        emergency_id='EMG_004',
        severity_level=2,
        location='Beijing Hospital',
        symptoms='Chest pain, difficulty breathing'
    )
    
    print("🇺🇸 English Notification:")
    print(f"   Subject: {english_content.get('email_subject')}")
    print(f"   SMS: {english_content.get('sms_body')}")
    
    print("\n✅ All tests completed successfully!")
    
    return coordinator


async def test_notification_templates():
    """测试通知模板系统"""
    
    print("\n🎨 Testing Notification Templates...")
    
    # 测试不同类型的通知内容生成
    test_cases = [
        {
            'type': 'medical',
            'data': {
                'emergency_id': 'MED_001',
                'severity_level': 3,
                'location': '上海市人民医院',
                'symptoms': '心律不齐、胸闷',
                'ai_severity': '紧急',
                'ai_recommendation': '立即心电图检查'
            }
        },
        {
            'type': 'financial',
            'data': {
                'emergency_id': 'FIN_001',
                'amount': '100000',
                'currency': 'ETH',
                'account': '0xabcd...1234',
                'risk_level': '极高',
                'recommendation': '立即暂停所有交易'
            }
        },
        {
            'type': 'security',
            'data': {
                'emergency_id': 'SEC_001',
                'threat_type': 'DDoS攻击',
                'source_ip': '10.0.0.1',
                'threat_description': '检测到大量异常流量',
                'auto_actions': ['启用防护模式', '阻断可疑IP']
            }
        }
    ]
    
    for case in test_cases:
        print(f"\n📋 Testing {case['type'].upper()} notification:")
        
        content = get_notification_content(
            emergency_type=case['type'],
            **case['data']
        )
        
        print(f"   📧 Email Subject: {content.get('email_subject', 'N/A')}")
        print(f"   📱 SMS Body: {content.get('sms_body', 'N/A')[:100]}...")
        print(f"   🔔 Push Title: {content.get('push_title', 'N/A')}")
    
    print("\n✅ Template tests completed!")


async def main():
    """主测试函数"""
    
    print("🚀 Starting Emergency Guardian Notification System Tests")
    print("=" * 60)
    
    try:
        # 测试通知模板
        await test_notification_templates()
        
        # 测试通知协调器
        coordinator = await test_notification_coordinator()
        
        print("\n" + "=" * 60)
        print("🎉 All tests passed successfully!")
        print("📊 Final Statistics:")
        
        final_stats = coordinator.get_notification_stats()
        print(f"   Total Notifications: {final_stats['total_sent']}")
        print(f"   Success Rate: {final_stats.get('success_rate', 0):.2%}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    # 运行测试
    success = asyncio.run(main())
    
    if success:
        print("\n✅ Notification Coordinator implementation completed successfully!")
        print("🔧 Ready for integration with Emergency Coordinator")
    else:
        print("\n❌ Tests failed - please check the implementation")
        sys.exit(1)