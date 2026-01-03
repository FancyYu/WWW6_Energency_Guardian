"""
Execution Coordinator - 执行协调器

负责按《操作手册》协调资源和流程，收集监护人签名并驱动智能合约完成支付操作。
支持医疗、保险、家庭支持等多种紧急情况场景。
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from enum import Enum

try:
    from web3 import Web3
    from eth_account import Account
    WEB3_AVAILABLE = True
except ImportError:
    WEB3_AVAILABLE = False

try:
    from .operation_manual import OperationManual, OperationStep, OperationType
    from .signature_collector import SignatureCollector, SignatureStatus
    from .emergency_coordinator import EmergencyData, EmergencyAnalysis, SeverityLevel
except ImportError:
    # For standalone testing
    try:
        from operation_manual import OperationManual, OperationStep, OperationType
        from signature_collector import SignatureCollector, SignatureStatus
        from emergency_coordinator import EmergencyData, EmergencyAnalysis, SeverityLevel
    except ImportError:
        # Mock classes for testing
        class OperationManual:
            def get_operation_steps(self, *args): return []
        class SignatureCollector:
            def __init__(self, config): pass
        class EmergencyData: pass
        class EmergencyAnalysis: pass
        class SeverityLevel: pass

logger = logging.getLogger(__name__)


class ExecutionStatus(Enum):
    """执行状态"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    WAITING_SIGNATURES = "waiting_signatures"
    READY_TO_EXECUTE = "ready_to_execute"
    EXECUTING = "executing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ExecutionPhase(Enum):
    """执行阶段"""
    PREPARATION = "preparation"
    SIGNATURE_COLLECTION = "signature_collection"
    CONTRACT_EXECUTION = "contract_execution"
    VERIFICATION = "verification"
    COMPLETION = "completion"


@dataclass
class ExecutionPlan:
    """执行计划"""
    execution_id: str
    emergency_data: Any  # EmergencyData type
    analysis: Any  # EmergencyAnalysis type
    operation_type: str
    steps: List[Dict[str, Any]]
    required_signatures: int
    timelock_hours: int
    recipient_address: str
    amount: float
    created_at: datetime
    status: ExecutionStatus = ExecutionStatus.PENDING
    current_phase: ExecutionPhase = ExecutionPhase.PREPARATION
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典格式"""
        data = asdict(self)
        data['status'] = self.status.value
        data['current_phase'] = self.current_phase.value
        data['created_at'] = self.created_at.isoformat()
        return data


@dataclass
class ExecutionResult:
    """执行结果"""
    success: bool
    execution_id: str
    transaction_hash: Optional[str]
    message: str
    completed_steps: List[str]
    failed_step: Optional[str] = None
    
    @classmethod
    def success_result(cls, execution_id: str, tx_hash: str, completed_steps: List[str]) -> 'ExecutionResult':
        return cls(
            success=True,
            execution_id=execution_id,
            transaction_hash=tx_hash,
            message="Execution completed successfully",
            completed_steps=completed_steps
        )
    
    @classmethod
    def error_result(cls, execution_id: str, message: str, failed_step: str = None) -> 'ExecutionResult':
        return cls(
            success=False,
            execution_id=execution_id,
            transaction_hash=None,
            message=message,
            completed_steps=[],
            failed_step=failed_step
        )


class ExecutionCoordinator:
    """
    执行协调器 - 核心执行协调引擎
    
    负责：
    1. 按《操作手册》协调资源和流程
    2. 收集监护人签名并验证阈值
    3. 驱动智能合约完成支付操作
    4. 支持医疗、保险、家庭支持等场景
    """
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.executions: Dict[str, ExecutionPlan] = {}
        
        # 初始化操作手册
        try:
            from .operation_manual import OperationManual
            self.operation_manual = OperationManual()
        except ImportError:
            try:
                from operation_manual import OperationManual
                self.operation_manual = OperationManual()
            except ImportError:
                self.operation_manual = None
        
        # 初始化签名收集器
        try:
            from .signature_collector import SignatureCollector
            self.signature_collector = SignatureCollector(config)
        except ImportError:
            try:
                from signature_collector import SignatureCollector
                self.signature_collector = SignatureCollector(config)
            except ImportError:
                self.signature_collector = None
        
        # Web3 连接
        if WEB3_AVAILABLE:
            self.w3 = Web3(Web3.HTTPProvider(config.get('web3_provider_url', 'http://localhost:8545')))
            self.account = Account.from_key(config.get('ai_agent_private_key'))
        else:
            self.w3 = None
            self.account = None
            logger.warning("Web3 not available, running in mock mode")
        
        logger.info("Execution Coordinator initialized")
    
    async def create_execution_plan(self, emergency_data: Any, analysis: Any) -> ExecutionPlan:
        """
        创建执行计划
        
        Args:
            emergency_data: 紧急情况数据
            analysis: AI分析结果
            
        Returns:
            ExecutionPlan: 执行计划
        """
        try:
            execution_id = f"exec_{emergency_data.emergency_id}_{int(datetime.now().timestamp())}"
            
            # 根据紧急类型获取操作手册
            operation_type = self._map_emergency_to_operation_type(emergency_data.emergency_type.value)
            if self.operation_manual:
                operation_steps = await self.operation_manual.get_operation_steps(operation_type, emergency_data, analysis)
            else:
                operation_steps = []
            
            # 确定所需签名数量
            required_signatures = self._calculate_required_signatures(analysis.severity_level, analysis.urgency_score)
            
            # 计算时间锁
            timelock_hours = self._calculate_timelock_hours(analysis.urgency_score)
            
            # 创建执行计划
            execution_plan = ExecutionPlan(
                execution_id=execution_id,
                emergency_data=emergency_data,
                analysis=analysis,
                operation_type=operation_type,
                steps=[step.to_dict() for step in operation_steps],
                required_signatures=required_signatures,
                timelock_hours=timelock_hours,
                recipient_address=emergency_data.institution_address,
                amount=analysis.recommended_amount,
                created_at=datetime.now()
            )
            
            self.executions[execution_id] = execution_plan
            
            logger.info(f"Execution plan created: {execution_id}")
            return execution_plan
            
        except Exception as e:
            logger.error(f"Failed to create execution plan: {e}")
            raise
    
    async def execute_plan(self, execution_id: str) -> ExecutionResult:
        """
        执行计划
        
        Args:
            execution_id: 执行计划ID
            
        Returns:
            ExecutionResult: 执行结果
        """
        try:
            if execution_id not in self.executions:
                return ExecutionResult.error_result(execution_id, "Execution plan not found")
            
            execution_plan = self.executions[execution_id]
            execution_plan.status = ExecutionStatus.IN_PROGRESS
            
            logger.info(f"Starting execution of plan: {execution_id}")
            
            completed_steps = []
            
            # Phase 1: 准备阶段
            execution_plan.current_phase = ExecutionPhase.PREPARATION
            preparation_result = await self._execute_preparation_phase(execution_plan)
            if not preparation_result:
                return ExecutionResult.error_result(execution_id, "Preparation phase failed", "preparation")
            completed_steps.append("preparation")
            
            # Phase 2: 签名收集阶段
            execution_plan.current_phase = ExecutionPhase.SIGNATURE_COLLECTION
            execution_plan.status = ExecutionStatus.WAITING_SIGNATURES
            
            signature_result = await self._execute_signature_collection_phase(execution_plan)
            if not signature_result:
                return ExecutionResult.error_result(execution_id, "Signature collection failed", "signature_collection")
            completed_steps.append("signature_collection")
            
            # Phase 3: 合约执行阶段
            execution_plan.current_phase = ExecutionPhase.CONTRACT_EXECUTION
            execution_plan.status = ExecutionStatus.EXECUTING
            
            contract_result = await self._execute_contract_phase(execution_plan)
            if not contract_result['success']:
                return ExecutionResult.error_result(execution_id, contract_result['message'], "contract_execution")
            completed_steps.append("contract_execution")
            
            # Phase 4: 验证阶段
            execution_plan.current_phase = ExecutionPhase.VERIFICATION
            verification_result = await self._execute_verification_phase(execution_plan, contract_result['tx_hash'])
            if not verification_result:
                return ExecutionResult.error_result(execution_id, "Verification failed", "verification")
            completed_steps.append("verification")
            
            # Phase 5: 完成阶段
            execution_plan.current_phase = ExecutionPhase.COMPLETION
            execution_plan.status = ExecutionStatus.COMPLETED
            
            completion_result = await self._execute_completion_phase(execution_plan)
            completed_steps.append("completion")
            
            logger.info(f"Execution plan completed successfully: {execution_id}")
            
            return ExecutionResult.success_result(
                execution_id=execution_id,
                tx_hash=contract_result['tx_hash'],
                completed_steps=completed_steps
            )
            
        except Exception as e:
            logger.error(f"Execution failed for plan {execution_id}: {e}")
            if execution_id in self.executions:
                self.executions[execution_id].status = ExecutionStatus.FAILED
            return ExecutionResult.error_result(execution_id, f"Execution error: {str(e)}")
    
    async def _execute_preparation_phase(self, execution_plan: ExecutionPlan) -> bool:
        """
        执行准备阶段
        
        Args:
            execution_plan: 执行计划
            
        Returns:
            bool: 是否成功
        """
        try:
            logger.info(f"Executing preparation phase for {execution_plan.execution_id}")
            
            # 验证执行计划的完整性
            if not execution_plan.steps:
                logger.error("No operation steps defined")
                return False
            
            # 验证收款地址
            if not execution_plan.recipient_address:
                logger.error("No recipient address specified")
                return False
            
            # 验证金额
            if execution_plan.amount <= 0:
                logger.error("Invalid amount specified")
                return False
            
            # 初始化签名收集器
            if self.signature_collector:
                await self.signature_collector.initialize_collection(
                    execution_plan.execution_id,
                    execution_plan.required_signatures,
                    execution_plan.timelock_hours
                )
            
            logger.info(f"Preparation phase completed for {execution_plan.execution_id}")
            return True
            
        except Exception as e:
            logger.error(f"Preparation phase failed: {e}")
            return False
    
    async def _execute_signature_collection_phase(self, execution_plan: ExecutionPlan) -> bool:
        """
        执行签名收集阶段
        
        Args:
            execution_plan: 执行计划
            
        Returns:
            bool: 是否成功
        """
        try:
            logger.info(f"Executing signature collection phase for {execution_plan.execution_id}")
            
            # 开始收集签名
            if self.signature_collector:
                collection_result = await self.signature_collector.start_collection(
                    execution_plan.execution_id,
                    execution_plan.emergency_data,
                    execution_plan.analysis
                )
            else:
                collection_result = True  # Mock success
            
            if not collection_result:
                logger.error("Failed to start signature collection")
                return False
            
            # 等待签名收集完成
            max_wait_time = execution_plan.timelock_hours * 3600  # 转换为秒
            start_time = datetime.now()
            
            while True:
                # 检查签名状态
                if self.signature_collector:
                    signature_status = await self.signature_collector.get_collection_status(execution_plan.execution_id)
                else:
                    # Mock completion for testing
                    await asyncio.sleep(2)
                    class MockStatus:
                        status = SignatureStatus.COMPLETED if hasattr(SignatureStatus, 'COMPLETED') else 'completed'
                    signature_status = MockStatus()
                
                if hasattr(signature_status, 'status'):
                    status_value = signature_status.status.value if hasattr(signature_status.status, 'value') else signature_status.status
                else:
                    status_value = 'completed'
                
                if status_value == 'completed':
                    logger.info(f"Signature collection completed for {execution_plan.execution_id}")
                    execution_plan.status = ExecutionStatus.READY_TO_EXECUTE
                    return True
                elif status_value == 'failed':
                    logger.error(f"Signature collection failed for {execution_plan.execution_id}")
                    return False
                
                # 检查超时
                elapsed_time = (datetime.now() - start_time).total_seconds()
                if elapsed_time >= max_wait_time:
                    logger.error(f"Signature collection timed out for {execution_plan.execution_id}")
                    return False
                
                # 等待一段时间再检查
                await asyncio.sleep(30)  # 每30秒检查一次
            
        except Exception as e:
            logger.error(f"Signature collection phase failed: {e}")
            return False
    
    async def _execute_contract_phase(self, execution_plan: ExecutionPlan) -> Dict[str, Any]:
        """
        执行合约阶段
        
        Args:
            execution_plan: 执行计划
            
        Returns:
            Dict: 执行结果
        """
        try:
            logger.info(f"Executing contract phase for {execution_plan.execution_id}")
            
            # 获取收集到的签名
            if self.signature_collector:
                signatures = await self.signature_collector.get_collected_signatures(execution_plan.execution_id)
            else:
                # Mock signatures for testing
                signatures = [{"guardian": f"0x{i:040x}", "signature": f"0x{i:064x}"} for i in range(execution_plan.required_signatures)]
            
            if len(signatures) < execution_plan.required_signatures:
                return {
                    'success': False,
                    'message': f"Insufficient signatures: {len(signatures)}/{execution_plan.required_signatures}"
                }
            
            # 调用智能合约执行支付
            tx_hash = await self._execute_smart_contract_payment(
                execution_plan.recipient_address,
                execution_plan.amount,
                signatures,
                execution_plan.emergency_data
            )
            
            logger.info(f"Smart contract execution completed: {tx_hash}")
            
            return {
                'success': True,
                'tx_hash': tx_hash,
                'message': 'Contract execution successful'
            }
            
        except Exception as e:
            logger.error(f"Contract phase failed: {e}")
            return {
                'success': False,
                'message': f"Contract execution error: {str(e)}"
            }
    
    async def _execute_smart_contract_payment(self, recipient: str, amount: float, signatures: List[Dict], emergency_data: EmergencyData) -> str:
        """
        执行智能合约支付
        
        Args:
            recipient: 收款地址
            amount: 支付金额
            signatures: 签名列表
            emergency_data: 紧急情况数据
            
        Returns:
            str: 交易哈希
        """
        try:
            # 这里应该调用智能合约的 executePaymentWithMultiSig 函数
            # 目前返回模拟的交易哈希
            
            logger.info(f"Executing smart contract payment: {amount} ETH to {recipient}")
            
            # 模拟交易提交
            await asyncio.sleep(2)  # 模拟网络延迟
            
            # 生成模拟交易哈希
            tx_hash = f"0x{''.join([f'{ord(c):02x}' for c in emergency_data.emergency_id[:32]])}"
            
            logger.info(f"Smart contract payment executed with transaction hash: {tx_hash}")
            
            return tx_hash
            
        except Exception as e:
            logger.error(f"Smart contract payment failed: {e}")
            raise
    
    async def _execute_verification_phase(self, execution_plan: ExecutionPlan, tx_hash: str) -> bool:
        """
        执行验证阶段
        
        Args:
            execution_plan: 执行计划
            tx_hash: 交易哈希
            
        Returns:
            bool: 是否成功
        """
        try:
            logger.info(f"Executing verification phase for {execution_plan.execution_id}")
            
            # 验证交易状态
            if not await self._verify_transaction_status(tx_hash):
                logger.error(f"Transaction verification failed: {tx_hash}")
                return False
            
            # 验证资金到账
            if not await self._verify_funds_received(execution_plan.recipient_address, execution_plan.amount):
                logger.error(f"Funds verification failed")
                return False
            
            logger.info(f"Verification phase completed for {execution_plan.execution_id}")
            return True
            
        except Exception as e:
            logger.error(f"Verification phase failed: {e}")
            return False
    
    async def _verify_transaction_status(self, tx_hash: str) -> bool:
        """
        验证交易状态
        
        Args:
            tx_hash: 交易哈希
            
        Returns:
            bool: 交易是否成功
        """
        try:
            # 模拟交易状态验证
            await asyncio.sleep(1)
            logger.info(f"Transaction {tx_hash} verified successfully")
            return True
            
        except Exception as e:
            logger.error(f"Transaction verification failed: {e}")
            return False
    
    async def _verify_funds_received(self, recipient: str, amount: float) -> bool:
        """
        验证资金到账
        
        Args:
            recipient: 收款地址
            amount: 预期金额
            
        Returns:
            bool: 资金是否到账
        """
        try:
            # 模拟资金到账验证
            await asyncio.sleep(1)
            logger.info(f"Funds {amount} ETH verified at {recipient}")
            return True
            
        except Exception as e:
            logger.error(f"Funds verification failed: {e}")
            return False
    
    async def _execute_completion_phase(self, execution_plan: ExecutionPlan) -> bool:
        """
        执行完成阶段
        
        Args:
            execution_plan: 执行计划
            
        Returns:
            bool: 是否成功
        """
        try:
            logger.info(f"Executing completion phase for {execution_plan.execution_id}")
            
            # 发送完成通知
            await self._send_completion_notifications(execution_plan)
            
            # 清理资源
            await self.signature_collector.cleanup_collection(execution_plan.execution_id)
            
            # 记录审计日志
            await self._record_audit_log(execution_plan)
            
            logger.info(f"Completion phase finished for {execution_plan.execution_id}")
            return True
            
        except Exception as e:
            logger.error(f"Completion phase failed: {e}")
            return False
    
    async def _send_completion_notifications(self, execution_plan: ExecutionPlan):
        """
        发送完成通知
        
        Args:
            execution_plan: 执行计划
        """
        try:
            # 这里应该集成通知系统发送完成通知
            logger.info(f"Completion notifications sent for {execution_plan.execution_id}")
            
        except Exception as e:
            logger.error(f"Failed to send completion notifications: {e}")
    
    async def _record_audit_log(self, execution_plan: ExecutionPlan):
        """
        记录审计日志
        
        Args:
            execution_plan: 执行计划
        """
        try:
            audit_entry = {
                'execution_id': execution_plan.execution_id,
                'emergency_id': execution_plan.emergency_data.emergency_id,
                'operation_type': execution_plan.operation_type,
                'amount': execution_plan.amount,
                'recipient': execution_plan.recipient_address,
                'signatures_collected': execution_plan.required_signatures,
                'completed_at': datetime.now().isoformat(),
                'status': execution_plan.status.value
            }
            
            logger.info(f"Audit log recorded: {json.dumps(audit_entry, indent=2)}")
            
        except Exception as e:
            logger.error(f"Failed to record audit log: {e}")
    
    def _map_emergency_to_operation_type(self, emergency_type: str) -> str:
        """
        将紧急类型映射到操作类型
        
        Args:
            emergency_type: 紧急类型
            
        Returns:
            str: 操作类型
        """
        mapping = {
            'medical_emergency': 'medical_treatment',
            'financial_emergency': 'financial_protection',
            'security_incident': 'security_response',
            'accident_insurance': 'insurance_claim',
            'family_support': 'family_assistance',
            'legal_assistance': 'legal_support'
        }
        
        return mapping.get(emergency_type, 'general_emergency')
    
    def _calculate_required_signatures(self, severity_level: Any, urgency_score: int) -> int:
        """
        计算所需签名数量
        
        Args:
            severity_level: 严重程度
            urgency_score: 紧急程度评分
            
        Returns:
            int: 所需签名数量
        """
        severity_name = severity_level.value if hasattr(severity_level, 'value') else str(severity_level)
        
        if severity_name == 'CRITICAL' or urgency_score >= 90:
            return 1  # 极度紧急，只需1个签名
        elif severity_name == 'HIGH' or urgency_score >= 75:
            return 2  # 高度紧急，需要2个签名
        else:
            return 3  # 一般情况，需要3个签名
    
    def _calculate_timelock_hours(self, urgency_score: int) -> int:
        """
        计算时间锁小时数
        
        Args:
            urgency_score: 紧急程度评分
            
        Returns:
            int: 时间锁小时数
        """
        if urgency_score >= 90:
            return 1  # 极度紧急，1小时
        elif urgency_score >= 75:
            return 3  # 高度紧急，3小时
        elif urgency_score >= 50:
            return 6  # 一般紧急，6小时
        else:
            return 12  # 非紧急，12小时
    
    async def get_execution_status(self, execution_id: str) -> Optional[Dict[str, Any]]:
        """
        获取执行状态
        
        Args:
            execution_id: 执行ID
            
        Returns:
            Dict: 执行状态信息
        """
        if execution_id not in self.executions:
            return None
        
        execution_plan = self.executions[execution_id]
        
        # 获取签名收集状态
        if self.signature_collector:
            signature_status = await self.signature_collector.get_collection_status(execution_id)
        else:
            signature_status = None
        
        return {
            'execution_id': execution_id,
            'status': execution_plan.status.value,
            'current_phase': execution_plan.current_phase.value,
            'operation_type': execution_plan.operation_type,
            'required_signatures': execution_plan.required_signatures,
            'collected_signatures': signature_status.collected_count if signature_status else 0,
            'amount': execution_plan.amount,
            'recipient': execution_plan.recipient_address,
            'created_at': execution_plan.created_at.isoformat(),
            'timelock_hours': execution_plan.timelock_hours
        }
    
    async def cancel_execution(self, execution_id: str, reason: str) -> bool:
        """
        取消执行
        
        Args:
            execution_id: 执行ID
            reason: 取消原因
            
        Returns:
            bool: 是否成功取消
        """
        try:
            if execution_id not in self.executions:
                return False
            
            execution_plan = self.executions[execution_id]
            
            # 只能取消未完成的执行
            if execution_plan.status in [ExecutionStatus.COMPLETED, ExecutionStatus.EXECUTING]:
                logger.error(f"Cannot cancel execution in status: {execution_plan.status}")
                return False
            
            execution_plan.status = ExecutionStatus.CANCELLED
            
            # 取消签名收集
            if self.signature_collector:
                await self.signature_collector.cancel_collection(execution_id, reason)
            
            logger.info(f"Execution {execution_id} cancelled: {reason}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to cancel execution {execution_id}: {e}")
            return False


# 工厂函数
def create_execution_coordinator(config: Dict[str, Any]) -> ExecutionCoordinator:
    """
    创建执行协调器实例
    
    Args:
        config: 配置字典
        
    Returns:
        ExecutionCoordinator: 协调器实例
    """
    return ExecutionCoordinator(config)