"""
个性化操作手册 - 基于用户偏好的定制化紧急处理流程

提供个性化的紧急处理模板和用户配置管理
"""

import logging
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, asdict
import asyncio

# 导入基础操作手册
from operation_manual import OperationManual, UserProfile, PersonalizationTemplate

logger = logging.getLogger(__name__)

class PersonalizedOperationManual:
    """
    个性化操作手册 - 扩展基础操作手册，提供个性化功能
    """
    
    def __init__(self):
        # 初始化基础操作手册
        self.base_manual = OperationManual()
        self.user_profiles: Dict[str, UserProfile] = {}
        self.personalized_templates: Dict[str, Dict[str, Any]] = {}
        logger.info("Personalized Operation Manual initialized")
    
    async def create_personalized_manual(
        self, 
        user_address: str, 
        template_type: str, 
        preferences: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        创建个性化操作手册
        
        Args:
            user_address: 用户钱包地址
            template_type: 模板类型 (medical, family, insurance)
            preferences: 用户偏好设置
            
        Returns:
            个性化操作手册
        """
        try:
            # 创建或更新用户配置
            user_profile = UserProfile(
                user_id=user_address,  # 使用钱包地址作为用户ID
                name=preferences.get('name', 'Anonymous User'),
                age=preferences.get('age', 30),
                location=preferences.get('location', 'Unknown'),
                medical_conditions=preferences.get('medical_conditions', []),
                insurance_info=preferences.get('insurance_info', {}),
                emergency_contacts=preferences.get('emergency_contacts', []),
                preferred_hospitals=preferences.get('preferred_hospitals', []),
                financial_preferences=preferences.get('financial_preferences', {}),
                communication_preferences=preferences.get('communication_preferences', {'channels': ['email']}),
                risk_tolerance=preferences.get('risk_tolerance', 'medium')
            )
            
            self.user_profiles[user_address] = user_profile
            
            # 基于模板类型和用户偏好生成个性化手册
            if template_type == "medical":
                manual = await self._create_medical_personalized_manual(user_profile)
            elif template_type == "family":
                manual = await self._create_family_personalized_manual(user_profile)
            elif template_type == "insurance":
                manual = await self._create_insurance_personalized_manual(user_profile)
            else:
                manual = await self._create_general_personalized_manual(user_profile)
            
            # 保存个性化模板
            self.personalized_templates[user_address] = {
                'template_type': template_type,
                'manual': manual,
                'preferences': preferences,
                'created_at': '2026-01-03T23:25:00Z'
            }
            
            logger.info(f"Created personalized manual for user {user_address}, type: {template_type}")
            return manual
            
        except Exception as e:
            logger.error(f"Failed to create personalized manual: {e}")
            raise
    
    async def get_user_profile(self, user_address: str) -> Optional[Dict[str, Any]]:
        """
        获取用户个性化配置
        
        Args:
            user_address: 用户钱包地址
            
        Returns:
            用户配置信息
        """
        try:
            profile = self.user_profiles.get(user_address)
            if profile:
                return asdict(profile)
            
            # 如果没有配置，返回默认配置
            return {
                'user_address': user_address,
                'risk_tolerance': 'medium',
                'communication_preferences': {'channels': ['email']},
                'medical_conditions': [],
                'emergency_contacts': [],
                'preferred_hospitals': [],
                'insurance_info': {},
                'financial_preferences': {}
            }
            
        except Exception as e:
            logger.error(f"Failed to get user profile: {e}")
            return None
    
    async def _create_medical_personalized_manual(self, profile: UserProfile) -> Dict[str, Any]:
        """创建医疗个性化手册"""
        return {
            'manual_type': 'medical_personalized',
            'user_address': profile.user_id,  # 使用user_id字段
            'steps': [
                {
                    'step_id': 1,
                    'title': '紧急医疗评估',
                    'description': f'基于用户医疗条件进行评估: {", ".join(profile.medical_conditions) if profile.medical_conditions else "无特殊医疗条件"}',
                    'duration_minutes': 5,
                    'required_signatures': 1 if profile.risk_tolerance == 'high' else 2,
                    'notification_channels': profile.communication_preferences.get('channels', ['email'])
                },
                {
                    'step_id': 2,
                    'title': '联系首选医院',
                    'description': f'联系用户首选医院: {", ".join(profile.preferred_hospitals) if profile.preferred_hospitals else "使用默认医院"}',
                    'duration_minutes': 10,
                    'required_signatures': 1,
                    'notification_channels': profile.communication_preferences.get('channels', ['email'])
                },
                {
                    'step_id': 3,
                    'title': '保险理赔准备',
                    'description': f'准备保险理赔材料，保险类型: {profile.insurance_info.get("type", "未配置")}',
                    'duration_minutes': 15,
                    'required_signatures': 2,
                    'notification_channels': ['email', 'sms']
                }
            ],
            'personalization': {
                'risk_tolerance': profile.risk_tolerance,
                'medical_conditions': profile.medical_conditions,
                'preferred_hospitals': profile.preferred_hospitals,
                'insurance_info': profile.insurance_info
            }
        }
    
    async def _create_family_personalized_manual(self, profile: UserProfile) -> Dict[str, Any]:
        """创建家庭支持个性化手册"""
        return {
            'manual_type': 'family_personalized',
            'user_address': profile.user_id,  # 使用user_id字段
            'steps': [
                {
                    'step_id': 1,
                    'title': '家庭成员通知',
                    'description': f'通知紧急联系人: {len(profile.emergency_contacts)} 个联系人',
                    'duration_minutes': 5,
                    'required_signatures': 1,
                    'notification_channels': profile.communication_preferences.get('channels', ['email'])
                },
                {
                    'step_id': 2,
                    'title': '财务支持评估',
                    'description': f'评估财务需求，风险承受能力: {profile.risk_tolerance}',
                    'duration_minutes': 10,
                    'required_signatures': 2 if profile.risk_tolerance == 'low' else 1,
                    'notification_channels': profile.communication_preferences.get('channels', ['email'])
                },
                {
                    'step_id': 3,
                    'title': '资金调配',
                    'description': '根据家庭财务偏好进行资金调配',
                    'duration_minutes': 20,
                    'required_signatures': 3 if profile.risk_tolerance == 'low' else 2,
                    'notification_channels': ['email', 'phone']
                }
            ],
            'personalization': {
                'risk_tolerance': profile.risk_tolerance,
                'emergency_contacts': profile.emergency_contacts,
                'financial_preferences': profile.financial_preferences
            }
        }
    
    async def _create_insurance_personalized_manual(self, profile: UserProfile) -> Dict[str, Any]:
        """创建保险理赔个性化手册"""
        return {
            'manual_type': 'insurance_personalized',
            'user_address': profile.user_id,  # 使用user_id字段
            'steps': [
                {
                    'step_id': 1,
                    'title': '保险信息验证',
                    'description': f'验证保险信息: {profile.insurance_info.get("provider", "未配置保险")}',
                    'duration_minutes': 5,
                    'required_signatures': 1,
                    'notification_channels': profile.communication_preferences.get('channels', ['email'])
                },
                {
                    'step_id': 2,
                    'title': '理赔材料准备',
                    'description': '准备理赔所需材料和文档',
                    'duration_minutes': 15,
                    'required_signatures': 2,
                    'notification_channels': profile.communication_preferences.get('channels', ['email'])
                },
                {
                    'step_id': 3,
                    'title': '理赔申请提交',
                    'description': '提交保险理赔申请',
                    'duration_minutes': 10,
                    'required_signatures': 2,
                    'notification_channels': ['email', 'sms']
                }
            ],
            'personalization': {
                'insurance_info': profile.insurance_info,
                'risk_tolerance': profile.risk_tolerance
            }
        }
    
    async def _create_general_personalized_manual(self, profile: UserProfile) -> Dict[str, Any]:
        """创建通用个性化手册"""
        return {
            'manual_type': 'general_personalized',
            'user_address': profile.user_id,  # 使用user_id字段
            'steps': [
                {
                    'step_id': 1,
                    'title': '紧急情况评估',
                    'description': '评估紧急情况严重程度',
                    'duration_minutes': 5,
                    'required_signatures': 1,
                    'notification_channels': profile.communication_preferences.get('channels', ['email'])
                },
                {
                    'step_id': 2,
                    'title': '通知相关方',
                    'description': '通知紧急联系人和相关服务',
                    'duration_minutes': 10,
                    'required_signatures': 1 if profile.risk_tolerance == 'high' else 2,
                    'notification_channels': profile.communication_preferences.get('channels', ['email'])
                },
                {
                    'step_id': 3,
                    'title': '执行应急措施',
                    'description': '根据用户偏好执行应急措施',
                    'duration_minutes': 20,
                    'required_signatures': 2 if profile.risk_tolerance == 'high' else 3,
                    'notification_channels': ['email', 'sms', 'phone']
                }
            ],
            'personalization': {
                'risk_tolerance': profile.risk_tolerance,
                'preferred_communication': profile.communication_preferences.get('channels', ['email'])
            }
        }
    
    def get_personalized_template(self, user_address: str) -> Optional[Dict[str, Any]]:
        """获取用户的个性化模板"""
        return self.personalized_templates.get(user_address)
    
    def list_user_templates(self, user_address: str) -> List[str]:
        """列出用户的所有模板类型"""
        template = self.personalized_templates.get(user_address)
        if template:
            return [template['template_type']]
        return []