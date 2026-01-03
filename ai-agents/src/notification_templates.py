"""
Notification Templates - 通知模板系统

负责：
1. 多语言通知模板管理
2. 动态内容生成和格式化
3. 不同紧急类型的专用模板
4. 个性化消息定制
"""

import json
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
from enum import Enum

logger = logging.getLogger(__name__)


class EmergencyType(Enum):
    """紧急情况类型"""
    MEDICAL = "medical"
    FINANCIAL = "financial"
    SECURITY = "security"
    FAMILY = "family"
    LEGAL = "legal"
    TECHNICAL = "technical"


class NotificationTemplate:
    """通知模板类"""
    
    def __init__(self):
        """初始化通知模板"""
        self.templates = self._load_default_templates()
        logger.info("Notification templates initialized")
    
    def _load_default_templates(self) -> Dict[str, Any]:
        """加载默认模板"""
        return {
            "zh-CN": {
                "emergency": {
                    "medical": {
                        "email": {
                            "subject": "🚨 Emergency Guardian - 医疗紧急情况警报",
                            "body": """
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <div style="background: #dc3545; color: white; padding: 20px; text-align: center;">
                                    <h1>🚨 医疗紧急情况</h1>
                                </div>
                                <div style="padding: 20px; background: #f8f9fa;">
                                    <h2>紧急情况详情</h2>
                                    <table style="width: 100%; border-collapse: collapse;">
                                        <tr>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>紧急ID:</strong></td>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;">{emergency_id}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>类型:</strong></td>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;">医疗紧急情况</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>严重程度:</strong></td>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;">{severity_text}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>发生时间:</strong></td>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;">{timestamp}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>位置:</strong></td>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;">{location}</td>
                                        </tr>
                                    </table>
                                    
                                    <div style="margin: 20px 0; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107;">
                                        <h3>症状描述</h3>
                                        <p>{symptoms}</p>
                                    </div>
                                    
                                    <div style="margin: 20px 0; padding: 15px; background: #d1ecf1; border-left: 4px solid #17a2b8;">
                                        <h3>AI 分析结果</h3>
                                        <p><strong>建议紧急程度:</strong> {ai_severity}</p>
                                        <p><strong>建议行动:</strong> {ai_recommendation}</p>
                                    </div>
                                    
                                    <div style="text-align: center; margin: 30px 0;">
                                        <a href="{action_url}" style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                                            立即查看并响应
                                        </a>
                                    </div>
                                    
                                    <div style="margin-top: 20px; padding: 15px; background: #f8d7da; border-left: 4px solid #dc3545;">
                                        <p><strong>⚠️ 重要提醒:</strong></p>
                                        <ul>
                                            <li>请立即查看详细信息并确认您的响应</li>
                                            <li>如果这是真正的医疗紧急情况，请同时拨打急救电话</li>
                                            <li>您的响应将影响后续的自动化处理流程</li>
                                        </ul>
                                    </div>
                                </div>
                                <div style="background: #6c757d; color: white; padding: 10px; text-align: center; font-size: 12px;">
                                    Emergency Guardian System - 守护您的安全
                                </div>
                            </div>
                            """
                        },
                        "sms": {
                            "body": "🚨医疗紧急情况！严重程度:{severity_text}。位置:{location}。症状:{symptoms}。紧急ID:{emergency_id}。请立即查看应用响应！"
                        },
                        "push": {
                            "title": "🚨 医疗紧急情况",
                            "body": "检测到医疗紧急情况，严重程度:{severity_text}。请立即查看详情。"
                        }
                    },
                    "financial": {
                        "email": {
                            "subject": "💰 Emergency Guardian - 财务紧急情况警报",
                            "body": """
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <div style="background: #fd7e14; color: white; padding: 20px; text-align: center;">
                                    <h1>💰 财务紧急情况</h1>
                                </div>
                                <div style="padding: 20px; background: #f8f9fa;">
                                    <h2>紧急情况详情</h2>
                                    <table style="width: 100%; border-collapse: collapse;">
                                        <tr>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>紧急ID:</strong></td>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;">{emergency_id}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>类型:</strong></td>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;">财务紧急情况</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>涉及金额:</strong></td>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;">{amount} {currency}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>账户:</strong></td>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;">{account}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>发生时间:</strong></td>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;">{timestamp}</td>
                                        </tr>
                                    </table>
                                    
                                    <div style="margin: 20px 0; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107;">
                                        <h3>情况描述</h3>
                                        <p>{description}</p>
                                    </div>
                                    
                                    <div style="margin: 20px 0; padding: 15px; background: #d1ecf1; border-left: 4px solid #17a2b8;">
                                        <h3>风险评估</h3>
                                        <p><strong>风险等级:</strong> {risk_level}</p>
                                        <p><strong>建议行动:</strong> {recommendation}</p>
                                    </div>
                                    
                                    <div style="text-align: center; margin: 30px 0;">
                                        <a href="{action_url}" style="background: #fd7e14; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                                            立即处理
                                        </a>
                                    </div>
                                </div>
                            </div>
                            """
                        },
                        "sms": {
                            "body": "💰财务紧急情况！涉及金额:{amount} {currency}。账户:{account}。风险:{risk_level}。紧急ID:{emergency_id}。请立即查看！"
                        },
                        "push": {
                            "title": "💰 财务紧急情况",
                            "body": "检测到财务异常，涉及金额:{amount} {currency}。请立即查看。"
                        }
                    },
                    "security": {
                        "email": {
                            "subject": "🔒 Emergency Guardian - 安全紧急情况警报",
                            "body": """
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <div style="background: #dc3545; color: white; padding: 20px; text-align: center;">
                                    <h1>🔒 安全紧急情况</h1>
                                </div>
                                <div style="padding: 20px; background: #f8f9fa;">
                                    <h2>安全警报详情</h2>
                                    <table style="width: 100%; border-collapse: collapse;">
                                        <tr>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>警报ID:</strong></td>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;">{emergency_id}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>威胁类型:</strong></td>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;">{threat_type}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>严重程度:</strong></td>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;">{severity_text}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>检测时间:</strong></td>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;">{timestamp}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>来源IP:</strong></td>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;">{source_ip}</td>
                                        </tr>
                                    </table>
                                    
                                    <div style="margin: 20px 0; padding: 15px; background: #f8d7da; border-left: 4px solid #dc3545;">
                                        <h3>威胁详情</h3>
                                        <p>{threat_description}</p>
                                    </div>
                                    
                                    <div style="margin: 20px 0; padding: 15px; background: #d1ecf1; border-left: 4px solid #17a2b8;">
                                        <h3>已采取的自动措施</h3>
                                        <ul>
                                            {auto_actions}
                                        </ul>
                                    </div>
                                    
                                    <div style="text-align: center; margin: 30px 0;">
                                        <a href="{action_url}" style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                                            立即查看并确认
                                        </a>
                                    </div>
                                </div>
                            </div>
                            """
                        },
                        "sms": {
                            "body": "🔒安全警报！威胁类型:{threat_type}。严重程度:{severity_text}。来源:{source_ip}。警报ID:{emergency_id}。请立即查看！"
                        },
                        "push": {
                            "title": "🔒 安全警报",
                            "body": "检测到安全威胁:{threat_type}。严重程度:{severity_text}。请立即查看。"
                        }
                    }
                },
                "status_update": {
                    "guardian_response": {
                        "email": {
                            "subject": "✅ Guardian Response - 监护人响应更新",
                            "body": """
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <div style="background: #28a745; color: white; padding: 20px; text-align: center;">
                                    <h1>✅ 监护人响应更新</h1>
                                </div>
                                <div style="padding: 20px; background: #f8f9fa;">
                                    <p>紧急情况 <strong>{emergency_id}</strong> 的监护人响应状态已更新：</p>
                                    <ul>
                                        {guardian_status_list}
                                    </ul>
                                    <p>当前进度: {responded_count}/{total_count} 监护人已响应</p>
                                </div>
                            </div>
                            """
                        }
                    }
                }
            },
            "en-US": {
                "emergency": {
                    "medical": {
                        "email": {
                            "subject": "🚨 Emergency Guardian - Medical Emergency Alert",
                            "body": """
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <div style="background: #dc3545; color: white; padding: 20px; text-align: center;">
                                    <h1>🚨 Medical Emergency</h1>
                                </div>
                                <div style="padding: 20px; background: #f8f9fa;">
                                    <h2>Emergency Details</h2>
                                    <table style="width: 100%; border-collapse: collapse;">
                                        <tr>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Emergency ID:</strong></td>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;">{emergency_id}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Type:</strong></td>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;">Medical Emergency</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Severity:</strong></td>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;">{severity_text}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Time:</strong></td>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;">{timestamp}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Location:</strong></td>
                                            <td style="padding: 8px; border-bottom: 1px solid #ddd;">{location}</td>
                                        </tr>
                                    </table>
                                    
                                    <div style="margin: 20px 0; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107;">
                                        <h3>Symptoms</h3>
                                        <p>{symptoms}</p>
                                    </div>
                                    
                                    <div style="text-align: center; margin: 30px 0;">
                                        <a href="{action_url}" style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                                            View and Respond Now
                                        </a>
                                    </div>
                                </div>
                            </div>
                            """
                        },
                        "sms": {
                            "body": "🚨Medical Emergency! Severity:{severity_text}. Location:{location}. ID:{emergency_id}. Please check app immediately!"
                        },
                        "push": {
                            "title": "🚨 Medical Emergency",
                            "body": "Medical emergency detected. Severity:{severity_text}. Please check details."
                        }
                    }
                }
            }
        }
    
    def generate_notification_content(
        self,
        emergency_type: str,
        notification_type: str = "emergency",
        language: str = "zh-CN",
        data: Dict[str, Any] = None
    ) -> Dict[str, str]:
        """
        生成通知内容
        
        Args:
            emergency_type: 紧急类型
            notification_type: 通知类型 (emergency, status_update)
            language: 语言代码
            data: 模板数据
            
        Returns:
            Dict: 包含各渠道内容的字典
        """
        try:
            if data is None:
                data = {}
            
            # 获取模板
            template_path = [language, notification_type, emergency_type]
            template = self.templates
            
            for path_part in template_path:
                if path_part in template:
                    template = template[path_part]
                else:
                    # 回退到默认语言
                    if language != "zh-CN":
                        return self.generate_notification_content(
                            emergency_type, notification_type, "zh-CN", data
                        )
                    else:
                        raise ValueError(f"Template not found: {'/'.join(template_path)}")
            
            # 准备模板数据
            template_data = self._prepare_template_data(data)
            
            # 生成各渠道内容
            content = {}
            
            if "email" in template:
                content["email_subject"] = template["email"]["subject"].format(**template_data)
                content["email_body"] = template["email"]["body"].format(**template_data)
            
            if "sms" in template:
                content["sms_body"] = template["sms"]["body"].format(**template_data)
            
            if "push" in template:
                content["push_title"] = template["push"]["title"].format(**template_data)
                content["push_body"] = template["push"]["body"].format(**template_data)
            
            return content
            
        except Exception as e:
            logger.error(f"Failed to generate notification content: {e}")
            return self._get_fallback_content(emergency_type, data)
    
    def _prepare_template_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """准备模板数据"""
        template_data = data.copy()
        
        # 添加默认值
        template_data.setdefault("timestamp", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        template_data.setdefault("emergency_id", "UNKNOWN")
        template_data.setdefault("location", "未知位置")
        template_data.setdefault("symptoms", "暂无详细信息")
        template_data.setdefault("description", "暂无详细描述")
        template_data.setdefault("action_url", "#")
        
        # 处理严重程度文本
        severity_level = template_data.get("severity_level", 1)
        severity_map = {1: "低", 2: "中", 3: "高"}
        template_data["severity_text"] = severity_map.get(severity_level, "未知")
        
        # 处理列表数据
        if "auto_actions" in template_data and isinstance(template_data["auto_actions"], list):
            template_data["auto_actions"] = "\n".join([f"<li>{action}</li>" for action in template_data["auto_actions"]])
        
        if "guardian_status_list" in template_data and isinstance(template_data["guardian_status_list"], list):
            template_data["guardian_status_list"] = "\n".join([f"<li>{status}</li>" for status in template_data["guardian_status_list"]])
        
        return template_data
    
    def _get_fallback_content(self, emergency_type: str, data: Dict[str, Any]) -> Dict[str, str]:
        """获取回退内容"""
        emergency_id = data.get("emergency_id", "UNKNOWN")
        severity = data.get("severity_level", 1)
        severity_text = {1: "低", 2: "中", 3: "高"}.get(severity, "未知")
        
        return {
            "email_subject": f"Emergency Guardian Alert - {emergency_type}",
            "email_body": f"""
            <h2>Emergency Guardian 紧急通知</h2>
            <p>紧急情况ID: {emergency_id}</p>
            <p>类型: {emergency_type}</p>
            <p>严重程度: {severity_text}</p>
            <p>时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            <p>请立即查看并采取必要行动。</p>
            """,
            "sms_body": f"Emergency Guardian Alert! Type:{emergency_type}, Severity:{severity_text}, ID:{emergency_id}",
            "push_title": "Emergency Guardian Alert",
            "push_body": f"{emergency_type} emergency detected. Severity: {severity_text}"
        }
    
    def add_custom_template(
        self,
        language: str,
        notification_type: str,
        emergency_type: str,
        template: Dict[str, Any]
    ):
        """添加自定义模板"""
        try:
            if language not in self.templates:
                self.templates[language] = {}
            
            if notification_type not in self.templates[language]:
                self.templates[language][notification_type] = {}
            
            self.templates[language][notification_type][emergency_type] = template
            
            logger.info(f"Custom template added: {language}/{notification_type}/{emergency_type}")
            
        except Exception as e:
            logger.error(f"Failed to add custom template: {e}")
            raise
    
    def get_supported_languages(self) -> List[str]:
        """获取支持的语言列表"""
        return list(self.templates.keys())
    
    def get_supported_emergency_types(self, language: str = "zh-CN") -> List[str]:
        """获取支持的紧急类型列表"""
        if language in self.templates and "emergency" in self.templates[language]:
            return list(self.templates[language]["emergency"].keys())
        return []


# 全局模板实例
notification_template = NotificationTemplate()


def get_notification_content(
    emergency_type: str,
    notification_type: str = "emergency",
    language: str = "zh-CN",
    **kwargs
) -> Dict[str, str]:
    """
    便捷函数：生成通知内容
    
    Args:
        emergency_type: 紧急类型
        notification_type: 通知类型
        language: 语言代码
        **kwargs: 模板数据
        
    Returns:
        Dict: 通知内容
    """
    return notification_template.generate_notification_content(
        emergency_type, notification_type, language, kwargs
    )