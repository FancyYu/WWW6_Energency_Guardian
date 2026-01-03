"""
Notification Coordinator - 通知协调系统

负责：
1. 多渠道通知发送 (邮件/短信/APP推送)
2. 监护人状态跟踪和响应监控
3. 通知失败重试和备用渠道
4. 紧急情况状态实时同步
"""

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional, Set
from datetime import datetime, timedelta
from enum import Enum
import hashlib

try:
    import sendgrid
    from sendgrid.helpers.mail import Mail, Email, To, Content
    SENDGRID_AVAILABLE = True
except ImportError:
    SENDGRID_AVAILABLE = False

try:
    from twilio.rest import Client as TwilioClient
    TWILIO_AVAILABLE = True
except ImportError:
    TWILIO_AVAILABLE = False

try:
    import firebase_admin
    from firebase_admin import credentials, messaging
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False

logger = logging.getLogger(__name__)


class NotificationChannel(Enum):
    """通知渠道枚举"""
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"
    WEBHOOK = "webhook"


class NotificationPriority(Enum):
    """通知优先级"""
    LOW = 1
    NORMAL = 2
    HIGH = 3
    CRITICAL = 4


class GuardianStatus(Enum):
    """监护人状态"""
    UNKNOWN = "unknown"
    NOTIFIED = "notified"
    ACKNOWLEDGED = "acknowledged"
    RESPONDED = "responded"
    OFFLINE = "offline"


class NotificationStatus(Enum):
    """通知状态"""
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"
    RETRY = "retry"


class NotificationCoordinator:
    """
    通知协调器
    
    管理多渠道通知发送和监护人状态跟踪
    """
    
    def __init__(self, config: Dict[str, Any]):
        """
        初始化通知协调器
        
        Args:
            config: 配置字典，包含各服务的API密钥和设置
        """
        self.config = config
        
        # 初始化各种通知服务
        self._init_sendgrid()
        self._init_twilio()
        self._init_firebase()
        
        # 监护人状态跟踪
        self.guardian_status: Dict[str, GuardianStatus] = {}
        self.guardian_contacts: Dict[str, Dict[str, str]] = {}
        self.notification_history: List[Dict[str, Any]] = []
        
        # 通知队列和重试机制
        self.notification_queue: List[Dict[str, Any]] = []
        self.retry_queue: List[Dict[str, Any]] = []
        self.max_retries = config.get('max_retries', 3)
        self.retry_delay = config.get('retry_delay', 60)  # 秒
        
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
        
        logger.info("Notification Coordinator initialized")
    
    def _init_sendgrid(self):
        """初始化 SendGrid 邮件服务"""
        if SENDGRID_AVAILABLE and 'sendgrid_api_key' in self.config:
            self.sendgrid_client = sendgrid.SendGridAPIClient(
                api_key=self.config['sendgrid_api_key']
            )
            self.sendgrid_enabled = True
            logger.info("SendGrid email service initialized")
        else:
            self.sendgrid_client = None
            self.sendgrid_enabled = False
            logger.warning("SendGrid not available - email notifications disabled")
    
    def _init_twilio(self):
        """初始化 Twilio 短信服务"""
        if TWILIO_AVAILABLE and 'twilio_account_sid' in self.config and 'twilio_auth_token' in self.config:
            self.twilio_client = TwilioClient(
                self.config['twilio_account_sid'],
                self.config['twilio_auth_token']
            )
            self.twilio_enabled = True
            self.twilio_from_number = self.config.get('twilio_from_number')
            logger.info("Twilio SMS service initialized")
        else:
            self.twilio_client = None
            self.twilio_enabled = False
            logger.warning("Twilio not available - SMS notifications disabled")
    
    def _init_firebase(self):
        """初始化 Firebase 推送服务"""
        if FIREBASE_AVAILABLE and 'firebase_credentials' in self.config:
            try:
                if not firebase_admin._apps:
                    cred = credentials.Certificate(self.config['firebase_credentials'])
                    firebase_admin.initialize_app(cred)
                self.firebase_enabled = True
                logger.info("Firebase push service initialized")
            except Exception as e:
                self.firebase_enabled = False
                logger.error(f"Firebase initialization failed: {e}")
        else:
            self.firebase_enabled = False
            logger.warning("Firebase not available - push notifications disabled")
    
    async def register_guardian(
        self, 
        guardian_id: str, 
        contact_info: Dict[str, str],
        preferences: Optional[Dict[str, Any]] = None
    ):
        """
        注册监护人联系信息
        
        Args:
            guardian_id: 监护人唯一标识
            contact_info: 联系信息 {'email': '...', 'phone': '...', 'push_token': '...'}
            preferences: 通知偏好设置
        """
        try:
            # 验证联系信息格式
            if not self._validate_contact_info(contact_info):
                raise ValueError("Invalid contact information format")
            
            # 存储联系信息
            self.guardian_contacts[guardian_id] = contact_info.copy()
            
            # 设置默认偏好
            if preferences:
                self.guardian_contacts[guardian_id]['preferences'] = preferences
            else:
                self.guardian_contacts[guardian_id]['preferences'] = {
                    'channels': [NotificationChannel.EMAIL.value, NotificationChannel.SMS.value],
                    'priority_threshold': NotificationPriority.NORMAL.value,
                    'quiet_hours': {'start': '22:00', 'end': '08:00'},
                    'language': 'zh-CN'
                }
            
            # 初始化状态
            self.guardian_status[guardian_id] = GuardianStatus.UNKNOWN
            
            logger.info(f"Guardian {guardian_id} registered successfully")
            
        except Exception as e:
            logger.error(f"Failed to register guardian {guardian_id}: {e}")
            raise
    
    def _validate_contact_info(self, contact_info: Dict[str, str]) -> bool:
        """验证联系信息格式"""
        # 检查邮箱格式
        if 'email' in contact_info:
            email = contact_info['email']
            if '@' not in email or '.' not in email.split('@')[1]:
                return False
        
        # 检查手机号格式 (简单验证)
        if 'phone' in contact_info:
            phone = contact_info['phone']
            if not phone.replace('+', '').replace('-', '').replace(' ', '').isdigit():
                return False
        
        return True
    
    async def send_emergency_notification(
        self,
        emergency_id: str,
        emergency_type: str,
        severity_level: int,
        message_data: Dict[str, Any],
        target_guardians: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        发送紧急通知给监护人
        
        Args:
            emergency_id: 紧急情况ID
            emergency_type: 紧急类型 (medical, financial, security)
            severity_level: 严重程度 (1-3)
            message_data: 消息数据
            target_guardians: 目标监护人列表，None表示所有监护人
            
        Returns:
            Dict: 发送结果统计
        """
        try:
            logger.info(f"Sending emergency notification for {emergency_id}")
            
            # 确定目标监护人
            if target_guardians is None:
                target_guardians = list(self.guardian_contacts.keys())
            
            # 确定通知优先级
            priority = self._determine_priority(severity_level, emergency_type)
            
            # 生成通知内容
            notification_content = await self._generate_notification_content(
                emergency_id, emergency_type, severity_level, message_data
            )
            
            # 发送通知
            results = {
                'emergency_id': emergency_id,
                'total_guardians': len(target_guardians),
                'notifications_sent': 0,
                'successful_channels': [],
                'failed_channels': [],
                'guardian_results': {}
            }
            
            # 并发发送给所有监护人
            tasks = []
            for guardian_id in target_guardians:
                if guardian_id in self.guardian_contacts:
                    task = self._send_to_guardian(
                        guardian_id, notification_content, priority, emergency_id
                    )
                    tasks.append(task)
            
            guardian_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # 处理结果
            for i, result in enumerate(guardian_results):
                guardian_id = target_guardians[i]
                if isinstance(result, Exception):
                    logger.error(f"Failed to notify guardian {guardian_id}: {result}")
                    results['guardian_results'][guardian_id] = {'status': 'failed', 'error': str(result)}
                else:
                    results['guardian_results'][guardian_id] = result
                    if result.get('success', False):
                        results['notifications_sent'] += 1
                        results['successful_channels'].extend(result.get('successful_channels', []))
                    results['failed_channels'].extend(result.get('failed_channels', []))
            
            # 更新统计
            self._update_notification_stats(results)
            
            # 记录通知历史
            self._record_notification_history(emergency_id, results)
            
            logger.info(f"Emergency notification sent: {results['notifications_sent']}/{results['total_guardians']} guardians notified")
            
            return results
            
        except Exception as e:
            logger.error(f"Failed to send emergency notification: {e}")
            raise
    
    async def _send_to_guardian(
        self,
        guardian_id: str,
        content: Dict[str, str],
        priority: NotificationPriority,
        emergency_id: str
    ) -> Dict[str, Any]:
        """
        向单个监护人发送通知
        
        Args:
            guardian_id: 监护人ID
            content: 通知内容
            priority: 优先级
            emergency_id: 紧急情况ID
            
        Returns:
            Dict: 发送结果
        """
        try:
            contact_info = self.guardian_contacts[guardian_id]
            preferences = contact_info.get('preferences', {})
            
            # 检查优先级阈值
            if priority.value < preferences.get('priority_threshold', NotificationPriority.NORMAL.value):
                return {'success': False, 'reason': 'Below priority threshold'}
            
            # 检查静默时间
            if self._is_quiet_hours(preferences) and priority != NotificationPriority.CRITICAL:
                return {'success': False, 'reason': 'Quiet hours'}
            
            # 获取启用的通知渠道
            enabled_channels = preferences.get('channels', [NotificationChannel.EMAIL.value])
            
            # 发送通知
            successful_channels = []
            failed_channels = []
            
            for channel in enabled_channels:
                try:
                    if channel == NotificationChannel.EMAIL.value and 'email' in contact_info:
                        success = await self._send_email(
                            contact_info['email'], content, guardian_id, emergency_id
                        )
                        if success:
                            successful_channels.append(channel)
                        else:
                            failed_channels.append(channel)
                    
                    elif channel == NotificationChannel.SMS.value and 'phone' in contact_info:
                        success = await self._send_sms(
                            contact_info['phone'], content, guardian_id, emergency_id
                        )
                        if success:
                            successful_channels.append(channel)
                        else:
                            failed_channels.append(channel)
                    
                    elif channel == NotificationChannel.PUSH.value and 'push_token' in contact_info:
                        success = await self._send_push(
                            contact_info['push_token'], content, guardian_id, emergency_id
                        )
                        if success:
                            successful_channels.append(channel)
                        else:
                            failed_channels.append(channel)
                
                except Exception as e:
                    logger.error(f"Failed to send {channel} to {guardian_id}: {e}")
                    failed_channels.append(channel)
            
            # 更新监护人状态
            if successful_channels:
                self.guardian_status[guardian_id] = GuardianStatus.NOTIFIED
            
            return {
                'success': len(successful_channels) > 0,
                'successful_channels': successful_channels,
                'failed_channels': failed_channels,
                'guardian_id': guardian_id
            }
            
        except Exception as e:
            logger.error(f"Failed to send notification to guardian {guardian_id}: {e}")
            return {'success': False, 'error': str(e), 'guardian_id': guardian_id}
    
    async def _send_email(
        self, 
        email: str, 
        content: Dict[str, str], 
        guardian_id: str, 
        emergency_id: str
    ) -> bool:
        """发送邮件通知"""
        if not self.sendgrid_enabled:
            logger.warning("SendGrid not enabled, skipping email")
            return False
        
        try:
            from_email = Email(self.config.get('from_email', 'noreply@emergency-guardian.com'))
            to_email = To(email)
            subject = content.get('email_subject', 'Emergency Guardian Alert')
            html_content = Content("text/html", content.get('email_body', ''))
            
            mail = Mail(from_email, to_email, subject, html_content)
            
            # 添加自定义头部用于跟踪
            mail.custom_args = {
                'guardian_id': guardian_id,
                'emergency_id': emergency_id,
                'notification_type': 'emergency'
            }
            
            response = self.sendgrid_client.send(mail)
            
            if response.status_code in [200, 202]:
                logger.info(f"Email sent successfully to {email}")
                return True
            else:
                logger.error(f"Failed to send email to {email}: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Email sending error to {email}: {e}")
            return False
    
    async def _send_sms(
        self, 
        phone: str, 
        content: Dict[str, str], 
        guardian_id: str, 
        emergency_id: str
    ) -> bool:
        """发送短信通知"""
        if not self.twilio_enabled:
            logger.warning("Twilio not enabled, skipping SMS")
            return False
        
        try:
            message = self.twilio_client.messages.create(
                body=content.get('sms_body', 'Emergency Guardian Alert'),
                from_=self.twilio_from_number,
                to=phone
            )
            
            if message.sid:
                logger.info(f"SMS sent successfully to {phone}: {message.sid}")
                return True
            else:
                logger.error(f"Failed to send SMS to {phone}")
                return False
                
        except Exception as e:
            logger.error(f"SMS sending error to {phone}: {e}")
            return False
    
    async def _send_push(
        self, 
        push_token: str, 
        content: Dict[str, str], 
        guardian_id: str, 
        emergency_id: str
    ) -> bool:
        """发送推送通知"""
        if not self.firebase_enabled:
            logger.warning("Firebase not enabled, skipping push notification")
            return False
        
        try:
            message = messaging.Message(
                notification=messaging.Notification(
                    title=content.get('push_title', 'Emergency Guardian Alert'),
                    body=content.get('push_body', 'Emergency situation detected')
                ),
                data={
                    'guardian_id': guardian_id,
                    'emergency_id': emergency_id,
                    'type': 'emergency'
                },
                token=push_token
            )
            
            response = messaging.send(message)
            
            if response:
                logger.info(f"Push notification sent successfully: {response}")
                return True
            else:
                logger.error("Failed to send push notification")
                return False
                
        except Exception as e:
            logger.error(f"Push notification error: {e}")
            return False
    
    def _determine_priority(self, severity_level: int, emergency_type: str) -> NotificationPriority:
        """根据严重程度和类型确定通知优先级"""
        if severity_level >= 3:
            return NotificationPriority.CRITICAL
        elif severity_level == 2:
            return NotificationPriority.HIGH
        elif emergency_type in ['medical', 'security']:
            return NotificationPriority.HIGH
        else:
            return NotificationPriority.NORMAL
    
    def _is_quiet_hours(self, preferences: Dict[str, Any]) -> bool:
        """检查是否在静默时间内"""
        quiet_hours = preferences.get('quiet_hours')
        if not quiet_hours:
            return False
        
        try:
            now = datetime.now().time()
            start_time = datetime.strptime(quiet_hours['start'], '%H:%M').time()
            end_time = datetime.strptime(quiet_hours['end'], '%H:%M').time()
            
            if start_time <= end_time:
                return start_time <= now <= end_time
            else:  # 跨午夜
                return now >= start_time or now <= end_time
        except:
            return False
    
    async def _generate_notification_content(
        self,
        emergency_id: str,
        emergency_type: str,
        severity_level: int,
        message_data: Dict[str, Any]
    ) -> Dict[str, str]:
        """生成通知内容"""
        # 这里可以集成模板系统和多语言支持
        # 目前使用简单的模板
        
        severity_text = {1: "低", 2: "中", 3: "高"}[severity_level]
        type_text = {
            'medical': '医疗紧急情况',
            'financial': '财务紧急情况',
            'security': '安全紧急情况'
        }.get(emergency_type, '紧急情况')
        
        base_message = f"检测到{type_text}，严重程度：{severity_text}"
        
        return {
            'email_subject': f'Emergency Guardian Alert - {type_text}',
            'email_body': f"""
            <h2>Emergency Guardian 紧急通知</h2>
            <p><strong>紧急情况ID:</strong> {emergency_id}</p>
            <p><strong>类型:</strong> {type_text}</p>
            <p><strong>严重程度:</strong> {severity_text}</p>
            <p><strong>时间:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            <p><strong>详情:</strong> {message_data.get('description', '暂无详细信息')}</p>
            <p>请立即查看并采取必要行动。</p>
            """,
            'sms_body': f"{base_message}。紧急ID: {emergency_id}。请立即查看应用。",
            'push_title': 'Emergency Guardian Alert',
            'push_body': base_message
        }
    
    async def update_guardian_status(self, guardian_id: str, status: GuardianStatus):
        """更新监护人状态"""
        if guardian_id in self.guardian_status:
            old_status = self.guardian_status[guardian_id]
            self.guardian_status[guardian_id] = status
            logger.info(f"Guardian {guardian_id} status updated: {old_status.value} -> {status.value}")
    
    async def get_guardian_status(self, guardian_id: str) -> Optional[GuardianStatus]:
        """获取监护人状态"""
        return self.guardian_status.get(guardian_id)
    
    async def get_all_guardian_status(self) -> Dict[str, GuardianStatus]:
        """获取所有监护人状态"""
        return self.guardian_status.copy()
    
    def _update_notification_stats(self, results: Dict[str, Any]):
        """更新通知统计"""
        self.notification_stats['total_sent'] += results['notifications_sent']
        
        for guardian_result in results['guardian_results'].values():
            if guardian_result.get('success', False):
                self.notification_stats['successful_deliveries'] += 1
                for channel in guardian_result.get('successful_channels', []):
                    self.notification_stats['by_channel'][channel]['delivered'] += 1
            else:
                self.notification_stats['failed_deliveries'] += 1
                for channel in guardian_result.get('failed_channels', []):
                    self.notification_stats['by_channel'][channel]['failed'] += 1
    
    def _record_notification_history(self, emergency_id: str, results: Dict[str, Any]):
        """记录通知历史"""
        history_entry = {
            'timestamp': datetime.now().isoformat(),
            'emergency_id': emergency_id,
            'results': results
        }
        self.notification_history.append(history_entry)
        
        # 保持历史记录在合理范围内
        if len(self.notification_history) > 1000:
            self.notification_history = self.notification_history[-500:]
    
    def get_notification_stats(self) -> Dict[str, Any]:
        """获取通知统计信息"""
        stats = self.notification_stats.copy()
        
        # 计算成功率
        total = stats['successful_deliveries'] + stats['failed_deliveries']
        if total > 0:
            stats['success_rate'] = stats['successful_deliveries'] / total
        
        # 计算各渠道成功率
        for channel_stats in stats['by_channel'].values():
            channel_total = channel_stats['delivered'] + channel_stats['failed']
            if channel_total > 0:
                channel_stats['success_rate'] = channel_stats['delivered'] / channel_total
        
        return stats
    
    async def retry_failed_notifications(self):
        """重试失败的通知"""
        if not self.retry_queue:
            return
        
        logger.info(f"Retrying {len(self.retry_queue)} failed notifications")
        
        retry_tasks = []
        for notification in self.retry_queue.copy():
            if notification['retry_count'] < self.max_retries:
                notification['retry_count'] += 1
                retry_tasks.append(self._retry_notification(notification))
            else:
                logger.error(f"Max retries exceeded for notification {notification['id']}")
                self.retry_queue.remove(notification)
        
        if retry_tasks:
            await asyncio.gather(*retry_tasks, return_exceptions=True)
    
    async def _retry_notification(self, notification: Dict[str, Any]):
        """重试单个通知"""
        try:
            # 等待重试延迟
            await asyncio.sleep(self.retry_delay)
            
            # 重新发送通知
            # 这里可以根据具体的通知类型进行重试
            logger.info(f"Retrying notification {notification['id']}")
            
        except Exception as e:
            logger.error(f"Retry failed for notification {notification['id']}: {e}")