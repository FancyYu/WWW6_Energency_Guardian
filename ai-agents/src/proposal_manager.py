"""
Proposal Manager - 紧急提案管理器

负责：
1. 生成和管理紧急提案
2. 跟踪提案状态和生命周期
3. 与智能合约交互提交提案
4. 处理提案的取消和更新
"""

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum

try:
    from web3 import Web3
    from eth_account import Account
    from eth_account.messages import encode_structured_data
    WEB3_AVAILABLE = True
except ImportError:
    WEB3_AVAILABLE = False

logger = logging.getLogger(__name__)


class ProposalStatus(Enum):
    """提案状态"""
    DRAFT = "draft"
    SUBMITTED = "submitted"
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXECUTED = "executed"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


class ProposalType(Enum):
    """提案类型"""
    EMERGENCY_PAYMENT = "emergency_payment"
    GUARDIAN_CHANGE = "guardian_change"
    CONFIGURATION_UPDATE = "configuration_update"


@dataclass
class ProposalMetadata:
    """提案元数据"""
    proposal_id: str
    proposal_type: ProposalType
    status: ProposalStatus
    created_at: datetime
    updated_at: datetime
    expires_at: Optional[datetime]
    creator_address: str
    target_contract: str
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        data = asdict(self)
        data['proposal_type'] = self.proposal_type.value
        data['status'] = self.status.value
        data['created_at'] = self.created_at.isoformat()
        data['updated_at'] = self.updated_at.isoformat()
        if self.expires_at:
            data['expires_at'] = self.expires_at.isoformat()
        return data


@dataclass
class EmergencyProposal:
    """紧急提案数据结构"""
    metadata: ProposalMetadata
    user_address: str
    emergency_type: str
    emergency_level: int
    requested_amount: float
    recipient_address: str
    timelock_hours: int
    evidence_hash: str
    ai_analysis: Dict[str, Any]
    confidence_score: float
    reasoning: str
    signatures: List[Dict[str, Any]]
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        data = asdict(self)
        data['metadata'] = self.metadata.to_dict()
        return data


class ProposalManager:
    """
    紧急提案管理器
    
    管理紧急提案的完整生命周期
    """
    
    def __init__(self, config: Dict[str, Any]):
        """
        初始化提案管理器
        
        Args:
            config: 配置字典
        """
        self.config = config
        
        if not WEB3_AVAILABLE:
            logger.warning("Web3 not available, running in mock mode")
            self.w3 = None
            self.account = type('MockAccount', (), {'address': '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87'})()
        else:
            self.w3 = Web3(Web3.HTTPProvider(config['web3_provider_url']))
            self.account = Account.from_key(config['ai_agent_private_key'])
        
        # 提案存储（在生产环境中应该使用数据库）
        self.proposals: Dict[str, EmergencyProposal] = {}
        self.proposal_history: List[Dict[str, Any]] = []
        
        # 合约配置
        self.emergency_contract_address = config.get('emergency_contract_address')
        self.emergency_contract_abi = config.get('emergency_contract_abi', [])
        
        # 提案配置
        self.default_timelock_hours = config.get('default_timelock_hours', 24)
        self.max_proposal_lifetime_hours = config.get('max_proposal_lifetime_hours', 168)  # 7天
        
        logger.info(f"Proposal Manager initialized for agent: {self.account.address}")
    
    async def create_emergency_proposal(self, proposal_data: Dict[str, Any]) -> str:
        """
        创建紧急提案
        
        Args:
            proposal_data: 提案数据
            
        Returns:
            str: 提案ID
        """
        try:
            # 生成提案ID
            proposal_id = self._generate_proposal_id(proposal_data)
            
            # 创建提案元数据
            metadata = ProposalMetadata(
                proposal_id=proposal_id,
                proposal_type=ProposalType.EMERGENCY_PAYMENT,
                status=ProposalStatus.DRAFT,
                created_at=datetime.now(),
                updated_at=datetime.now(),
                expires_at=datetime.now() + timedelta(hours=self.max_proposal_lifetime_hours),
                creator_address=self.account.address,
                target_contract=self.emergency_contract_address or "0x0"
            )
            
            # 创建紧急提案
            proposal = EmergencyProposal(
                metadata=metadata,
                user_address=proposal_data['user_address'],
                emergency_type=proposal_data['emergency_type'],
                emergency_level=proposal_data['emergency_level'],
                requested_amount=proposal_data['requested_amount'],
                recipient_address=proposal_data['recipient_address'],
                timelock_hours=proposal_data.get('timelock_hours', self.default_timelock_hours),
                evidence_hash=proposal_data['evidence_hash'],
                ai_analysis=proposal_data['ai_analysis'],
                confidence_score=proposal_data['confidence_score'],
                reasoning=proposal_data['reasoning'],
                signatures=[]
            )
            
            # 存储提案
            self.proposals[proposal_id] = proposal
            
            # 记录历史
            self._record_proposal_event(proposal_id, "created", {
                'creator': self.account.address,
                'emergency_type': proposal_data['emergency_type'],
                'requested_amount': proposal_data['requested_amount']
            })
            
            logger.info(f"Emergency proposal created: {proposal_id}")
            return proposal_id
            
        except Exception as e:
            logger.error(f"Failed to create emergency proposal: {e}")
            raise
    
    async def submit_proposal_to_contract(self, proposal_id: str) -> str:
        """
        提交提案到智能合约
        
        Args:
            proposal_id: 提案ID
            
        Returns:
            str: 交易哈希
        """
        try:
            proposal = self.proposals.get(proposal_id)
            if not proposal:
                raise ValueError(f"Proposal not found: {proposal_id}")
            
            if proposal.metadata.status != ProposalStatus.DRAFT:
                raise ValueError(f"Proposal not in draft status: {proposal.metadata.status}")
            
            # 准备合约调用数据
            contract_data = self._prepare_contract_data(proposal)
            
            # 调用智能合约（目前模拟）
            tx_hash = await self._call_emergency_contract(contract_data)
            
            # 更新提案状态
            proposal.metadata.status = ProposalStatus.SUBMITTED
            proposal.metadata.updated_at = datetime.now()
            
            # 记录历史
            self._record_proposal_event(proposal_id, "submitted", {
                'transaction_hash': tx_hash,
                'contract_address': self.emergency_contract_address
            })
            
            logger.info(f"Proposal {proposal_id} submitted to contract: {tx_hash}")
            return tx_hash
            
        except Exception as e:
            logger.error(f"Failed to submit proposal to contract: {e}")
            raise
    
    async def get_proposal_status(self, proposal_id: str) -> Dict[str, Any]:
        """
        获取提案状态
        
        Args:
            proposal_id: 提案ID
            
        Returns:
            Dict: 提案状态信息
        """
        try:
            proposal = self.proposals.get(proposal_id)
            if not proposal:
                return {
                    'found': False,
                    'error': 'Proposal not found'
                }
            
            # 检查提案是否过期
            if proposal.metadata.expires_at and datetime.now() > proposal.metadata.expires_at:
                if proposal.metadata.status not in [ProposalStatus.EXECUTED, ProposalStatus.CANCELLED]:
                    proposal.metadata.status = ProposalStatus.EXPIRED
                    proposal.metadata.updated_at = datetime.now()
            
            # 如果有智能合约，查询链上状态
            chain_status = None
            if self.emergency_contract_address:
                chain_status = await self._get_chain_proposal_status(proposal_id)
            
            return {
                'found': True,
                'proposal': proposal.to_dict(),
                'chain_status': chain_status,
                'history': self._get_proposal_history(proposal_id)
            }
            
        except Exception as e:
            logger.error(f"Failed to get proposal status: {e}")
            return {
                'found': False,
                'error': str(e)
            }
    
    async def cancel_proposal(self, proposal_id: str, reason: str) -> bool:
        """
        取消提案
        
        Args:
            proposal_id: 提案ID
            reason: 取消原因
            
        Returns:
            bool: 是否成功取消
        """
        try:
            proposal = self.proposals.get(proposal_id)
            if not proposal:
                logger.error(f"Proposal not found: {proposal_id}")
                return False
            
            # 检查是否可以取消
            if proposal.metadata.status in [ProposalStatus.EXECUTED, ProposalStatus.CANCELLED]:
                logger.error(f"Cannot cancel proposal in status: {proposal.metadata.status}")
                return False
            
            # 如果已提交到合约，需要调用合约取消
            if proposal.metadata.status == ProposalStatus.SUBMITTED:
                cancel_tx = await self._cancel_contract_proposal(proposal_id)
                logger.info(f"Contract proposal cancelled: {cancel_tx}")
            
            # 更新提案状态
            proposal.metadata.status = ProposalStatus.CANCELLED
            proposal.metadata.updated_at = datetime.now()
            
            # 记录历史
            self._record_proposal_event(proposal_id, "cancelled", {
                'reason': reason,
                'cancelled_by': self.account.address
            })
            
            logger.info(f"Proposal {proposal_id} cancelled: {reason}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to cancel proposal: {e}")
            return False
    
    async def add_guardian_signature(self, proposal_id: str, signature_data: Dict[str, Any]) -> bool:
        """
        添加监护人签名
        
        Args:
            proposal_id: 提案ID
            signature_data: 签名数据
            
        Returns:
            bool: 是否成功添加
        """
        try:
            proposal = self.proposals.get(proposal_id)
            if not proposal:
                logger.error(f"Proposal not found: {proposal_id}")
                return False
            
            # 验证签名
            if not self._verify_guardian_signature(proposal, signature_data):
                logger.error("Invalid guardian signature")
                return False
            
            # 检查是否已经签名
            guardian_address = signature_data['guardian_address']
            for existing_sig in proposal.signatures:
                if existing_sig['guardian_address'] == guardian_address:
                    logger.warning(f"Guardian {guardian_address} already signed")
                    return False
            
            # 添加签名
            signature_entry = {
                'guardian_address': guardian_address,
                'signature': signature_data['signature'],
                'timestamp': datetime.now().isoformat(),
                'message_hash': signature_data['message_hash']
            }
            
            proposal.signatures.append(signature_entry)
            proposal.metadata.updated_at = datetime.now()
            
            # 记录历史
            self._record_proposal_event(proposal_id, "signature_added", {
                'guardian_address': guardian_address,
                'signature_count': len(proposal.signatures)
            })
            
            logger.info(f"Guardian signature added to proposal {proposal_id}: {guardian_address}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to add guardian signature: {e}")
            return False
    
    def _generate_proposal_id(self, proposal_data: Dict[str, Any]) -> str:
        """
        生成提案ID
        
        Args:
            proposal_data: 提案数据
            
        Returns:
            str: 提案ID
        """
        timestamp = int(datetime.now().timestamp())
        user_addr = proposal_data['user_address'][-8:]  # 取地址后8位
        emergency_type = proposal_data['emergency_type'][:4]  # 取类型前4位
        
        return f"emergency_{emergency_type}_{user_addr}_{timestamp}"
    
    def _prepare_contract_data(self, proposal: EmergencyProposal) -> Dict[str, Any]:
        """
        准备智能合约调用数据
        
        Args:
            proposal: 紧急提案
            
        Returns:
            Dict: 合约调用数据
        """
        return {
            'function': 'proposeEmergency',
            'parameters': {
                'evidence': proposal.evidence_hash,
                'evidenceHash': Web3.keccak(text=proposal.evidence_hash).hex(),
                'emergencyLevel': proposal.emergency_level,
                'requestedAmount': int(proposal.requested_amount * 10**18),  # 转换为 wei
                'recipient': proposal.recipient_address,
                'aiAnalysis': json.dumps(proposal.ai_analysis),
                'confidenceScore': int(proposal.confidence_score * 100)
            }
        }
    
    async def _call_emergency_contract(self, contract_data: Dict[str, Any]) -> str:
        """
        调用紧急管理合约
        
        Args:
            contract_data: 合约调用数据
            
        Returns:
            str: 交易哈希
        """
        try:
            # 在实际实现中，这里会调用真正的智能合约
            # 目前返回模拟的交易哈希
            
            logger.info("Calling emergency management contract")
            
            # 模拟合约调用延迟
            await asyncio.sleep(1)
            
            # 生成模拟交易哈希
            import hashlib
            data_str = json.dumps(contract_data, sort_keys=True)
            tx_hash = "0x" + hashlib.sha256(data_str.encode()).hexdigest()[:64]
            
            logger.info(f"Contract call completed: {tx_hash}")
            return tx_hash
            
        except Exception as e:
            logger.error(f"Contract call failed: {e}")
            raise
    
    async def _get_chain_proposal_status(self, proposal_id: str) -> Optional[Dict[str, Any]]:
        """
        获取链上提案状态
        
        Args:
            proposal_id: 提案ID
            
        Returns:
            Optional[Dict]: 链上状态
        """
        try:
            # 在实际实现中，这里会查询智能合约状态
            # 目前返回模拟状态
            
            await asyncio.sleep(0.5)  # 模拟网络延迟
            
            return {
                'on_chain': True,
                'block_number': 12345678,
                'confirmation_count': 12,
                'gas_used': 150000,
                'status': 'pending'
            }
            
        except Exception as e:
            logger.error(f"Failed to get chain proposal status: {e}")
            return None
    
    async def _cancel_contract_proposal(self, proposal_id: str) -> str:
        """
        在合约中取消提案
        
        Args:
            proposal_id: 提案ID
            
        Returns:
            str: 取消交易哈希
        """
        try:
            # 在实际实现中，这里会调用合约的取消函数
            logger.info(f"Cancelling contract proposal: {proposal_id}")
            
            await asyncio.sleep(1)  # 模拟网络延迟
            
            # 生成模拟交易哈希
            import hashlib
            cancel_data = f"cancel_{proposal_id}_{int(datetime.now().timestamp())}"
            tx_hash = "0x" + hashlib.sha256(cancel_data.encode()).hexdigest()[:64]
            
            return tx_hash
            
        except Exception as e:
            logger.error(f"Failed to cancel contract proposal: {e}")
            raise
    
    def _verify_guardian_signature(self, proposal: EmergencyProposal, signature_data: Dict[str, Any]) -> bool:
        """
        验证监护人签名
        
        Args:
            proposal: 提案
            signature_data: 签名数据
            
        Returns:
            bool: 签名是否有效
        """
        try:
            # 构建签名消息
            message_data = {
                'proposal_id': proposal.metadata.proposal_id,
                'user_address': proposal.user_address,
                'requested_amount': proposal.requested_amount,
                'recipient_address': proposal.recipient_address,
                'emergency_type': proposal.emergency_type
            }
            
            # 创建 EIP-712 结构化数据
            structured_data = {
                'types': {
                    'EIP712Domain': [
                        {'name': 'name', 'type': 'string'},
                        {'name': 'version', 'type': 'string'},
                        {'name': 'chainId', 'type': 'uint256'},
                    ],
                    'GuardianApproval': [
                        {'name': 'proposalId', 'type': 'string'},
                        {'name': 'userAddress', 'type': 'address'},
                        {'name': 'amount', 'type': 'uint256'},
                        {'name': 'recipient', 'type': 'address'},
                        {'name': 'emergencyType', 'type': 'string'},
                    ]
                },
                'primaryType': 'GuardianApproval',
                'domain': {
                    'name': 'EmergencyGuardian',
                    'version': '1',
                    'chainId': 1,  # 主网
                },
                'message': {
                    'proposalId': message_data['proposal_id'],
                    'userAddress': message_data['user_address'],
                    'amount': int(message_data['requested_amount'] * 10**18),
                    'recipient': message_data['recipient_address'],
                    'emergencyType': message_data['emergency_type'],
                }
            }
            
            # 编码消息
            encoded_message = encode_structured_data(structured_data)
            
            # 验证签名
            recovered_address = Account.recover_message(
                encoded_message,
                signature=signature_data['signature']
            )
            
            expected_address = signature_data['guardian_address']
            
            if recovered_address.lower() != expected_address.lower():
                logger.error(f"Signature verification failed: {recovered_address} != {expected_address}")
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Signature verification error: {e}")
            return False
    
    def _record_proposal_event(self, proposal_id: str, event_type: str, event_data: Dict[str, Any]):
        """
        记录提案事件
        
        Args:
            proposal_id: 提案ID
            event_type: 事件类型
            event_data: 事件数据
        """
        event = {
            'proposal_id': proposal_id,
            'event_type': event_type,
            'event_data': event_data,
            'timestamp': datetime.now().isoformat(),
            'agent_address': self.account.address
        }
        
        self.proposal_history.append(event)
        
        # 保持历史记录在合理大小内
        if len(self.proposal_history) > 1000:
            self.proposal_history = self.proposal_history[-800:]
    
    def _get_proposal_history(self, proposal_id: str) -> List[Dict[str, Any]]:
        """
        获取提案历史
        
        Args:
            proposal_id: 提案ID
            
        Returns:
            List[Dict]: 提案历史事件
        """
        return [
            event for event in self.proposal_history
            if event['proposal_id'] == proposal_id
        ]
    
    def get_all_proposals(self, status_filter: Optional[ProposalStatus] = None) -> List[Dict[str, Any]]:
        """
        获取所有提案
        
        Args:
            status_filter: 状态过滤器
            
        Returns:
            List[Dict]: 提案列表
        """
        proposals = []
        
        for proposal in self.proposals.values():
            if status_filter is None or proposal.metadata.status == status_filter:
                proposals.append(proposal.to_dict())
        
        # 按创建时间排序
        proposals.sort(key=lambda x: x['metadata']['created_at'], reverse=True)
        
        return proposals
    
    def get_proposal_statistics(self) -> Dict[str, Any]:
        """
        获取提案统计信息
        
        Returns:
            Dict: 统计信息
        """
        stats = {
            'total_proposals': len(self.proposals),
            'by_status': {},
            'by_type': {},
            'by_emergency_level': {},
            'total_requested_amount': 0,
            'average_confidence_score': 0
        }
        
        confidence_scores = []
        
        for proposal in self.proposals.values():
            # 按状态统计
            status = proposal.metadata.status.value
            stats['by_status'][status] = stats['by_status'].get(status, 0) + 1
            
            # 按类型统计
            ptype = proposal.metadata.proposal_type.value
            stats['by_type'][ptype] = stats['by_type'].get(ptype, 0) + 1
            
            # 按紧急级别统计
            level = proposal.emergency_level
            stats['by_emergency_level'][level] = stats['by_emergency_level'].get(level, 0) + 1
            
            # 金额统计
            stats['total_requested_amount'] += proposal.requested_amount
            
            # 置信度统计
            confidence_scores.append(proposal.confidence_score)
        
        # 计算平均置信度
        if confidence_scores:
            stats['average_confidence_score'] = sum(confidence_scores) / len(confidence_scores)
        
        return stats
    
    async def cleanup_expired_proposals(self) -> int:
        """
        清理过期提案
        
        Returns:
            int: 清理的提案数量
        """
        cleaned_count = 0
        current_time = datetime.now()
        
        for proposal_id, proposal in list(self.proposals.items()):
            if (proposal.metadata.expires_at and 
                current_time > proposal.metadata.expires_at and
                proposal.metadata.status not in [ProposalStatus.EXECUTED, ProposalStatus.CANCELLED]):
                
                # 标记为过期
                proposal.metadata.status = ProposalStatus.EXPIRED
                proposal.metadata.updated_at = current_time
                
                # 记录事件
                self._record_proposal_event(proposal_id, "expired", {
                    'expired_at': current_time.isoformat()
                })
                
                cleaned_count += 1
        
        if cleaned_count > 0:
            logger.info(f"Cleaned up {cleaned_count} expired proposals")
        
        return cleaned_count