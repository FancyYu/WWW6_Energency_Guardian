"""
Operation Manual - 操作手册系统

定义不同紧急情况的标准化处理流程和模板，包括：
- 医疗紧急情况处理流程
- 意外保险理赔流程  
- 家庭紧急支持流程
- 法律援助申请流程
- 个性化用户操作手册定制
"""

import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum

logger = logging.getLogger(__name__)


class OperationType(Enum):
    """操作类型"""
    MEDICAL_TREATMENT = "medical_treatment"
    INSURANCE_CLAIM = "insurance_claim"
    FAMILY_ASSISTANCE = "family_assistance"
    LEGAL_SUPPORT = "legal_support"
    FINANCIAL_PROTECTION = "financial_protection"
    SECURITY_RESPONSE = "security_response"
    GENERAL_EMERGENCY = "general_emergency"


class StepType(Enum):
    """步骤类型"""
    VERIFICATION = "verification"
    NOTIFICATION = "notification"
    DOCUMENTATION = "documentation"
    APPROVAL = "approval"
    EXECUTION = "execution"
    MONITORING = "monitoring"


class PersonalizationLevel(Enum):
    """个性化级别"""
    BASIC = "basic"           # 基础个性化
    ADVANCED = "advanced"     # 高级个性化
    CUSTOM = "custom"         # 完全自定义


@dataclass
class UserProfile:
    """用户个人资料"""
    user_id: str
    name: str
    age: int
    location: str
    medical_conditions: List[str]
    insurance_info: Dict[str, Any]
    emergency_contacts: List[Dict[str, str]]
    preferred_hospitals: List[Dict[str, str]]
    financial_preferences: Dict[str, Any]
    communication_preferences: Dict[str, Any]
    risk_tolerance: str  # "low", "medium", "high"
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class PersonalizationTemplate:
    """个性化模板"""
    template_id: str
    name: str
    description: str
    target_scenarios: List[str]
    customizable_fields: List[str]
    default_values: Dict[str, Any]
    validation_rules: Dict[str, Any]
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class OperationStep:
    """操作步骤"""
    step_id: str
    step_type: StepType
    title: str
    description: str
    required: bool
    estimated_duration_minutes: int
    dependencies: List[str] = None
    parameters: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.dependencies is None:
            self.dependencies = []
        if self.parameters is None:
            self.parameters = {}
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典格式"""
        data = asdict(self)
        data['step_type'] = self.step_type.value
        return data


class OperationManual:
    """
    操作手册 - 标准化紧急处理流程
    
    提供不同类型紧急情况的标准化处理模板和流程
    """
    
    def __init__(self):
        self.operation_templates = self._initialize_operation_templates()
        self.personalization_templates = self._initialize_personalization_templates()
        self.user_profiles: Dict[str, UserProfile] = {}
        self.user_custom_templates: Dict[str, Dict[str, List[OperationStep]]] = {}
        logger.info("Operation Manual initialized with templates and personalization support")
    
    def _initialize_operation_templates(self) -> Dict[str, List[OperationStep]]:
        """初始化操作模板"""
        templates = {}
        
        # 医疗紧急情况处理流程
        templates[OperationType.MEDICAL_TREATMENT.value] = self._create_medical_treatment_template()
        
        # 意外保险理赔流程
        templates[OperationType.INSURANCE_CLAIM.value] = self._create_insurance_claim_template()
        
        # 家庭紧急支持流程
        templates[OperationType.FAMILY_ASSISTANCE.value] = self._create_family_assistance_template()
        
        # 法律援助申请流程
        templates[OperationType.LEGAL_SUPPORT.value] = self._create_legal_support_template()
        
        # 通用紧急情况处理流程
        templates[OperationType.GENERAL_EMERGENCY.value] = self._create_general_emergency_template()
        
        return templates
    
    def _initialize_personalization_templates(self) -> Dict[str, PersonalizationTemplate]:
        """初始化个性化模板"""
        templates = {}
        
        # 医疗个性化模板
        templates["medical_personalized"] = PersonalizationTemplate(
            template_id="medical_personalized",
            name="个性化医疗紧急处理",
            description="根据用户医疗史和偏好定制的医疗紧急处理流程",
            target_scenarios=["medical_emergency"],
            customizable_fields=[
                "preferred_hospitals",
                "medical_conditions",
                "insurance_provider",
                "emergency_contacts",
                "medication_allergies",
                "preferred_doctors",
                "medical_history"
            ],
            default_values={
                "max_travel_distance": 30,  # 公里
                "preferred_notification_method": "sms",
                "require_family_consent": True,
                "auto_share_medical_history": False
            },
            validation_rules={
                "preferred_hospitals": {"min_count": 1, "max_count": 5},
                "emergency_contacts": {"min_count": 2, "max_count": 10},
                "max_travel_distance": {"min": 5, "max": 100}
            }
        )
        
        # 家庭支持个性化模板
        templates["family_personalized"] = PersonalizationTemplate(
            template_id="family_personalized",
            name="个性化家庭支持",
            description="根据家庭结构和财务状况定制的家庭支持流程",
            target_scenarios=["family_support"],
            customizable_fields=[
                "family_members",
                "monthly_expenses",
                "emergency_fund_threshold",
                "priority_expenses",
                "payment_methods",
                "financial_institutions"
            ],
            default_values={
                "max_monthly_support": 10000,  # 人民币
                "auto_approve_threshold": 1000,
                "require_receipts": True,
                "support_duration_months": 3
            },
            validation_rules={
                "max_monthly_support": {"min": 1000, "max": 100000},
                "family_members": {"min_count": 1, "max_count": 20}
            }
        )
        
        # 保险理赔个性化模板
        templates["insurance_personalized"] = PersonalizationTemplate(
            template_id="insurance_personalized",
            name="个性化保险理赔",
            description="根据保险类型和理赔历史定制的理赔流程",
            target_scenarios=["insurance_claim"],
            customizable_fields=[
                "insurance_policies",
                "claim_history",
                "preferred_adjusters",
                "documentation_preferences",
                "settlement_preferences"
            ],
            default_values={
                "auto_submit_claims": False,
                "require_multiple_quotes": True,
                "preferred_settlement_method": "bank_transfer",
                "claim_follow_up_frequency": "weekly"
            },
            validation_rules={
                "insurance_policies": {"min_count": 1, "max_count": 10}
            }
        )
        
        return templates
    
    def _create_medical_treatment_template(self) -> List[OperationStep]:
        """创建医疗紧急情况处理模板"""
        return [
            OperationStep(
                step_id="med_01",
                step_type=StepType.VERIFICATION,
                title="医疗文档验证",
                description="验证医疗机构资质和诊断文档的真实性",
                required=True,
                estimated_duration_minutes=15,
                parameters={
                    "required_documents": ["诊断书", "医生执照", "医院资质证明"],
                    "verification_methods": ["机构查询", "文档验证", "医生确认"]
                }
            ),
            OperationStep(
                step_id="med_02",
                step_type=StepType.NOTIFICATION,
                title="紧急医疗通知",
                description="立即通知所有监护人医疗紧急情况",
                required=True,
                estimated_duration_minutes=5,
                dependencies=["med_01"],
                parameters={
                    "notification_channels": ["email", "sms", "push"],
                    "urgency_level": "high",
                    "response_timeout_minutes": 30
                }
            ),
            OperationStep(
                step_id="med_03",
                step_type=StepType.APPROVAL,
                title="监护人授权确认",
                description="收集监护人的医疗支付授权签名",
                required=True,
                estimated_duration_minutes=45,
                dependencies=["med_02"],
                parameters={
                    "required_signatures": 2,
                    "signature_timeout_hours": 2,
                    "auto_approve_threshold": 90
                }
            ),
            OperationStep(
                step_id="med_04",
                step_type=StepType.EXECUTION,
                title="医疗费用支付",
                description="执行智能合约向医疗机构支付费用",
                required=True,
                estimated_duration_minutes=10,
                dependencies=["med_03"],
                parameters={
                    "payment_method": "smart_contract",
                    "verification_required": True,
                    "receipt_generation": True
                }
            ),
            OperationStep(
                step_id="med_05",
                step_type=StepType.MONITORING,
                title="治疗进度跟踪",
                description="监控治疗进度和资金使用情况",
                required=False,
                estimated_duration_minutes=60,
                dependencies=["med_04"],
                parameters={
                    "monitoring_interval_hours": 6,
                    "progress_report_required": True,
                    "fund_usage_tracking": True
                }
            )
        ]
    
    def _create_insurance_claim_template(self) -> List[OperationStep]:
        """创建意外保险理赔模板"""
        return [
            OperationStep(
                step_id="ins_01",
                step_type=StepType.DOCUMENTATION,
                title="事故证明收集",
                description="收集和验证事故相关证明文档",
                required=True,
                estimated_duration_minutes=30,
                parameters={
                    "required_documents": ["事故报告", "医疗证明", "警方记录"],
                    "photo_evidence": True,
                    "witness_statements": False
                }
            ),
            OperationStep(
                step_id="ins_02",
                step_type=StepType.VERIFICATION,
                title="保险条款核实",
                description="核实保险条款和理赔资格",
                required=True,
                estimated_duration_minutes=20,
                dependencies=["ins_01"],
                parameters={
                    "policy_verification": True,
                    "coverage_check": True,
                    "deductible_calculation": True
                }
            ),
            OperationStep(
                step_id="ins_03",
                step_type=StepType.NOTIFICATION,
                title="理赔申请通知",
                description="通知监护人保险理赔申请情况",
                required=True,
                estimated_duration_minutes=10,
                dependencies=["ins_02"],
                parameters={
                    "notification_channels": ["email", "sms"],
                    "claim_details": True,
                    "estimated_payout": True
                }
            ),
            OperationStep(
                step_id="ins_04",
                step_type=StepType.EXECUTION,
                title="理赔资金释放",
                description="执行保险理赔资金的释放和转账",
                required=True,
                estimated_duration_minutes=15,
                dependencies=["ins_03"],
                parameters={
                    "payout_verification": True,
                    "tax_consideration": True,
                    "beneficiary_confirmation": True
                }
            )
        ]
    
    def _create_family_assistance_template(self) -> List[OperationStep]:
        """创建家庭紧急支持模板"""
        return [
            OperationStep(
                step_id="fam_01",
                step_type=StepType.VERIFICATION,
                title="家庭紧急情况评估",
                description="评估家庭紧急情况的真实性和紧急程度",
                required=True,
                estimated_duration_minutes=20,
                parameters={
                    "situation_types": ["生活费", "房租", "教育费", "其他紧急开支"],
                    "urgency_assessment": True,
                    "financial_impact": True
                }
            ),
            OperationStep(
                step_id="fam_02",
                step_type=StepType.NOTIFICATION,
                title="家庭成员通知",
                description="通知相关家庭成员和监护人",
                required=True,
                estimated_duration_minutes=15,
                dependencies=["fam_01"],
                parameters={
                    "family_member_list": True,
                    "situation_summary": True,
                    "assistance_plan": True
                }
            ),
            OperationStep(
                step_id="fam_03",
                step_type=StepType.APPROVAL,
                title="家庭支持授权",
                description="获得家庭支持资金使用授权",
                required=True,
                estimated_duration_minutes=60,
                dependencies=["fam_02"],
                parameters={
                    "required_signatures": 2,
                    "spending_limit": True,
                    "usage_restrictions": True
                }
            ),
            OperationStep(
                step_id="fam_04",
                step_type=StepType.EXECUTION,
                title="支持资金发放",
                description="发放家庭紧急支持资金",
                required=True,
                estimated_duration_minutes=10,
                dependencies=["fam_03"],
                parameters={
                    "payment_schedule": "immediate",
                    "usage_tracking": True,
                    "receipt_required": True
                }
            )
        ]
    
    def _create_legal_support_template(self) -> List[OperationStep]:
        """创建法律援助申请模板"""
        return [
            OperationStep(
                step_id="leg_01",
                step_type=StepType.DOCUMENTATION,
                title="法律案件文档收集",
                description="收集法律案件相关的所有文档和证据",
                required=True,
                estimated_duration_minutes=45,
                parameters={
                    "required_documents": ["法律文件", "证据材料", "相关合同"],
                    "case_type_identification": True,
                    "urgency_level": True
                }
            ),
            OperationStep(
                step_id="leg_02",
                step_type=StepType.VERIFICATION,
                title="法律服务机构验证",
                description="验证法律服务机构的资质和专业能力",
                required=True,
                estimated_duration_minutes=25,
                dependencies=["leg_01"],
                parameters={
                    "lawyer_credentials": True,
                    "firm_reputation": True,
                    "specialization_match": True
                }
            ),
            OperationStep(
                step_id="leg_03",
                step_type=StepType.NOTIFICATION,
                title="法律援助通知",
                description="通知监护人法律援助申请情况",
                required=True,
                estimated_duration_minutes=10,
                dependencies=["leg_02"],
                parameters={
                    "case_summary": True,
                    "cost_estimate": True,
                    "timeline_estimate": True
                }
            ),
            OperationStep(
                step_id="leg_04",
                step_type=StepType.APPROVAL,
                title="法律费用授权",
                description="获得法律服务费用支付授权",
                required=True,
                estimated_duration_minutes=90,
                dependencies=["leg_03"],
                parameters={
                    "required_signatures": 3,
                    "cost_breakdown": True,
                    "payment_schedule": True
                }
            ),
            OperationStep(
                step_id="leg_05",
                step_type=StepType.EXECUTION,
                title="法律服务费用支付",
                description="支付法律服务费用并启动法律程序",
                required=True,
                estimated_duration_minutes=15,
                dependencies=["leg_04"],
                parameters={
                    "retainer_payment": True,
                    "service_agreement": True,
                    "progress_monitoring": True
                }
            )
        ]
    
    def _create_general_emergency_template(self) -> List[OperationStep]:
        """创建通用紧急情况处理模板"""
        return [
            OperationStep(
                step_id="gen_01",
                step_type=StepType.VERIFICATION,
                title="紧急情况评估",
                description="评估紧急情况的类型、严重程度和处理优先级",
                required=True,
                estimated_duration_minutes=20,
                parameters={
                    "assessment_criteria": ["紧急程度", "影响范围", "时间敏感性"],
                    "severity_levels": ["低", "中", "高", "极高"],
                    "priority_matrix": True
                }
            ),
            OperationStep(
                step_id="gen_02",
                step_type=StepType.NOTIFICATION,
                title="紧急通知发送",
                description="向相关监护人和机构发送紧急通知",
                required=True,
                estimated_duration_minutes=10,
                dependencies=["gen_01"],
                parameters={
                    "notification_channels": ["email", "sms", "push"],
                    "escalation_rules": True,
                    "response_tracking": True
                }
            ),
            OperationStep(
                step_id="gen_03",
                step_type=StepType.DOCUMENTATION,
                title="证据和文档收集",
                description="收集处理紧急情况所需的相关证据和文档",
                required=True,
                estimated_duration_minutes=30,
                dependencies=["gen_02"],
                parameters={
                    "document_types": ["身份证明", "紧急情况证明", "授权文件"],
                    "verification_required": True,
                    "digital_signatures": True
                }
            ),
            OperationStep(
                step_id="gen_04",
                step_type=StepType.APPROVAL,
                title="监护人授权确认",
                description="获得监护人的处理授权和资金使用许可",
                required=True,
                estimated_duration_minutes=60,
                dependencies=["gen_03"],
                parameters={
                    "required_signatures": 2,
                    "approval_threshold": "majority",
                    "timeout_hours": 4
                }
            ),
            OperationStep(
                step_id="gen_05",
                step_type=StepType.EXECUTION,
                title="紧急措施执行",
                description="执行批准的紧急措施和资金调用",
                required=True,
                estimated_duration_minutes=15,
                dependencies=["gen_04"],
                parameters={
                    "execution_method": "smart_contract",
                    "verification_steps": True,
                    "rollback_capability": True
                }
            ),
            OperationStep(
                step_id="gen_06",
                step_type=StepType.MONITORING,
                title="执行结果监控",
                description="监控执行结果和后续处理进展",
                required=False,
                estimated_duration_minutes=120,
                dependencies=["gen_05"],
                parameters={
                    "monitoring_duration_hours": 24,
                    "status_updates": True,
                    "completion_verification": True
                }
            )
        ]
    
    async def get_operation_steps(self, operation_type: str, emergency_data, analysis, user_id: str = None) -> List[OperationStep]:
        """
        获取操作步骤（支持个性化）
        
        Args:
            operation_type: 操作类型
            emergency_data: 紧急情况数据
            analysis: AI分析结果
            user_id: 用户ID（可选，用于个性化）
            
        Returns:
            List[OperationStep]: 操作步骤列表
        """
        try:
            # 检查是否有用户个性化模板
            if user_id and user_id in self.user_custom_templates:
                user_templates = self.user_custom_templates[user_id]
                if operation_type in user_templates:
                    logger.info(f"Using personalized template for user {user_id}, operation {operation_type}")
                    base_steps = user_templates[operation_type]
                else:
                    base_steps = self.operation_templates.get(operation_type, [])
            else:
                base_steps = self.operation_templates.get(operation_type, [])
            
            if not base_steps and operation_type not in self.operation_templates:
                logger.warning(f"Unknown operation type: {operation_type}, using general template")
                operation_type = OperationType.GENERAL_EMERGENCY.value
                base_steps = self.operation_templates.get(operation_type, [])
            
            # 根据紧急情况和分析结果定制步骤
            customized_steps = await self._customize_steps(base_steps, emergency_data, analysis, user_id)
            
            logger.info(f"Generated {len(customized_steps)} operation steps for {operation_type}")
            return customized_steps
            
        except Exception as e:
            logger.error(f"Failed to get operation steps: {e}")
            return []
    
    async def _customize_steps(self, base_steps: List[OperationStep], emergency_data, analysis, user_id: str = None) -> List[OperationStep]:
        """
        根据具体情况定制操作步骤（支持个性化）
        
        Args:
            base_steps: 基础步骤模板
            emergency_data: 紧急情况数据
            analysis: AI分析结果
            user_id: 用户ID（可选）
            
        Returns:
            List[OperationStep]: 定制化步骤
        """
        try:
            customized_steps = []
            user_profile = self.user_profiles.get(user_id) if user_id else None
            
            for step in base_steps:
                # 复制步骤
                custom_step = OperationStep(
                    step_id=step.step_id,
                    step_type=step.step_type,
                    title=step.title,
                    description=step.description,
                    required=step.required,
                    estimated_duration_minutes=step.estimated_duration_minutes,
                    dependencies=step.dependencies.copy(),
                    parameters=step.parameters.copy()
                )
                
                # 应用用户个性化设置
                if user_profile:
                    custom_step = await self._apply_user_personalization(custom_step, user_profile, emergency_data)
                
                # 根据紧急程度调整步骤
                if analysis.urgency_score >= 90:
                    # 极度紧急，缩短时间
                    custom_step.estimated_duration_minutes = max(5, custom_step.estimated_duration_minutes // 2)
                    
                    # 减少签名要求
                    if "required_signatures" in custom_step.parameters:
                        custom_step.parameters["required_signatures"] = max(1, custom_step.parameters["required_signatures"] - 1)
                
                elif analysis.urgency_score >= 75:
                    # 高度紧急，适度缩短时间
                    custom_step.estimated_duration_minutes = max(10, int(custom_step.estimated_duration_minutes * 0.75))
                
                # 根据金额调整审批要求
                if emergency_data.requested_amount > 100:  # 大额支付
                    if "required_signatures" in custom_step.parameters:
                        custom_step.parameters["required_signatures"] = min(5, custom_step.parameters["required_signatures"] + 1)
                
                # 根据机构可信度调整验证要求
                if analysis.institution_credibility < 0.7:
                    if step.step_type == StepType.VERIFICATION:
                        custom_step.parameters["enhanced_verification"] = True
                        custom_step.estimated_duration_minutes += 15
                
                customized_steps.append(custom_step)
            
            return customized_steps
            
        except Exception as e:
            logger.error(f"Failed to customize steps: {e}")
            return base_steps
    
    def get_operation_template(self, operation_type: str) -> List[OperationStep]:
        """
        获取操作模板
        
        Args:
            operation_type: 操作类型
            
        Returns:
            List[OperationStep]: 操作步骤模板
        """
        return self.operation_templates.get(operation_type, [])
    
    def add_custom_template(self, operation_type: str, steps: List[OperationStep]):
        """
        添加自定义操作模板
        
        Args:
            operation_type: 操作类型
            steps: 操作步骤列表
        """
        self.operation_templates[operation_type] = steps
        logger.info(f"Added custom template for {operation_type}")
    
    def get_available_operation_types(self) -> List[str]:
        """
        获取可用的操作类型
        
        Returns:
            List[str]: 操作类型列表
        """
        return list(self.operation_templates.keys())
    
    def estimate_total_duration(self, operation_type: str) -> int:
        """
        估算操作总时长
        
        Args:
            operation_type: 操作类型
            
        Returns:
            int: 估算时长（分钟）
        """
        steps = self.operation_templates.get(operation_type, [])
        return sum(step.estimated_duration_minutes for step in steps if step.required)
    
    # ==================== 个性化功能 ====================
    
    async def _apply_user_personalization(self, step: OperationStep, user_profile: UserProfile, emergency_data) -> OperationStep:
        """
        应用用户个性化设置到操作步骤
        
        Args:
            step: 操作步骤
            user_profile: 用户资料
            emergency_data: 紧急情况数据
            
        Returns:
            OperationStep: 个性化后的步骤
        """
        try:
            # 根据用户偏好调整通知方式
            if step.step_type == StepType.NOTIFICATION:
                preferred_channels = user_profile.communication_preferences.get("channels", ["email", "sms"])
                step.parameters["notification_channels"] = preferred_channels
                
                # 调整响应超时时间
                if user_profile.risk_tolerance == "high":
                    step.parameters["response_timeout_minutes"] = step.parameters.get("response_timeout_minutes", 30) // 2
                elif user_profile.risk_tolerance == "low":
                    step.parameters["response_timeout_minutes"] = step.parameters.get("response_timeout_minutes", 30) * 2
            
            # 根据用户医疗信息调整医疗步骤
            if "medical" in step.step_id and user_profile.medical_conditions:
                step.parameters["medical_conditions"] = user_profile.medical_conditions
                step.parameters["preferred_hospitals"] = user_profile.preferred_hospitals
                
                # 如果有严重医疗条件，增加验证步骤
                critical_conditions = ["heart_disease", "diabetes", "hypertension", "asthma"]
                if any(condition in user_profile.medical_conditions for condition in critical_conditions):
                    step.parameters["enhanced_medical_verification"] = True
                    step.estimated_duration_minutes += 10
            
            # 根据保险信息调整保险相关步骤
            if "insurance" in step.step_id or step.step_type == StepType.DOCUMENTATION:
                if user_profile.insurance_info:
                    step.parameters["insurance_providers"] = user_profile.insurance_info.get("providers", [])
                    step.parameters["policy_numbers"] = user_profile.insurance_info.get("policies", [])
            
            # 根据财务偏好调整审批步骤
            if step.step_type == StepType.APPROVAL:
                financial_prefs = user_profile.financial_preferences
                
                # 调整自动审批阈值
                if "auto_approve_threshold" in financial_prefs:
                    step.parameters["auto_approve_threshold"] = financial_prefs["auto_approve_threshold"]
                
                # 根据风险承受能力调整签名要求
                if user_profile.risk_tolerance == "low":
                    current_sigs = step.parameters.get("required_signatures", 2)
                    step.parameters["required_signatures"] = min(5, current_sigs + 1)
                elif user_profile.risk_tolerance == "high":
                    current_sigs = step.parameters.get("required_signatures", 2)
                    step.parameters["required_signatures"] = max(1, current_sigs - 1)
            
            return step
            
        except Exception as e:
            logger.error(f"Failed to apply user personalization: {e}")
            return step
    
    def create_user_profile(self, user_data: Dict[str, Any]) -> UserProfile:
        """
        创建用户资料
        
        Args:
            user_data: 用户数据字典
            
        Returns:
            UserProfile: 用户资料对象
        """
        try:
            profile = UserProfile(
                user_id=user_data["user_id"],
                name=user_data.get("name", ""),
                age=user_data.get("age", 0),
                location=user_data.get("location", ""),
                medical_conditions=user_data.get("medical_conditions", []),
                insurance_info=user_data.get("insurance_info", {}),
                emergency_contacts=user_data.get("emergency_contacts", []),
                preferred_hospitals=user_data.get("preferred_hospitals", []),
                financial_preferences=user_data.get("financial_preferences", {}),
                communication_preferences=user_data.get("communication_preferences", {}),
                risk_tolerance=user_data.get("risk_tolerance", "medium")
            )
            
            self.user_profiles[profile.user_id] = profile
            logger.info(f"Created user profile for {profile.user_id}")
            return profile
            
        except Exception as e:
            logger.error(f"Failed to create user profile: {e}")
            raise
    
    def update_user_profile(self, user_id: str, updates: Dict[str, Any]) -> bool:
        """
        更新用户资料
        
        Args:
            user_id: 用户ID
            updates: 更新数据
            
        Returns:
            bool: 是否成功更新
        """
        try:
            if user_id not in self.user_profiles:
                logger.error(f"User profile not found: {user_id}")
                return False
            
            profile = self.user_profiles[user_id]
            
            # 更新允许的字段
            updatable_fields = [
                "name", "age", "location", "medical_conditions", "insurance_info",
                "emergency_contacts", "preferred_hospitals", "financial_preferences",
                "communication_preferences", "risk_tolerance"
            ]
            
            for field, value in updates.items():
                if field in updatable_fields and hasattr(profile, field):
                    setattr(profile, field, value)
            
            logger.info(f"Updated user profile for {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to update user profile: {e}")
            return False
    
    def get_user_profile(self, user_id: str) -> Optional[UserProfile]:
        """
        获取用户资料
        
        Args:
            user_id: 用户ID
            
        Returns:
            UserProfile: 用户资料对象
        """
        return self.user_profiles.get(user_id)
    
    def create_personalized_template(self, user_id: str, operation_type: str, template_config: Dict[str, Any]) -> bool:
        """
        创建个性化操作模板
        
        Args:
            user_id: 用户ID
            operation_type: 操作类型
            template_config: 模板配置
            
        Returns:
            bool: 是否成功创建
        """
        try:
            if user_id not in self.user_custom_templates:
                self.user_custom_templates[user_id] = {}
            
            # 获取基础模板
            base_template = self.operation_templates.get(operation_type, [])
            if not base_template:
                logger.error(f"Base template not found for operation type: {operation_type}")
                return False
            
            # 创建个性化步骤
            personalized_steps = []
            
            for base_step in base_template:
                # 复制基础步骤
                custom_step = OperationStep(
                    step_id=base_step.step_id,
                    step_type=base_step.step_type,
                    title=base_step.title,
                    description=base_step.description,
                    required=base_step.required,
                    estimated_duration_minutes=base_step.estimated_duration_minutes,
                    dependencies=base_step.dependencies.copy(),
                    parameters=base_step.parameters.copy()
                )
                
                # 应用用户自定义配置
                step_config = template_config.get("steps", {}).get(base_step.step_id, {})
                
                if "title" in step_config:
                    custom_step.title = step_config["title"]
                if "description" in step_config:
                    custom_step.description = step_config["description"]
                if "estimated_duration_minutes" in step_config:
                    custom_step.estimated_duration_minutes = step_config["estimated_duration_minutes"]
                if "required" in step_config:
                    custom_step.required = step_config["required"]
                if "parameters" in step_config:
                    custom_step.parameters.update(step_config["parameters"])
                
                personalized_steps.append(custom_step)
            
            # 添加用户自定义的额外步骤
            if "additional_steps" in template_config:
                for additional_step_config in template_config["additional_steps"]:
                    additional_step = OperationStep(
                        step_id=additional_step_config["step_id"],
                        step_type=StepType(additional_step_config["step_type"]),
                        title=additional_step_config["title"],
                        description=additional_step_config["description"],
                        required=additional_step_config.get("required", True),
                        estimated_duration_minutes=additional_step_config.get("estimated_duration_minutes", 30),
                        dependencies=additional_step_config.get("dependencies", []),
                        parameters=additional_step_config.get("parameters", {})
                    )
                    personalized_steps.append(additional_step)
            
            self.user_custom_templates[user_id][operation_type] = personalized_steps
            
            logger.info(f"Created personalized template for user {user_id}, operation {operation_type}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to create personalized template: {e}")
            return False
    
    def get_personalization_templates(self) -> Dict[str, PersonalizationTemplate]:
        """
        获取所有个性化模板
        
        Returns:
            Dict: 个性化模板字典
        """
        return self.personalization_templates
    
    def get_user_custom_templates(self, user_id: str) -> Dict[str, List[OperationStep]]:
        """
        获取用户自定义模板
        
        Args:
            user_id: 用户ID
            
        Returns:
            Dict: 用户自定义模板
        """
        return self.user_custom_templates.get(user_id, {})
    
    def generate_personalization_form(self, template_id: str) -> Dict[str, Any]:
        """
        生成个性化配置表单
        
        Args:
            template_id: 模板ID
            
        Returns:
            Dict: 表单配置
        """
        try:
            if template_id not in self.personalization_templates:
                logger.error(f"Personalization template not found: {template_id}")
                return {}
            
            template = self.personalization_templates[template_id]
            
            form_config = {
                "template_id": template_id,
                "name": template.name,
                "description": template.description,
                "fields": []
            }
            
            # 生成表单字段
            for field_name in template.customizable_fields:
                field_config = {
                    "name": field_name,
                    "label": self._get_field_label(field_name),
                    "type": self._get_field_type(field_name),
                    "required": field_name in ["emergency_contacts", "preferred_hospitals"],
                    "default_value": template.default_values.get(field_name),
                    "validation": template.validation_rules.get(field_name, {})
                }
                form_config["fields"].append(field_config)
            
            return form_config
            
        except Exception as e:
            logger.error(f"Failed to generate personalization form: {e}")
            return {}
    
    def _get_field_label(self, field_name: str) -> str:
        """获取字段标签"""
        labels = {
            "preferred_hospitals": "首选医院",
            "medical_conditions": "医疗状况",
            "insurance_provider": "保险公司",
            "emergency_contacts": "紧急联系人",
            "medication_allergies": "药物过敏",
            "preferred_doctors": "首选医生",
            "medical_history": "病史",
            "family_members": "家庭成员",
            "monthly_expenses": "月支出",
            "emergency_fund_threshold": "紧急资金阈值",
            "priority_expenses": "优先支出",
            "payment_methods": "支付方式",
            "financial_institutions": "金融机构",
            "insurance_policies": "保险单",
            "claim_history": "理赔历史",
            "preferred_adjusters": "首选理赔员",
            "documentation_preferences": "文档偏好",
            "settlement_preferences": "结算偏好"
        }
        return labels.get(field_name, field_name.replace("_", " ").title())
    
    def _get_field_type(self, field_name: str) -> str:
        """获取字段类型"""
        list_fields = [
            "preferred_hospitals", "medical_conditions", "emergency_contacts",
            "medication_allergies", "preferred_doctors", "family_members",
            "priority_expenses", "payment_methods", "insurance_policies"
        ]
        
        number_fields = [
            "max_travel_distance", "max_monthly_support", "auto_approve_threshold",
            "monthly_expenses", "emergency_fund_threshold"
        ]
        
        boolean_fields = [
            "require_family_consent", "auto_share_medical_history",
            "require_receipts", "auto_submit_claims", "require_multiple_quotes"
        ]
        
        if field_name in list_fields:
            return "array"
        elif field_name in number_fields:
            return "number"
        elif field_name in boolean_fields:
            return "boolean"
        else:
            return "string"