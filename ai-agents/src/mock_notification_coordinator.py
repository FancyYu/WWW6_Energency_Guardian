"""
Mock Notification Coordinator - 模拟通知协调系统

用于开发和测试的模拟版本，不需要真实的API密钥
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import random
import logging

try:
    from .notification_coordinator import (
        NotificationCoordinator, NotificationChannel, NotificationPriority, 
        GuardianStatus, NotificationStatus
    )
    from .notification_templates import get_notification_content
except ImportError:
    from notification_coordinator import (
        NotificationCoordinator, NotificationChannel, NotificationPriority, 
        GuardianStatus, NotificationStatus
    )
    from notification_templates import get_notification_content

logger = logging.getLogger(__name__)


class MockNotificationCoordinator(NotificationCoordinator):
    """
    模拟通知协调器
    
    继承自真实的NotificationCoordinator，但使用模拟的发送方法
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        """初始化模拟通知协调器"""
        if config is None:
            config = {
                'max_retries': 3,
                'retry_delay': 5,
                'mock_mode': True
            }
        
        # 不调用父类的__init__，直接初始化必要的属性
        self.config = config
        
        # 模拟服务状态
        self.sendgrid_enabled = True
        self.twilio_enabled = True
        self.firebase_enabled = True
        
        # 监护人状态跟踪
        self.guardian_status: Dict[str, GuardianStatus] = {}
        self.guardian_contacts: Dict[str, Dict[str, str]] = {}
        self.notification_history: List[Dict[str, Any]] = []
        
        # 通知队列和重试机制
        self.notification_queue: List[Dict[str, Any]] = []
        self.retry_queue: List[Dict[str, Any]] = []
        self.max_retries = config.get('max_retries', 3)
        self.retry_delay = config.get('retry_delay', 60)
        
        # 统计信息
        self.notification_stats = {
            'total_sent': 0,
            'successful_deliveries': 0,
            'failed_deliveries': 0,
            'by_channel': {
                NotificationChannel.EMAIL.value: {'sent': 0, 'delivered': 0, 'failed': 0},
                NotificationChannel.SMS.value: {'sent': 0, 'delivered': 0, 'failed': 0},
                NotificationChannel.PUSH.value: {'sent': 0, 'delivered': 0, 'failed': 0}
            }
        }
        
        # 模拟发送延迟和成功率
        self.mock_send_delay = config.get('mock_send_delay', 0.1)
        self.mock_success_rate = config.get('mock_success_rate', 0.95)
        
        logger.info("Mock Notification Coordinator initialized")
    
    async def _send_email(
        self, 
        email: str, 
        content: Dict[str, str], 
        guardian_id: str, 
        emergency_id: str
    ) -> bool:
        """模拟发送邮件通知"""
        await asyncio.sleep(self.mock_send_delay)
        
        # 模拟发送成功/失败
        success = random.random() < self.mock_success_rate
        
        if success:
            logger.info(f"📧 [MOCK] Email sent successfully to {email}")
            logger.debug(f"   Subject: {content.get('email_subject', 'N/A')}")
            logger.debug(f"   Guardian: {guardian_id}, Emergency: {emergency_id}")
        else:
            logger.warning(f"📧 [MOCK] Email failed to send to {email}")
        
        return success
    
    async def _send_sms(
        self, 
        phone: str, 
        content: Dict[str, str], 
        guardian_id: str, 
        emergency_id: str
    ) -> bool:
        """模拟发送短信通知"""
        await asyncio.sleep(self.mock_send_delay)
        
        # 模拟发送成功/失败
        success = random.random() < self.mock_success_rate
        
        if success:
            logger.info(f"📱 [MOCK] SMS sent successfully to {phone}")
            logger.debug(f"   Message: {content.get('sms_body', 'N/A')[:50]}...")
            logger.debug(f"   Guardian: {guardian_id}, Emergency: {emergency_id}")
        else:
            logger.warning(f"📱 [MOCK] SMS failed to send to {phone}")
        
        return success
    
    async def _send_push(
        self, 
        push_token: str, 
        content: Dict[str, str], 
        guardian_id: str, 
        emergency_id: str
    ) -> bool:
        """模拟发送推送通知"""
        await asyncio.sleep(self.mock_send_delay)
        
        # 模拟发送成功/失败
        success = random.random() < self.mock_success_rate
        
        if success:
            logger.info(f"🔔 [MOCK] Push notification sent successfully to {push_token[:20]}...")
            logger.debug(f"   Title: {content.get('push_title', 'N/A')}")
            logger.debug(f"   Body: {content.get('push_body', 'N/A')}")
            logger.debug(f"   Guardian: {guardian_id}, Emergency: {emergency_id}")
        else:
            logger.warning(f"🔔 [MOCK] Push notification failed to send to {push_token[:20]}...")
        
        return success
    
    async def simulate_guardian_responses(
        self, 
        emergency_id: str, 
        response_delay: float = 2.0,
        response_rate: float = 0.8
    ):
        """
        模拟监护人响应
        
        Args:
            emergency_id: 紧急情况ID
            response_delay: 响应延迟（秒）
            response_rate: 响应率（0-1）
        """
        logger.info(f"🤖 [MOCK] Simulating guardian responses for {emergency_id}")
        
        # 等待一段时间模拟真实响应延迟
        await asyncio.sleep(response_delay)
        
        # 随机选择一些监护人进行响应
        responding_guardians = []
        for guardian_id in self.guardian_contacts.keys():
            if random.random() < response_rate:
                responding_guardians.append(guardian_id)
        
        # 模拟响应过程
        for guardian_id in responding_guardians:
            # 随机选择响应类型
            response_types = [GuardianStatus.ACKNOWLEDGED, GuardianStatus.RESPONDED]
            response_status = random.choice(response_types)
            
            await self.update_guardian_status(guardian_id, response_status)
            
            # 模拟响应间隔
            await asyncio.sleep(random.uniform(0.5, 2.0))
        
        logger.info(f"🤖 [MOCK] {len(responding_guardians)}/{len(self.guardian_contacts)} guardians responded")
        
        return responding_guardians
    
    def get_mock_statistics(self) -> Dict[str, Any]:
        """获取模拟统计信息"""
        stats = self.get_notification_stats()
        
        # 添加模拟特定的统计
        stats['mock_mode'] = True
        stats['mock_success_rate'] = self.mock_success_rate
        stats['mock_send_delay'] = self.mock_send_delay
        
        return stats
    
    async def simulate_notification_failure(
        self, 
        guardian_id: str, 
        channel: str,
        failure_reason: str = "Network timeout"
    ):
        """模拟通知发送失败"""
        logger.warning(f"🚫 [MOCK] Simulating notification failure for {guardian_id} via {channel}: {failure_reason}")
        
        # 更新统计
        if channel in self.notification_stats['by_channel']:
            self.notification_stats['by_channel'][channel]['failed'] += 1
            self.notification_stats['failed_deliveries'] += 1
    
    async def simulate_delivery_confirmation(
        self, 
        guardian_id: str, 
        channel: str,
        delivery_delay: float = 1.0
    ):
        """模拟送达确认"""
        await asyncio.sleep(delivery_delay)
        
        logger.info(f"✅ [MOCK] Delivery confirmed for {guardian_id} via {channel}")
        
        # 更新统计
        if channel in self.notification_stats['by_channel']:
            self.notification_stats['by_channel'][channel]['delivered'] += 1
            self.notification_stats['successful_deliveries'] += 1


async def create_mock_coordinator_with_guardians() -> MockNotificationCoordinator:
    """创建带有预设监护人的模拟协调器"""
    
    # 创建模拟协调器
    coordinator = MockNotificationCoordinator({
        'mock_success_rate': 0.9,
        'mock_send_delay': 0.2
    })
    
    # 预设监护人
    mock_guardians = [
        {
            'id': 'guardian_alice',
            'contact': {
                'email': 'alice@example.com',
                'phone': '+86138000000001',
                'push_token': 'alice_push_token_12345'
            },
            'preferences': {
                'channels': ['email', 'sms', 'push'],
                'priority_threshold': 1,
                'language': 'zh-CN',
                'quiet_hours': {'start': '23:00', 'end': '07:00'}
            }
        },
        {
            'id': 'guardian_bob',
            'contact': {
                'email': 'bob@example.com',
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
                'email': 'charlie@example.com',
                'phone': '+1234567890',
                'push_token': 'charlie_push_token_67890'
            },
            'preferences': {
                'channels': ['email', 'push'],
                'priority_threshold': 1,
                'language': 'en-US'
            }
        },
        {
            'id': 'guardian_diana',
            'contact': {
                'email': 'diana@example.com',
                'phone': '+86138000000004',
                'push_token': 'diana_push_token_abcde'
            },
            'preferences': {
                'channels': ['email', 'sms', 'push'],
                'priority_threshold': 3,  # 只接收高优先级通知
                'language': 'zh-CN'
            }
        }
    ]
    
    # 注册监护人
    for guardian in mock_guardians:
        await coordinator.register_guardian(
            guardian['id'],
            guardian['contact'],
            guardian['preferences']
        )
    
    logger.info(f"Mock coordinator created with {len(mock_guardians)} guardians")
    
    return coordinator


# 便捷函数
async def quick_test_notification(
    emergency_type: str = 'medical',
    severity_level: int = 2,
    simulate_responses: bool = True
) -> Dict[str, Any]:
    """
    快速测试通知功能
    
    Args:
        emergency_type: 紧急类型
        severity_level: 严重程度
        simulate_responses: 是否模拟监护人响应
        
    Returns:
        Dict: 测试结果
    """
    
    # 创建模拟协调器
    coordinator = await create_mock_coordinator_with_guardians()
    
    # 准备紧急数据
    emergency_data = {
        'emergency_id': f'TEST_{datetime.now().strftime("%Y%m%d_%H%M%S")}',
        'severity_level': severity_level,
        'location': '测试地点',
        'description': f'这是一个{emergency_type}类型的测试紧急情况',
        'timestamp': datetime.now().isoformat()
    }
    
    if emergency_type == 'medical':
        emergency_data.update({
            'symptoms': '测试症状描述',
            'ai_severity': '中等风险',
            'ai_recommendation': '建议就医检查'
        })
    elif emergency_type == 'financial':
        emergency_data.update({
            'amount': '10000',
            'currency': 'USDT',
            'account': '0x1234...5678',
            'risk_level': '中等风险'
        })
    elif emergency_type == 'security':
        emergency_data.update({
            'threat_type': '异常登录',
            'source_ip': '192.168.1.100',
            'threat_description': '检测到异常登录尝试'
        })
    
    # 发送通知
    logger.info(f"🧪 Testing {emergency_type} notification with severity {severity_level}")
    
    results = await coordinator.send_emergency_notification(
        emergency_id=emergency_data['emergency_id'],
        emergency_type=emergency_type,
        severity_level=severity_level,
        message_data=emergency_data
    )
    
    # 模拟监护人响应
    if simulate_responses:
        await coordinator.simulate_guardian_responses(
            emergency_data['emergency_id'],
            response_delay=1.0,
            response_rate=0.75
        )
    
    # 获取最终状态
    final_stats = coordinator.get_mock_statistics()
    guardian_status = await coordinator.get_all_guardian_status()
    
    return {
        'emergency_data': emergency_data,
        'notification_results': results,
        'final_stats': final_stats,
        'guardian_status': {k: v.value for k, v in guardian_status.items()}
    }


if __name__ == "__main__":
    # 快速测试
    async def main():
        print("🧪 Quick Mock Notification Test")
        print("=" * 50)
        
        result = await quick_test_notification('medical', 3, True)
        
        print(f"\n📊 Test Results:")
        print(f"Emergency ID: {result['emergency_data']['emergency_id']}")
        print(f"Notifications Sent: {result['notification_results']['notifications_sent']}")
        print(f"Success Rate: {result['final_stats'].get('success_rate', 0):.2%}")
        
        print(f"\n👥 Guardian Status:")
        for guardian_id, status in result['guardian_status'].items():
            print(f"  {guardian_id}: {status}")
        
        print("\n✅ Mock test completed!")
    
    asyncio.run(main())