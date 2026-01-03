#!/usr/bin/env python3
"""
测试个性化操作手册系统

演示如何为用户创建个性化的紧急操作流程
"""

import asyncio
import json
import sys
import os
from datetime import datetime

# 添加src目录到Python路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from operation_manual import OperationManual, OperationType, UserProfile, PersonalizationTemplate
from emergency_coordinator import EmergencyData, EmergencyAnalysis, EmergencyType, SeverityLevel


async def test_user_profile_creation():
    """测试用户资料创建"""
    print("=== 测试用户资料创建 ===")
    
    manual = OperationManual()
    
    # 创建示例用户数据
    user_data = {
        "user_id": "user_001",
        "name": "张三",
        "age": 35,
        "location": "北京市朝阳区",
        "medical_conditions": ["高血压", "糖尿病"],
        "insurance_info": {
            "providers": ["中国人寿", "平安保险"],
            "policies": ["LIFE001", "HEALTH002"]
        },
        "emergency_contacts": [
            {"name": "李四", "relationship": "配偶", "phone": "138-0000-1111"},
            {"name": "王五", "relationship": "兄弟", "phone": "139-0000-2222"}
        ],
        "preferred_hospitals": [
            {"name": "北京协和医院", "address": "东城区", "distance": 5},
            {"name": "北京大学第一医院", "address": "西城区", "distance": 8}
        ],
        "financial_preferences": {
            "auto_approve_threshold": 5000,
            "max_monthly_support": 20000,
            "require_receipts": True
        },
        "communication_preferences": {
            "channels": ["sms", "wechat", "email"],
            "language": "zh-CN"
        },
        "risk_tolerance": "medium"
    }
    
    # 创建用户资料
    profile = manual.create_user_profile(user_data)
    print(f"创建用户资料: {profile.name} (ID: {profile.user_id})")
    print(f"医疗状况: {', '.join(profile.medical_conditions)}")
    print(f"首选医院: {len(profile.preferred_hospitals)} 家")
    print(f"紧急联系人: {len(profile.emergency_contacts)} 人")
    print(f"风险承受能力: {profile.risk_tolerance}")
    
    # 获取用户资料
    retrieved_profile = manual.get_user_profile("user_001")
    print(f"获取用户资料: {'成功' if retrieved_profile else '失败'}")
    
    print("✅ 用户资料创建测试完成\n")
    return profile


async def test_personalization_templates():
    """测试个性化模板"""
    print("=== 测试个性化模板 ===")
    
    manual = OperationManual()
    
    # 获取所有个性化模板
    templates = manual.get_personalization_templates()
    print(f"可用个性化模板: {len(templates)} 个")
    
    for template_id, template in templates.items():
        print(f"\n模板: {template.name}")
        print(f"  描述: {template.description}")
        print(f"  适用场景: {', '.join(template.target_scenarios)}")
        print(f"  可定制字段: {len(template.customizable_fields)} 个")
        
        # 生成配置表单
        form_config = manual.generate_personalization_form(template_id)
        if form_config:
            print(f"  表单字段: {len(form_config['fields'])} 个")
            for field in form_config['fields'][:3]:  # 只显示前3个字段
                print(f"    - {field['label']} ({field['type']})")
    
    print("\n✅ 个性化模板测试完成\n")


async def test_custom_template_creation():
    """测试自定义模板创建"""
    print("=== 测试自定义模板创建 ===")
    
    manual = OperationManual()
    
    # 先创建用户资料
    user_data = {
        "user_id": "user_002",
        "name": "李医生",
        "age": 45,
        "location": "上海市浦东新区",
        "medical_conditions": ["心脏病"],
        "risk_tolerance": "low"  # 低风险承受能力
    }
    
    profile = manual.create_user_profile(user_data)
    print(f"创建用户: {profile.name}")
    
    # 创建个性化医疗模板配置
    template_config = {
        "steps": {
            "med_01": {
                "title": "专业医疗文档验证（心脏病专科）",
                "description": "针对心脏病患者的专业医疗文档验证，包括心电图和血液检查",
                "estimated_duration_minutes": 25,  # 比标准时间长
                "parameters": {
                    "required_documents": ["心电图", "血液检查", "诊断书", "医生执照"],
                    "specialist_required": True,
                    "cardiology_verification": True
                }
            },
            "med_03": {
                "parameters": {
                    "required_signatures": 3,  # 因为风险承受能力低，增加签名要求
                    "signature_timeout_hours": 4,  # 延长签名时间
                    "family_consent_required": True
                }
            }
        },
        "additional_steps": [
            {
                "step_id": "med_06",
                "step_type": "monitoring",
                "title": "心脏病专科监控",
                "description": "针对心脏病患者的专业医疗监控和随访",
                "required": True,
                "estimated_duration_minutes": 90,
                "dependencies": ["med_05"],
                "parameters": {
                    "specialist_monitoring": True,
                    "monitoring_frequency": "daily",
                    "alert_thresholds": {"heart_rate": [60, 100], "blood_pressure": [90, 140]}
                }
            }
        ]
    }
    
    # 创建个性化模板
    success = manual.create_personalized_template("user_002", "medical_treatment", template_config)
    print(f"创建个性化医疗模板: {'成功' if success else '失败'}")
    
    # 获取用户自定义模板
    custom_templates = manual.get_user_custom_templates("user_002")
    print(f"用户自定义模板数量: {len(custom_templates)}")
    
    if "medical_treatment" in custom_templates:
        steps = custom_templates["medical_treatment"]
        print(f"个性化医疗模板步骤数: {len(steps)}")
        for step in steps:
            print(f"  - {step.step_id}: {step.title} ({step.estimated_duration_minutes}分钟)")
    
    print("✅ 自定义模板创建测试完成\n")
    return "user_002"


async def test_personalized_execution():
    """测试个性化执行流程"""
    print("=== 测试个性化执行流程 ===")
    
    manual = OperationManual()
    
    # 创建两个不同的用户
    # 用户1: 高风险承受能力，年轻，健康
    user1_data = {
        "user_id": "user_young",
        "name": "小王",
        "age": 25,
        "location": "深圳市南山区",
        "medical_conditions": [],
        "risk_tolerance": "high",
        "communication_preferences": {"channels": ["wechat", "sms"]},
        "financial_preferences": {"auto_approve_threshold": 10000}
    }
    
    # 用户2: 低风险承受能力，年长，有慢性病
    user2_data = {
        "user_id": "user_senior",
        "name": "老张",
        "age": 65,
        "location": "北京市西城区",
        "medical_conditions": ["高血压", "糖尿病", "心脏病"],
        "risk_tolerance": "low",
        "communication_preferences": {"channels": ["phone", "email"]},
        "financial_preferences": {"auto_approve_threshold": 2000}
    }
    
    profile1 = manual.create_user_profile(user1_data)
    profile2 = manual.create_user_profile(user2_data)
    
    print(f"创建用户: {profile1.name} (高风险承受) 和 {profile2.name} (低风险承受)")
    
    # 创建相同的紧急情况
    emergency_data = EmergencyData(
        emergency_id="emerg_compare",
        user_address="0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
        emergency_type=EmergencyType.MEDICAL_EMERGENCY,
        institution_name="北京协和医院",
        institution_address="0x8ba1f109551bD432803012645Hac136c22C177e9",
        documents=[],
        requested_amount=30.0,
        zk_proof={},
        timestamp=datetime.now(),
        contact_info={"phone": "123-456-7890", "email": "test@example.com"}
    )
    
    analysis = EmergencyAnalysis(
        severity_level=SeverityLevel.HIGH,
        urgency_score=80,
        recommended_amount=25.0,
        confidence_score=0.90,
        risk_factors=["需要手术"],
        reasoning="需要紧急手术治疗",
        institution_credibility=0.85
    )
    
    # 为两个用户生成操作步骤
    print("\n--- 用户1 (高风险承受) 的操作步骤 ---")
    steps1 = await manual.get_operation_steps("medical_treatment", emergency_data, analysis, "user_young")
    for step in steps1:
        print(f"  {step.step_id}: {step.title}")
        print(f"    时长: {step.estimated_duration_minutes}分钟")
        if "required_signatures" in step.parameters:
            print(f"    所需签名: {step.parameters['required_signatures']}")
        if "notification_channels" in step.parameters:
            print(f"    通知渠道: {', '.join(step.parameters['notification_channels'])}")
    
    print("\n--- 用户2 (低风险承受) 的操作步骤 ---")
    steps2 = await manual.get_operation_steps("medical_treatment", emergency_data, analysis, "user_senior")
    for step in steps2:
        print(f"  {step.step_id}: {step.title}")
        print(f"    时长: {step.estimated_duration_minutes}分钟")
        if "required_signatures" in step.parameters:
            print(f"    所需签名: {step.parameters['required_signatures']}")
        if "notification_channels" in step.parameters:
            print(f"    通知渠道: {', '.join(step.parameters['notification_channels'])}")
        if "enhanced_medical_verification" in step.parameters:
            print(f"    增强医疗验证: 是")
    
    # 比较差异
    print("\n--- 个性化差异对比 ---")
    total_time1 = sum(s.estimated_duration_minutes for s in steps1 if s.required)
    total_time2 = sum(s.estimated_duration_minutes for s in steps2 if s.required)
    print(f"总执行时间: 用户1 {total_time1}分钟 vs 用户2 {total_time2}分钟")
    
    # 统计签名要求
    sigs1 = [s.parameters.get("required_signatures", 0) for s in steps1 if "required_signatures" in s.parameters]
    sigs2 = [s.parameters.get("required_signatures", 0) for s in steps2 if "required_signatures" in s.parameters]
    if sigs1 and sigs2:
        print(f"签名要求: 用户1 {max(sigs1)} vs 用户2 {max(sigs2)}")
    
    print("✅ 个性化执行流程测试完成\n")


async def test_personalization_form_generation():
    """测试个性化表单生成"""
    print("=== 测试个性化表单生成 ===")
    
    manual = OperationManual()
    
    # 生成医疗个性化表单
    form_config = manual.generate_personalization_form("medical_personalized")
    
    if form_config:
        print(f"表单名称: {form_config['name']}")
        print(f"表单描述: {form_config['description']}")
        print(f"表单字段数: {len(form_config['fields'])}")
        
        print("\n表单字段详情:")
        for field in form_config['fields']:
            print(f"  字段: {field['label']}")
            print(f"    名称: {field['name']}")
            print(f"    类型: {field['type']}")
            print(f"    必填: {'是' if field['required'] else '否'}")
            if field.get('default_value'):
                print(f"    默认值: {field['default_value']}")
            if field.get('validation'):
                print(f"    验证规则: {field['validation']}")
            print()
    
    print("✅ 个性化表单生成测试完成\n")


async def main():
    """主测试函数"""
    print("🚀 开始个性化操作手册系统测试\n")
    
    try:
        # 测试各个功能
        await test_user_profile_creation()
        await test_personalization_templates()
        await test_custom_template_creation()
        await test_personalized_execution()
        await test_personalization_form_generation()
        
        print("🎉 所有个性化功能测试完成！")
        
        # 总结个性化功能
        print("\n📋 个性化功能总结:")
        print("✅ 用户资料管理 - 支持医疗、保险、财务等个人信息")
        print("✅ 个性化模板 - 3种预设模板（医疗、家庭、保险）")
        print("✅ 自定义模板 - 用户可完全自定义操作流程")
        print("✅ 智能调整 - 基于风险承受能力和个人偏好自动调整")
        print("✅ 表单生成 - 自动生成个性化配置表单")
        print("✅ 差异化执行 - 不同用户获得不同的操作流程")
        
    except Exception as e:
        print(f"\n❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())