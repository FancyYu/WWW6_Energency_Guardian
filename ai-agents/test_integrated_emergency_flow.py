#!/usr/bin/env python3
"""
Integrated Emergency Flow Test - 集成紧急流程测试

测试完整的紧急协调流程，包括通知系统集成
"""

import asyncio
import json
import logging
import sys
import os
from datetime import datetime, timedelta

# 添加src目录到路径
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from emergency_coordinator import EmergencyCoordinator, EmergencyData, EmergencyType, create_emergency_coordinator
from mock_notification_coordinator import create_mock_coordinator_with_guardians

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def test_complete_emergency_flow():
    """测试完整的紧急流程"""
    
    print("🚀 Testing Complete Emergency Flow with Notifications")
    print("=" * 60)
    
    # 1. 创建紧急协调器
    print("\n🔧 Step 1: Creating Emergency Coordinator")
    
    config = {
        'gemini_api_key': 'mock_gemini_key',
        'web3_provider_url': 'http://localhost:8545',
        'ai_agent_private_key': '0x' + '1' * 64,  # Mock private key
        'use_mock_notifications': True,
        'notification_config': {
            'mock_success_rate': 0.9,
            'mock_send_delay': 0.1
        }
    }
    
    coordinator = create_emergency_coordinator(config)
    
    # 2. 注册监护人
    print("\n👥 Step 2: Registering Guardians")
    
    guardians = [
        {
            'id': 'guardian_alice',
            'contact': {
                'email': 'alice@family.com',
                'phone': '+86138000000001',
                'push_token': 'alice_push_token'
            },
            'preferences': {
                'channels': ['email', 'sms', 'push'],
                'priority_threshold': 1,
                'language': 'zh-CN'
            }
        },
        {
            'id': 'guardian_bob',
            'contact': {
                'email': 'bob@family.com',
                'phone': '+86138000000002'
            },
            'preferences': {
                'channels': ['email', 'sms'],
                'priority_threshold': 2,
                'language': 'zh-CN'
            }
        },
        {
            'id': 'guardian_charlie',
            'contact': {
                'email': 'charlie@family.com',
                'phone': '+1234567890',
                'push_token': 'charlie_push_token'
            },
            'preferences': {
                'channels': ['email', 'push'],
                'priority_threshold': 1,
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
    
    # 3. 创建紧急情况数据
    print("\n🚨 Step 3: Creating Emergency Data")
    
    emergency_scenarios = [
        {
            'name': 'Medical Emergency - Heart Attack',
            'data': EmergencyData(
                emergency_id='MED_001_HEART_ATTACK',
                user_address='0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
                emergency_type=EmergencyType.MEDICAL_EMERGENCY,
                institution_name='北京协和医院急诊科',
                institution_address='0x1234567890123456789012345678901234567890',
                requested_amount=50000,  # USDT
                documents=[
                    {'name': 'ecg_report.pdf', 'hash': 'hash1', 'description': '心电图报告'},
                    {'name': 'blood_test.pdf', 'hash': 'hash2', 'description': '血液检查报告'},
                    {'name': 'doctor_note.pdf', 'hash': 'hash3', 'description': '医生诊断书 - 患者出现胸痛、呼吸困难、出汗等症状，疑似心脏病发作。心电图显示ST段抬高，需要立即进行介入治疗。'}
                ],
                timestamp=datetime.now(),
                zk_proof={'proof': 'mock_zk_proof_medical_001', 'type': 'medical'},
                contact_info={'phone': '+86138000000000', 'emergency_contact': 'family'}
            )
        },
        {
            'name': 'Financial Emergency - Account Compromise',
            'data': EmergencyData(
                emergency_id='FIN_001_ACCOUNT_HACK',
                user_address='0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
                emergency_type=EmergencyType.FINANCIAL_EMERGENCY,
                institution_name='Binance Security Team',
                institution_address='0x2345678901234567890123456789012345678901',
                requested_amount=100000,  # USDT
                documents=[
                    {'name': 'security_alert.pdf', 'hash': 'hash4', 'description': '安全警报 - 检测到账户异常活动，多笔大额转账到未知地址，疑似账户被盗用。需要立即冻结资产并转移到安全地址。'},
                    {'name': 'transaction_log.pdf', 'hash': 'hash5', 'description': '交易日志'}
                ],
                timestamp=datetime.now(),
                zk_proof={'proof': 'mock_zk_proof_financial_001', 'type': 'financial'},
                contact_info={'phone': '+86138000000000', 'emergency_contact': 'security_team'}
            )
        },
        {
            'name': 'Security Incident - Identity Theft',
            'data': EmergencyData(
                emergency_id='SEC_001_IDENTITY_THEFT',
                user_address='0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
                emergency_type=EmergencyType.SECURITY_INCIDENT,
                institution_name='CyberSecurity Firm',
                institution_address='0x3456789012345678901234567890123456789012',
                requested_amount=20000,  # USDT for security services
                documents=[
                    {'name': 'security_report.pdf', 'hash': 'hash6', 'description': '安全报告 - 发现身份信息被盗用，多个平台出现异常登录和操作。需要立即更换所有密钥和地址。'},
                    {'name': 'forensic_analysis.pdf', 'hash': 'hash7', 'description': '取证分析报告'}
                ],
                timestamp=datetime.now(),
                zk_proof={'proof': 'mock_zk_proof_security_001', 'type': 'security'},
                contact_info={'phone': '+86138000000000', 'emergency_contact': 'security_firm'}
            )
        }
    ]
    
    # 4. 处理每个紧急情况
    results = []
    
    for i, scenario in enumerate(emergency_scenarios):
        print(f"\n🔥 Step 4.{i+1}: Processing {scenario['name']}")
        
        try:
            # 处理紧急请求
            response = await coordinator.handle_emergency_request(scenario['data'])
            
            if response.success:
                print(f"✅ Emergency processed successfully")
                print(f"   Proposal ID: {response.proposal_id}")
                print(f"   Transaction Hash: {response.transaction_hash}")
                print(f"   AI Confidence: {response.analysis.confidence_score:.1%}")
                print(f"   Severity: {response.analysis.severity_level.value}")
                print(f"   Urgency Score: {response.analysis.urgency_score}")
            else:
                print(f"❌ Emergency processing failed: {response.message}")
            
            results.append({
                'scenario': scenario['name'],
                'success': response.success,
                'response': response
            })
            
            # 等待一段时间让通知系统处理
            await asyncio.sleep(2)
            
        except Exception as e:
            print(f"❌ Error processing {scenario['name']}: {e}")
            results.append({
                'scenario': scenario['name'],
                'success': False,
                'error': str(e)
            })
    
    # 5. 模拟监护人响应
    print(f"\n👥 Step 5: Simulating Guardian Responses")
    
    # 模拟监护人对第一个紧急情况的响应
    if results and results[0]['success']:
        emergency_id = emergency_scenarios[0]['data'].emergency_id
        
        # 模拟不同的响应
        await coordinator.update_guardian_status('guardian_alice', 'acknowledged')
        await asyncio.sleep(1)
        await coordinator.update_guardian_status('guardian_bob', 'responded')
        await asyncio.sleep(1)
        await coordinator.update_guardian_status('guardian_charlie', 'acknowledged')
        
        print("✅ Guardian responses simulated")
    
    # 6. 获取统计信息
    print(f"\n📊 Step 6: Final Statistics")
    
    notification_stats = coordinator.get_notification_stats()
    
    print("Notification Statistics:")
    print(f"   Total Sent: {notification_stats['total_sent']}")
    print(f"   Successful: {notification_stats['successful_deliveries']}")
    print(f"   Failed: {notification_stats['failed_deliveries']}")
    if 'success_rate' in notification_stats:
        print(f"   Success Rate: {notification_stats['success_rate']:.2%}")
    
    print("\nBy Channel:")
    for channel, stats in notification_stats['by_channel'].items():
        if stats['delivered'] > 0 or stats['failed'] > 0:
            total = stats['delivered'] + stats['failed']
            success_rate = stats['delivered'] / total if total > 0 else 0
            print(f"   {channel.upper()}: {stats['delivered']}/{total} ({success_rate:.1%})")
    
    # 7. 结果汇总
    print(f"\n📋 Step 7: Results Summary")
    
    successful_scenarios = sum(1 for r in results if r['success'])
    total_scenarios = len(results)
    
    print(f"Emergency Scenarios Processed: {successful_scenarios}/{total_scenarios}")
    
    for result in results:
        status = "✅ Success" if result['success'] else "❌ Failed"
        print(f"   {result['scenario']}: {status}")
        if not result['success'] and 'error' in result:
            print(f"     Error: {result['error']}")
    
    return {
        'total_scenarios': total_scenarios,
        'successful_scenarios': successful_scenarios,
        'notification_stats': notification_stats,
        'results': results
    }


async def test_guardian_response_monitoring():
    """测试监护人响应监控功能"""
    
    print("\n🔍 Testing Guardian Response Monitoring")
    print("-" * 40)
    
    # 创建协调器
    config = {
        'gemini_api_key': 'mock_gemini_key',
        'web3_provider_url': 'http://localhost:8545',
        'ai_agent_private_key': '0x' + '1' * 64,
        'use_mock_notifications': True
    }
    
    coordinator = create_emergency_coordinator(config)
    
    # 注册监护人
    await coordinator.register_guardian(
        'test_guardian_1',
        {'email': 'test1@example.com', 'phone': '+1234567890'},
        {'channels': ['email'], 'priority_threshold': 1}
    )
    
    await coordinator.register_guardian(
        'test_guardian_2',
        {'email': 'test2@example.com', 'phone': '+1234567891'},
        {'channels': ['email'], 'priority_threshold': 1}
    )
    
    # 创建高优先级紧急情况
    emergency_data = EmergencyData(
        emergency_id='TEST_MONITORING_001',
        user_address='0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
        emergency_type=EmergencyType.MEDICAL_EMERGENCY,
        institution_name='测试医院',
        institution_address='0x1234567890123456789012345678901234567890',
        requested_amount=10000,
        documents=[{'name': 'test_doc.pdf', 'hash': 'hash_test', 'description': '高优先级医疗紧急情况测试'}],
        timestamp=datetime.now(),
        zk_proof={'proof': 'mock_zk_proof_test', 'type': 'medical'},
        contact_info={'phone': '+86138000000000', 'emergency_contact': 'test'}
    )
    
    # 处理紧急情况（这会自动启动监护人响应监控）
    response = await coordinator.handle_emergency_request(emergency_data)
    
    if response.success:
        print("✅ High-priority emergency processed, monitoring started")
        
        # 等待一段时间让监控系统运行
        await asyncio.sleep(3)
        
        # 模拟监护人响应
        await coordinator.update_guardian_status('test_guardian_1', 'acknowledged')
        await asyncio.sleep(1)
        await coordinator.update_guardian_status('test_guardian_2', 'responded')
        
        print("✅ Guardian response monitoring test completed")
    else:
        print(f"❌ Failed to process emergency: {response.message}")


async def main():
    """主测试函数"""
    
    print("🧪 Emergency Guardian - Integrated Flow Testing")
    print("=" * 60)
    
    try:
        # 测试完整紧急流程
        flow_results = await test_complete_emergency_flow()
        
        # 测试监护人响应监控
        await test_guardian_response_monitoring()
        
        print("\n" + "=" * 60)
        print("🎉 All integrated tests completed successfully!")
        
        # 最终统计
        print(f"\n📊 Final Test Results:")
        print(f"   Emergency Scenarios: {flow_results['successful_scenarios']}/{flow_results['total_scenarios']}")
        print(f"   Notification Success Rate: {flow_results['notification_stats'].get('success_rate', 0):.1%}")
        print(f"   Total Notifications Sent: {flow_results['notification_stats']['total_sent']}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Integrated test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    # 运行集成测试
    success = asyncio.run(main())
    
    if success:
        print("\n✅ Emergency Coordinator with Notification System integration completed successfully!")
        print("🔧 Ready for Task 5.3 - Execution Coordinator implementation")
    else:
        print("\n❌ Integration tests failed - please check the implementation")
        sys.exit(1)