"""
ZK Proof Validator - 零知识证明验证器

负责：
1. 验证身份证明的有效性
2. 验证紧急状态证明
3. 验证执行授权证明
4. 与智能合约 ZK 验证器交互
"""

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import hashlib

try:
    from web3 import Web3
    from eth_account import Account
    WEB3_AVAILABLE = True
except ImportError:
    WEB3_AVAILABLE = False

logger = logging.getLogger(__name__)


class ZKProofType:
    """ZK 证明类型常量"""
    IDENTITY = "identity"
    EMERGENCY = "emergency"
    AUTHORIZATION = "authorization"


class ZKProofValidator:
    """
    零知识证明验证器
    
    验证各种类型的 ZK 证明并与智能合约交互
    """
    
    def __init__(self, web3_provider: Optional[str] = None, contract_address: Optional[str] = None):
        """
        初始化 ZK 证明验证器
        
        Args:
            web3_provider: Web3 提供者 URL
            contract_address: ZK 验证合约地址
        """
        self.web3_provider = web3_provider
        self.contract_address = contract_address
        
        if web3_provider:
            self.w3 = Web3(Web3.HTTPProvider(web3_provider))
        else:
            self.w3 = None
        
        # 验证统计
        self.verification_stats = {
            'total_verifications': 0,
            'successful_verifications': 0,
            'failed_verifications': 0,
            'by_type': {
                ZKProofType.IDENTITY: {'success': 0, 'failed': 0},
                ZKProofType.EMERGENCY: {'success': 0, 'failed': 0},
                ZKProofType.AUTHORIZATION: {'success': 0, 'failed': 0}
            }
        }
        
        logger.info("ZK Proof Validator initialized")
    
    async def verify_identity_proof(self, proof_data: Dict[str, Any]) -> bool:
        """
        验证身份证明
        
        Args:
            proof_data: 身份证明数据
            
        Returns:
            bool: 验证结果
        """
        try:
            logger.info("Verifying identity proof")
            
            # 验证证明结构
            if not self._validate_proof_structure(proof_data, ZKProofType.IDENTITY):
                return False
            
            # 验证证明内容
            if not await self._verify_proof_content(proof_data, ZKProofType.IDENTITY):
                return False
            
            # 如果有智能合约，进行链上验证
            if self.w3 and self.contract_address:
                chain_result = await self._verify_on_chain(proof_data, ZKProofType.IDENTITY)
                if not chain_result:
                    return False
            
            self._update_stats(ZKProofType.IDENTITY, True)
            logger.info("Identity proof verification successful")
            return True
            
        except Exception as e:
            logger.error(f"Identity proof verification failed: {e}")
            self._update_stats(ZKProofType.IDENTITY, False)
            return False
    
    async def verify_emergency_proof(self, proof_data: Dict[str, Any]) -> bool:
        """
        验证紧急状态证明
        
        Args:
            proof_data: 紧急状态证明数据
            
        Returns:
            bool: 验证结果
        """
        try:
            logger.info("Verifying emergency proof")
            
            # 验证证明结构
            if not self._validate_proof_structure(proof_data, ZKProofType.EMERGENCY):
                return False
            
            # 验证紧急状态的时效性
            if not self._verify_emergency_timeliness(proof_data):
                return False
            
            # 验证证明内容
            if not await self._verify_proof_content(proof_data, ZKProofType.EMERGENCY):
                return False
            
            # 链上验证
            if self.w3 and self.contract_address:
                chain_result = await self._verify_on_chain(proof_data, ZKProofType.EMERGENCY)
                if not chain_result:
                    return False
            
            self._update_stats(ZKProofType.EMERGENCY, True)
            logger.info("Emergency proof verification successful")
            return True
            
        except Exception as e:
            logger.error(f"Emergency proof verification failed: {e}")
            self._update_stats(ZKProofType.EMERGENCY, False)
            return False
    
    async def verify_authorization_proof(self, proof_data: Dict[str, Any]) -> bool:
        """
        验证执行授权证明
        
        Args:
            proof_data: 执行授权证明数据
            
        Returns:
            bool: 验证结果
        """
        try:
            logger.info("Verifying authorization proof")
            
            # 验证证明结构
            if not self._validate_proof_structure(proof_data, ZKProofType.AUTHORIZATION):
                return False
            
            # 验证授权范围
            if not self._verify_authorization_scope(proof_data):
                return False
            
            # 验证证明内容
            if not await self._verify_proof_content(proof_data, ZKProofType.AUTHORIZATION):
                return False
            
            # 链上验证
            if self.w3 and self.contract_address:
                chain_result = await self._verify_on_chain(proof_data, ZKProofType.AUTHORIZATION)
                if not chain_result:
                    return False
            
            self._update_stats(ZKProofType.AUTHORIZATION, True)
            logger.info("Authorization proof verification successful")
            return True
            
        except Exception as e:
            logger.error(f"Authorization proof verification failed: {e}")
            self._update_stats(ZKProofType.AUTHORIZATION, False)
            return False
    
    def _validate_proof_structure(self, proof_data: Dict[str, Any], proof_type: str) -> bool:
        """
        验证证明数据结构
        
        Args:
            proof_data: 证明数据
            proof_type: 证明类型
            
        Returns:
            bool: 结构是否有效
        """
        try:
            # 通用字段检查
            required_fields = ['proof', 'public_inputs', 'proof_type', 'timestamp']
            
            for field in required_fields:
                if field not in proof_data:
                    logger.error(f"Missing required field: {field}")
                    return False
            
            # 验证证明类型
            if proof_data['proof_type'] != proof_type:
                logger.error(f"Proof type mismatch: expected {proof_type}, got {proof_data['proof_type']}")
                return False
            
            # 类型特定的字段检查
            if proof_type == ZKProofType.IDENTITY:
                identity_fields = ['guardian_commitment', 'nullifier_hash']
                for field in identity_fields:
                    if field not in proof_data.get('public_inputs', {}):
                        logger.error(f"Missing identity field: {field}")
                        return False
            
            elif proof_type == ZKProofType.EMERGENCY:
                emergency_fields = ['emergency_hash', 'severity_level', 'evidence_commitment']
                for field in emergency_fields:
                    if field not in proof_data.get('public_inputs', {}):
                        logger.error(f"Missing emergency field: {field}")
                        return False
            
            elif proof_type == ZKProofType.AUTHORIZATION:
                auth_fields = ['operation_hash', 'executor_commitment', 'permission_level']
                for field in auth_fields:
                    if field not in proof_data.get('public_inputs', {}):
                        logger.error(f"Missing authorization field: {field}")
                        return False
            
            return True
            
        except Exception as e:
            logger.error(f"Proof structure validation failed: {e}")
            return False
    
    async def _verify_proof_content(self, proof_data: Dict[str, Any], proof_type: str) -> bool:
        """
        验证证明内容的有效性
        
        Args:
            proof_data: 证明数据
            proof_type: 证明类型
            
        Returns:
            bool: 内容是否有效
        """
        try:
            # 验证时间戳
            timestamp = proof_data.get('timestamp')
            if not self._verify_timestamp(timestamp):
                return False
            
            # 验证证明格式
            proof = proof_data.get('proof', {})
            if not self._verify_groth16_proof_format(proof):
                return False
            
            # 验证公共输入
            public_inputs = proof_data.get('public_inputs', {})
            if not self._verify_public_inputs(public_inputs, proof_type):
                return False
            
            # 模拟证明验证（在实际实现中，这里会调用 snarkjs 或其他 ZK 库）
            verification_result = await self._simulate_proof_verification(proof_data)
            
            return verification_result
            
        except Exception as e:
            logger.error(f"Proof content verification failed: {e}")
            return False
    
    def _verify_timestamp(self, timestamp: Any) -> bool:
        """
        验证时间戳的有效性
        
        Args:
            timestamp: 时间戳
            
        Returns:
            bool: 时间戳是否有效
        """
        try:
            if isinstance(timestamp, str):
                proof_time = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            elif isinstance(timestamp, (int, float)):
                proof_time = datetime.fromtimestamp(timestamp)
            else:
                return False
            
            current_time = datetime.now()
            time_diff = (current_time - proof_time).total_seconds()
            
            # 证明不能太旧（24小时）或来自未来（5分钟容差）
            if time_diff > 24 * 3600 or time_diff < -300:
                logger.error(f"Invalid timestamp: {time_diff} seconds from now")
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Timestamp verification failed: {e}")
            return False
    
    def _verify_groth16_proof_format(self, proof: Dict[str, Any]) -> bool:
        """
        验证 Groth16 证明格式
        
        Args:
            proof: 证明数据
            
        Returns:
            bool: 格式是否正确
        """
        try:
            # 检查 Groth16 证明的必需字段
            required_fields = ['pi_a', 'pi_b', 'pi_c']
            
            for field in required_fields:
                if field not in proof:
                    logger.error(f"Missing Groth16 field: {field}")
                    return False
            
            # 验证字段格式
            pi_a = proof['pi_a']
            pi_b = proof['pi_b']
            pi_c = proof['pi_c']
            
            # pi_a 应该是长度为 3 的数组
            if not isinstance(pi_a, list) or len(pi_a) != 3:
                logger.error("Invalid pi_a format")
                return False
            
            # pi_b 应该是 3x2 的数组
            if not isinstance(pi_b, list) or len(pi_b) != 3:
                logger.error("Invalid pi_b format")
                return False
            
            for row in pi_b:
                if not isinstance(row, list) or len(row) != 2:
                    logger.error("Invalid pi_b row format")
                    return False
            
            # pi_c 应该是长度为 3 的数组
            if not isinstance(pi_c, list) or len(pi_c) != 3:
                logger.error("Invalid pi_c format")
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Groth16 proof format verification failed: {e}")
            return False
    
    def _verify_public_inputs(self, public_inputs: Dict[str, Any], proof_type: str) -> bool:
        """
        验证公共输入的有效性
        
        Args:
            public_inputs: 公共输入
            proof_type: 证明类型
            
        Returns:
            bool: 公共输入是否有效
        """
        try:
            if proof_type == ZKProofType.IDENTITY:
                return self._verify_identity_inputs(public_inputs)
            elif proof_type == ZKProofType.EMERGENCY:
                return self._verify_emergency_inputs(public_inputs)
            elif proof_type == ZKProofType.AUTHORIZATION:
                return self._verify_authorization_inputs(public_inputs)
            else:
                logger.error(f"Unknown proof type: {proof_type}")
                return False
                
        except Exception as e:
            logger.error(f"Public inputs verification failed: {e}")
            return False
    
    def _verify_identity_inputs(self, inputs: Dict[str, Any]) -> bool:
        """验证身份证明的公共输入"""
        guardian_commitment = inputs.get('guardian_commitment')
        nullifier_hash = inputs.get('nullifier_hash')
        
        # 验证承诺和 nullifier 的格式
        if not isinstance(guardian_commitment, str) or len(guardian_commitment) != 64:
            logger.error("Invalid guardian commitment format")
            return False
        
        if not isinstance(nullifier_hash, str) or len(nullifier_hash) != 64:
            logger.error("Invalid nullifier hash format")
            return False
        
        return True
    
    def _verify_emergency_inputs(self, inputs: Dict[str, Any]) -> bool:
        """验证紧急状态证明的公共输入"""
        emergency_hash = inputs.get('emergency_hash')
        severity_level = inputs.get('severity_level')
        evidence_commitment = inputs.get('evidence_commitment')
        
        # 验证紧急情况哈希
        if not isinstance(emergency_hash, str) or len(emergency_hash) != 64:
            logger.error("Invalid emergency hash format")
            return False
        
        # 验证严重程度级别
        if not isinstance(severity_level, int) or severity_level < 1 or severity_level > 3:
            logger.error("Invalid severity level")
            return False
        
        # 验证证据承诺
        if not isinstance(evidence_commitment, str) or len(evidence_commitment) != 64:
            logger.error("Invalid evidence commitment format")
            return False
        
        return True
    
    def _verify_authorization_inputs(self, inputs: Dict[str, Any]) -> bool:
        """验证授权证明的公共输入"""
        operation_hash = inputs.get('operation_hash')
        executor_commitment = inputs.get('executor_commitment')
        permission_level = inputs.get('permission_level')
        
        # 验证操作哈希
        if not isinstance(operation_hash, str) or len(operation_hash) != 64:
            logger.error("Invalid operation hash format")
            return False
        
        # 验证执行者承诺
        if not isinstance(executor_commitment, str) or len(executor_commitment) != 64:
            logger.error("Invalid executor commitment format")
            return False
        
        # 验证权限级别
        if not isinstance(permission_level, int) or permission_level < 1 or permission_level > 5:
            logger.error("Invalid permission level")
            return False
        
        return True
    
    def _verify_emergency_timeliness(self, proof_data: Dict[str, Any]) -> bool:
        """
        验证紧急状态的时效性
        
        Args:
            proof_data: 证明数据
            
        Returns:
            bool: 时效性是否有效
        """
        try:
            public_inputs = proof_data.get('public_inputs', {})
            severity_level = public_inputs.get('severity_level', 1)
            
            # 根据严重程度设置不同的时效要求
            max_age_hours = {
                1: 24,  # 低级紧急情况：24小时
                2: 12,  # 中级紧急情况：12小时
                3: 6    # 高级紧急情况：6小时
            }
            
            timestamp = proof_data.get('timestamp')
            if isinstance(timestamp, str):
                proof_time = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            else:
                proof_time = datetime.fromtimestamp(timestamp)
            
            current_time = datetime.now()
            age_hours = (current_time - proof_time).total_seconds() / 3600
            
            max_age = max_age_hours.get(severity_level, 24)
            
            if age_hours > max_age:
                logger.error(f"Emergency proof too old: {age_hours:.1f} hours (max: {max_age})")
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Emergency timeliness verification failed: {e}")
            return False
    
    def _verify_authorization_scope(self, proof_data: Dict[str, Any]) -> bool:
        """
        验证授权范围的合理性
        
        Args:
            proof_data: 证明数据
            
        Returns:
            bool: 授权范围是否合理
        """
        try:
            public_inputs = proof_data.get('public_inputs', {})
            permission_level = public_inputs.get('permission_level', 1)
            
            # 验证权限级别的合理性
            if permission_level > 3:
                logger.warning(f"High permission level requested: {permission_level}")
                # 高权限级别需要额外验证
                return self._verify_high_permission_authorization(proof_data)
            
            return True
            
        except Exception as e:
            logger.error(f"Authorization scope verification failed: {e}")
            return False
    
    def _verify_high_permission_authorization(self, proof_data: Dict[str, Any]) -> bool:
        """
        验证高权限级别的授权
        
        Args:
            proof_data: 证明数据
            
        Returns:
            bool: 高权限授权是否有效
        """
        # 高权限级别需要额外的验证逻辑
        # 例如：检查是否有足够的监护人签名、是否在紧急状态等
        logger.info("Performing high permission authorization verification")
        
        # 这里可以添加更严格的验证逻辑
        return True
    
    async def _simulate_proof_verification(self, proof_data: Dict[str, Any]) -> bool:
        """
        模拟证明验证（开发阶段使用）
        
        Args:
            proof_data: 证明数据
            
        Returns:
            bool: 模拟验证结果
        """
        try:
            # 模拟验证延迟
            await asyncio.sleep(0.1)
            
            # 基于证明数据的哈希进行模拟验证
            proof_str = json.dumps(proof_data, sort_keys=True)
            proof_hash = hashlib.sha256(proof_str.encode()).hexdigest()
            
            # 简单的模拟：如果哈希的最后一位不是 '0'，则验证通过
            # 在实际实现中，这里会调用真正的 ZK 验证库
            return proof_hash[-1] != '0'
            
        except Exception as e:
            logger.error(f"Simulated proof verification failed: {e}")
            return False
    
    async def _verify_on_chain(self, proof_data: Dict[str, Any], proof_type: str) -> bool:
        """
        在智能合约上验证证明
        
        Args:
            proof_data: 证明数据
            proof_type: 证明类型
            
        Returns:
            bool: 链上验证结果
        """
        try:
            if not self.w3 or not self.contract_address:
                logger.warning("No Web3 connection or contract address, skipping on-chain verification")
                return True
            
            # 这里应该调用智能合约的验证函数
            # 目前返回模拟结果
            logger.info(f"Performing on-chain verification for {proof_type}")
            
            # 模拟链上验证
            await asyncio.sleep(0.5)
            
            return True
            
        except Exception as e:
            logger.error(f"On-chain verification failed: {e}")
            return False
    
    def _update_stats(self, proof_type: str, success: bool):
        """
        更新验证统计
        
        Args:
            proof_type: 证明类型
            success: 是否成功
        """
        self.verification_stats['total_verifications'] += 1
        
        if success:
            self.verification_stats['successful_verifications'] += 1
            self.verification_stats['by_type'][proof_type]['success'] += 1
        else:
            self.verification_stats['failed_verifications'] += 1
            self.verification_stats['by_type'][proof_type]['failed'] += 1
    
    def get_verification_stats(self) -> Dict[str, Any]:
        """
        获取验证统计信息
        
        Returns:
            Dict: 验证统计
        """
        stats = self.verification_stats.copy()
        
        # 计算成功率
        total = stats['total_verifications']
        if total > 0:
            stats['success_rate'] = stats['successful_verifications'] / total
            
            for proof_type in stats['by_type']:
                type_stats = stats['by_type'][proof_type]
                type_total = type_stats['success'] + type_stats['failed']
                if type_total > 0:
                    type_stats['success_rate'] = type_stats['success'] / type_total
        
        return stats
    
    async def batch_verify_proofs(self, proofs: List[Tuple[Dict[str, Any], str]]) -> List[bool]:
        """
        批量验证证明
        
        Args:
            proofs: 证明列表，每个元素为 (proof_data, proof_type) 元组
            
        Returns:
            List[bool]: 验证结果列表
        """
        tasks = []
        
        for proof_data, proof_type in proofs:
            if proof_type == ZKProofType.IDENTITY:
                task = self.verify_identity_proof(proof_data)
            elif proof_type == ZKProofType.EMERGENCY:
                task = self.verify_emergency_proof(proof_data)
            elif proof_type == ZKProofType.AUTHORIZATION:
                task = self.verify_authorization_proof(proof_data)
            else:
                # 无效的证明类型
                tasks.append(asyncio.create_task(asyncio.coroutine(lambda: False)()))
                continue
            
            tasks.append(task)
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # 处理异常
        final_results = []
        for result in results:
            if isinstance(result, Exception):
                logger.error(f"Batch verification error: {result}")
                final_results.append(False)
            else:
                final_results.append(result)
        
        return final_results