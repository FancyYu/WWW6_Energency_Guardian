#!/usr/bin/env python3
"""
测试执行协调器系统

测试执行协调器、操作手册和签名收集器的集成功能
"""

import asyncio
import json
import sys
import os
from datetime import datetime

# 添加src目录到Python路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from execution_coordinator import ExecutionCoordinator, ExecutionStatus, ExecutionPhase
from operation_manual import OperationManual, OperationType
from signature_collector import SignatureCollector, SignatureStatus
from emergency_coordinator import EmergencyData, EmergencyAnalysis, EmergencyType, SeverityLevel


async def test_operation_manual():
    """测试操作手册功能"""
    print("=== 测试操作手册功能 ===")
    
    manual = OperationManual()
    
    # 测试获取操作类型
    operation_types = manual.get_available_operation_types()
    print(f"可用操作类型: {operation_types}")
    
    # 测试医疗紧急情况模板
    medical_steps = manual.get_operation_template(OperationType.MEDICAL_TREATMENT.value)
    print(f"医疗紧急情况步骤数: {len(medical_steps)}")
    for step in medical_steps:
        print(f"  - {step.step_id}: {step.title} ({step.estimated_duration_minutes}分钟)")
    
    # 测试通用紧急情况模板
    general_steps = manual.get_operation_template(OperationType.GENERAL_EMERGENCY.value)
    print(f"通用紧急情况步骤数: {len(general_steps)}")
    for step in general_steps:
        print(f"  - {step.step_id}: {step.title} ({step.estimated_duration_minutes}分钟)")
    
    # 测试估算总时长
    total_duration = manual.estimate_total_duration(OperationType.MEDICAL_TREATMENT.value)
    print(f"医疗紧急情况预计总时长: {total_duration}分钟")
    
    print("✅ 操作手册测试完成\n")


async def test_signature_collector():
    """测试签名收集器功能"""
    print("=== 测试签名收集器功能 ===")
    
    config = {
        'web3_provider_url': 'http://localhost:8545',
        'ai_agent_private_key': '0x' + '1' * 64
    }
    
    collector = SignatureCollector(config)
    
    # 测试初始化签名收集
    execution_id = "test_exec_001"
    success = await collector.initialize_collection(execution_id, 3, 2)  # 需要3个签名，2小时超时
    print(f"初始化签名收集: {'成功' if success else '失败'}")
    
    # 创建模拟紧急数据
    emergency_data = EmergencyData(
        emergency_id="emerg_001",
        user_address="0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
        emergency_type=EmergencyType.MEDICAL_EMERGENCY,
        institution_name="北京协和医院",
        institution_address="0x8ba1f109551bD432803012645Hac136c22C177e9",
        documents=[],
        requested_amount=50.0,
        zk_proof={},
        timestamp=datetime.now(),
        contact_info={"phone": "123-456-7890", "email": "test@example.com"}
    )
    
    analysis = EmergencyAnalysis(
        severity_level=SeverityLevel.HIGH,
        urgency_score=85,
        recommended_amount=45.5,
        confidence_score=0.92,
        risk_factors=["时间紧急", "需要立即处理"],
        reasoning="高风险紧急医疗情况，建议立即处理",
        institution_credibility=0.88
    )
    
    # 开始签名收集
    success = await collector.start_collection(execution_id, emergency_data, analysis)
    print(f"开始签名收集: {'成功' if success else '失败'}")
    
    # 等待签名收集完成
    print("等待签名收集...")
    for i in range(10):  # 最多等待10秒
        status = await collector.get_collection_status(execution_id)
        if status:
            print(f"签名收集状态: {status.status.value}, 已收集: {status.collected_count}/{status.required_signatures}")
            if status.status == SignatureStatus.COMPLETED:
                break
        await asyncio.sleep(1)
    
    # 获取收集到的签名
    signatures = await collector.get_collected_signatures(execution_id)
    print(f"收集到的签名数量: {len(signatures)}")
    
    # 获取收集器摘要
    summary = collector.get_collection_summary()
    print(f"收集器状态摘要: {summary['total_collections']} 个收集任务")
    
    print("✅ 签名收集器测试完成\n")
    
    return execution_id, emergency_data, analysis


async def test_execution_coordinator():
    """测试执行协调器功能"""
    print("=== 测试执行协调器功能 ===")
    
    config = {
        'web3_provider_url': 'http://localhost:8545',
        'ai_agent_private_key': '0x' + '1' * 64
    }
    
    coordinator = ExecutionCoordinator(config)
    
    # 创建模拟紧急数据
    emergency_data = EmergencyData(
        emergency_id="emerg_002",
        user_address="0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
        emergency_type=EmergencyType.MEDICAL_EMERGENCY,
        institution_name="上海第一人民医院",
        institution_address="0x1234567890123456789012345678901234567890",
        documents=[],
        requested_amount=80.0,
        zk_proof={},
        timestamp=datetime.now(),
        contact_info={"phone": "123-456-7890", "email": "test@example.com"}
    )
    
    analysis = EmergencyAnalysis(
        severity_level=SeverityLevel.CRITICAL,
        urgency_score=95,
        recommended_amount=75.0,
        confidence_score=0.95,
        risk_factors=["生命危险", "极度紧急"],
        reasoning="极度紧急的医疗情况，需要立即处理",
        institution_credibility=0.90
    )
    
    # 创建执行计划
    print("创建执行计划...")
    execution_plan = await coordinator.create_execution_plan(emergency_data, analysis)
    print(f"执行计划ID: {execution_plan.execution_id}")
    print(f"操作类型: {execution_plan.operation_type}")
    print(f"所需签名数: {execution_plan.required_signatures}")
    print(f"时间锁: {execution_plan.timelock_hours} 小时")
    print(f"执行步骤数: {len(execution_plan.steps)}")
    
    # 获取执行状态
    status = await coordinator.get_execution_status(execution_plan.execution_id)
    print(f"执行状态: {json.dumps(status, indent=2, ensure_ascii=False)}")
    
    # 执行计划
    print("\n开始执行计划...")
    result = await coordinator.execute_plan(execution_plan.execution_id)
    
    print(f"执行结果: {'成功' if result.success else '失败'}")
    print(f"消息: {result.message}")
    if result.success:
        print(f"交易哈希: {result.transaction_hash}")
        print(f"完成步骤: {', '.join(result.completed_steps)}")
    else:
        print(f"失败步骤: {result.failed_step}")
    
    # 获取最终状态
    final_status = await coordinator.get_execution_status(execution_plan.execution_id)
    print(f"最终状态: {final_status['status']}")
    
    print("✅ 执行协调器测试完成\n")


async def test_integrated_execution_flow():
    """测试完整的执行流程"""
    print("=== 测试完整执行流程 ===")
    
    # 测试不同类型的紧急情况
    test_scenarios = [
        {
            "name": "医疗紧急情况",
            "emergency_type": EmergencyType.MEDICAL_EMERGENCY,
            "severity": SeverityLevel.HIGH,
            "urgency": 85,
            "amount": 50.0,
            "description": "心脏病发作需要紧急手术"
        },
        {
            "name": "家庭紧急支持",
            "emergency_type": EmergencyType.FAMILY_SUPPORT,
            "severity": SeverityLevel.MEDIUM,
            "urgency": 65,
            "amount": 20.0,
            "description": "家庭成员失业需要生活费支持"
        },
        {
            "name": "法律援助",
            "emergency_type": EmergencyType.LEGAL_ASSISTANCE,
            "severity": SeverityLevel.LOW,
            "urgency": 45,
            "amount": 30.0,
            "description": "合同纠纷需要法律援助"
        }
    ]
    
    config = {
        'web3_provider_url': 'http://localhost:8545',
        'ai_agent_private_key': '0x' + '1' * 64
    }
    
    coordinator = ExecutionCoordinator(config)
    
    for i, scenario in enumerate(test_scenarios):
        print(f"\n--- 测试场景 {i+1}: {scenario['name']} ---")
        
        # 创建紧急数据
        emergency_data = EmergencyData(
            emergency_id=f"emerg_{i+1:03d}",
            user_address="0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
            emergency_type=scenario['emergency_type'],
            institution_name=f"机构_{i+1}",
            institution_address=f"0x{'1' * 40}",
            documents=[],
            requested_amount=scenario['amount'],
            zk_proof={},
            timestamp=datetime.now(),
            contact_info={"phone": "123-456-7890", "email": "test@example.com"}
        )
        
        analysis = EmergencyAnalysis(
            severity_level=scenario['severity'],
            urgency_score=scenario['urgency'],
            recommended_amount=scenario['amount'] * 0.9,
            confidence_score=0.88,
            risk_factors=["需要处理"],
            reasoning=f"{scenario['name']}的分析结果",
            institution_credibility=0.85
        )
        
        # 创建和执行计划
        execution_plan = await coordinator.create_execution_plan(emergency_data, analysis)
        print(f"  执行计划: {execution_plan.execution_id}")
        print(f"  所需签名: {execution_plan.required_signatures}")
        print(f"  时间锁: {execution_plan.timelock_hours} 小时")
        
        # 执行计划
        result = await coordinator.execute_plan(execution_plan.execution_id)
        print(f"  执行结果: {'✅ 成功' if result.success else '❌ 失败'}")
        
        if not result.success:
            print(f"  失败原因: {result.message}")
    
    print("\n✅ 完整执行流程测试完成")


async def main():
    """主测试函数"""
    print("🚀 开始执行协调器系统测试\n")
    
    try:
        # 测试各个组件
        await test_operation_manual()
        await test_signature_collector()
        await test_execution_coordinator()
        await test_integrated_execution_flow()
        
        print("\n🎉 所有测试完成！")
        
    except Exception as e:
        print(f"\n❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())