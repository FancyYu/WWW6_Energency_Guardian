"""
Signature Collector - 签名收集器

负责收集和验证监护人签名，支持多种签名方式和阈值验证。
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
    from eth_account.messages import encode_defunct
    WEB3_AVAILABLE = True
except ImportError:
    WEB3_AVAILABLE = False

logger = logging.getLogger(__name__)


class SignatureStatus(Enum):
    """签名收集状态"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    EXPIRED = "expired"
    CANCELLED = "cancelled"


class SignatureType(Enum):
    """签名类型"""
    ETHEREUM = "ethereum"
    EIP712 = "eip712"
    MULTISIG = "multisig"
    THRESHOLD = "threshold"


@dataclass
class GuardianSignature:
    """监护人签名"""
    guardian_address: str
    signature: str
    signature_type: SignatureType
    timestamp: datetime
    message_hash: str
    verified: bool = False
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典格式"""
        data = asdict(self)
        data['signature_type'] = self.signature_type.value
        data['timestamp'] = self.timestamp.isoformat()
        return data


@dataclass
class SignatureCollection:
    """签名收集"""
    collection_id: str
    execution_id: str
    required_signatures: int
    collected_signatures: List[GuardianSignature]
    status: SignatureStatus
    created_at: datetime
    expires_at: datetime
    message_to_sign: str
    message_hash: str
    
    @property
    def collected_count(self) -> int:
        """已收集的有效签名数量"""
        return len([sig for sig in self.collected_signatures if sig.verified])
    
    @property
    def is_complete(self) -> bool:
        """是否收集完成"""
        return self.collected_count >= self.required_signatures
    
    @property
    def is_expired(self) -> bool:
        """是否已过期"""
        return datetime.now() > self.expires_at
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典格式"""
        data = asdict(self)
        data['status'] = self.status.value
        data['created_at'] = self.created_at.isoformat()
        data['expires_at'] = self.expires_at.isoformat()
        data['collected_signatures'] = [sig.to_dict() for sig in self.collected_signatures]
        return data


class SignatureCollector:
    """
    签名收集器 - 监护人签名收集和验证系统
    
    负责：
    1. 初始化签名收集流程
    2. 收集和验证监护人签名
    3. 管理签名阈值和超时
    4. 提供签名状态查询接口
    """
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.collections: Dict[str, SignatureCollection] = {}
        
        # Web3 连接
        if WEB3_AVAILABLE:
            self.w3 = Web3(Web3.HTTPProvider(config.get('web3_provider_url', 'http://localhost:8545')))
        else:
            self.w3 = None
            logger.warning("Web3 not available, running in mock mode")
        
        # 模拟监护人列表（实际应该从智能合约获取）
        self.mock_guardians = [
            "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
            "0x8ba1f109551bD432803012645Hac136c22C177e9",
            "0x1234567890123456789012345678901234567890",
            "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
            "0x9876543210987654321098765432109876543210"
        ]
        
        logger.info("Signature Collector initialized")
    
    async def initialize_collection(self, execution_id: str, required_signatures: int, timelock_hours: int) -> bool:
        """
        初始化签名收集
        
        Args:
            execution_id: 执行ID
            required_signatures: 所需签名数量
            timelock_hours: 时间锁小时数
            
        Returns:
            bool: 是否成功初始化
        """
        try:
            collection_id = f"sig_{execution_id}_{int(datetime.now().timestamp())}"
            
            # 创建签名消息
            message_to_sign = self._create_signature_message(execution_id)
            message_hash = self._hash_message(message_to_sign)
            
            # 创建签名收集
            collection = SignatureCollection(
                collection_id=collection_id,
                execution_id=execution_id,
                required_signatures=required_signatures,
                collected_signatures=[],
                status=SignatureStatus.PENDING,
                created_at=datetime.now(),
                expires_at=datetime.now() + timedelta(hours=timelock_hours),
                message_to_sign=message_to_sign,
                message_hash=message_hash
            )
            
            self.collections[execution_id] = collection
            
            logger.info(f"Signature collection initialized: {collection_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize signature collection: {e}")
            return False
    
    async def start_collection(self, execution_id: str, emergency_data, analysis) -> bool:
        """
        开始签名收集
        
        Args:
            execution_id: 执行ID
            emergency_data: 紧急情况数据
            analysis: AI分析结果
            
        Returns:
            bool: 是否成功开始
        """
        try:
            if execution_id not in self.collections:
                logger.error(f"Collection not found for execution: {execution_id}")
                return False
            
            collection = self.collections[execution_id]
            collection.status = SignatureStatus.IN_PROGRESS
            
            # 发送签名请求给监护人
            await self._send_signature_requests(collection, emergency_data, analysis)
            
            # 开始监控签名收集
            asyncio.create_task(self._monitor_collection(execution_id))
            
            logger.info(f"Signature collection started: {execution_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to start signature collection: {e}")
            return False
    
    async def _send_signature_requests(self, collection: SignatureCollection, emergency_data, analysis):
        """
        发送签名请求给监护人
        
        Args:
            collection: 签名收集
            emergency_data: 紧急情况数据
            analysis: AI分析结果
        """
        try:
            # 获取监护人列表（模拟）
            guardians = self.mock_guardians[:collection.required_signatures + 2]  # 多发几个确保有足够签名
            
            for guardian_address in guardians:
                # 发送签名请求（模拟）
                await self._send_signature_request_to_guardian(
                    guardian_address,
                    collection,
                    emergency_data,
                    analysis
                )
            
            logger.info(f"Signature requests sent to {len(guardians)} guardians")
            
        except Exception as e:
            logger.error(f"Failed to send signature requests: {e}")
    
    async def _send_signature_request_to_guardian(self, guardian_address: str, collection: SignatureCollection, emergency_data, analysis):
        """
        向单个监护人发送签名请求
        
        Args:
            guardian_address: 监护人地址
            collection: 签名收集
            emergency_data: 紧急情况数据
            analysis: AI分析结果
        """
        try:
            # 构建签名请求消息
            request_data = {
                "collection_id": collection.collection_id,
                "execution_id": collection.execution_id,
                "guardian_address": guardian_address,
                "message_to_sign": collection.message_to_sign,
                "message_hash": collection.message_hash,
                "emergency_type": emergency_data.emergency_type.value,
                "requested_amount": emergency_data.requested_amount,
                "institution": emergency_data.institution_name,
                "urgency_score": analysis.urgency_score,
                "expires_at": collection.expires_at.isoformat()
            }
            
            # 这里应该通过通知系统发送给监护人
            # 目前模拟自动签名
            await asyncio.sleep(1)  # 模拟网络延迟
            
            # 模拟监护人签名
            await self._simulate_guardian_signature(guardian_address, collection)
            
        except Exception as e:
            logger.error(f"Failed to send signature request to {guardian_address}: {e}")
    
    async def _simulate_guardian_signature(self, guardian_address: str, collection: SignatureCollection):
        """
        模拟监护人签名（开发测试用）
        
        Args:
            guardian_address: 监护人地址
            collection: 签名收集
        """
        try:
            # 模拟签名延迟
            await asyncio.sleep(2 + len(collection.collected_signatures) * 0.5)
            
            # 生成模拟签名
            mock_signature = f"0x{''.join([f'{ord(c):02x}' for c in guardian_address[:32]])}"
            
            # 创建签名对象
            signature = GuardianSignature(
                guardian_address=guardian_address,
                signature=mock_signature,
                signature_type=SignatureType.ETHEREUM,
                timestamp=datetime.now(),
                message_hash=collection.message_hash,
                verified=True  # 模拟验证通过
            )
            
            # 添加到收集中
            collection.collected_signatures.append(signature)
            
            logger.info(f"Mock signature collected from {guardian_address}")
            
            # 检查是否收集完成
            if collection.is_complete:
                collection.status = SignatureStatus.COMPLETED
                logger.info(f"Signature collection completed: {collection.collection_id}")
            
        except Exception as e:
            logger.error(f"Failed to simulate signature from {guardian_address}: {e}")
    
    async def _monitor_collection(self, execution_id: str):
        """
        监控签名收集进度
        
        Args:
            execution_id: 执行ID
        """
        try:
            collection = self.collections[execution_id]
            
            while collection.status == SignatureStatus.IN_PROGRESS:
                # 检查是否过期
                if collection.is_expired:
                    collection.status = SignatureStatus.EXPIRED
                    logger.warning(f"Signature collection expired: {execution_id}")
                    break
                
                # 检查是否完成
                if collection.is_complete:
                    collection.status = SignatureStatus.COMPLETED
                    logger.info(f"Signature collection completed: {execution_id}")
                    break
                
                # 等待一段时间再检查
                await asyncio.sleep(5)
            
        except Exception as e:
            logger.error(f"Error monitoring signature collection: {e}")
    
    async def add_signature(self, execution_id: str, guardian_address: str, signature: str, signature_type: SignatureType = SignatureType.ETHEREUM) -> bool:
        """
        添加监护人签名
        
        Args:
            execution_id: 执行ID
            guardian_address: 监护人地址
            signature: 签名数据
            signature_type: 签名类型
            
        Returns:
            bool: 是否成功添加
        """
        try:
            if execution_id not in self.collections:
                logger.error(f"Collection not found for execution: {execution_id}")
                return False
            
            collection = self.collections[execution_id]
            
            # 检查是否已过期
            if collection.is_expired:
                logger.error(f"Collection expired: {execution_id}")
                return False
            
            # 检查是否已有该监护人的签名
            for existing_sig in collection.collected_signatures:
                if existing_sig.guardian_address == guardian_address:
                    logger.warning(f"Signature already exists for guardian: {guardian_address}")
                    return False
            
            # 验证签名
            is_valid = await self._verify_signature(guardian_address, signature, collection.message_hash, signature_type)
            
            if not is_valid:
                logger.error(f"Invalid signature from guardian: {guardian_address}")
                return False
            
            # 创建签名对象
            guardian_signature = GuardianSignature(
                guardian_address=guardian_address,
                signature=signature,
                signature_type=signature_type,
                timestamp=datetime.now(),
                message_hash=collection.message_hash,
                verified=True
            )
            
            # 添加到收集中
            collection.collected_signatures.append(guardian_signature)
            
            # 检查是否收集完成
            if collection.is_complete:
                collection.status = SignatureStatus.COMPLETED
            
            logger.info(f"Signature added from guardian: {guardian_address}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to add signature: {e}")
            return False
    
    async def _verify_signature(self, guardian_address: str, signature: str, message_hash: str, signature_type: SignatureType) -> bool:
        """
        验证监护人签名
        
        Args:
            guardian_address: 监护人地址
            signature: 签名数据
            message_hash: 消息哈希
            signature_type: 签名类型
            
        Returns:
            bool: 签名是否有效
        """
        try:
            if not WEB3_AVAILABLE:
                # Mock模式下总是返回True
                return True
            
            if signature_type == SignatureType.ETHEREUM:
                # 验证以太坊签名
                message = encode_defunct(text=message_hash)
                recovered_address = self.w3.eth.account.recover_message(message, signature=signature)
                return recovered_address.lower() == guardian_address.lower()
            
            elif signature_type == SignatureType.EIP712:
                # 验证EIP-712签名
                # 这里需要实现EIP-712签名验证逻辑
                return True  # 暂时返回True
            
            else:
                logger.error(f"Unsupported signature type: {signature_type}")
                return False
            
        except Exception as e:
            logger.error(f"Signature verification failed: {e}")
            return False
    
    async def get_collection_status(self, execution_id: str) -> Optional[SignatureCollection]:
        """
        获取签名收集状态
        
        Args:
            execution_id: 执行ID
            
        Returns:
            SignatureCollection: 签名收集状态
        """
        return self.collections.get(execution_id)
    
    async def get_collected_signatures(self, execution_id: str) -> List[Dict[str, Any]]:
        """
        获取已收集的签名
        
        Args:
            execution_id: 执行ID
            
        Returns:
            List[Dict]: 签名列表
        """
        if execution_id not in self.collections:
            return []
        
        collection = self.collections[execution_id]
        return [sig.to_dict() for sig in collection.collected_signatures if sig.verified]
    
    async def cancel_collection(self, execution_id: str, reason: str) -> bool:
        """
        取消签名收集
        
        Args:
            execution_id: 执行ID
            reason: 取消原因
            
        Returns:
            bool: 是否成功取消
        """
        try:
            if execution_id not in self.collections:
                return False
            
            collection = self.collections[execution_id]
            collection.status = SignatureStatus.CANCELLED
            
            logger.info(f"Signature collection cancelled: {execution_id}, reason: {reason}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to cancel signature collection: {e}")
            return False
    
    async def cleanup_collection(self, execution_id: str):
        """
        清理签名收集资源
        
        Args:
            execution_id: 执行ID
        """
        try:
            if execution_id in self.collections:
                del self.collections[execution_id]
                logger.info(f"Signature collection cleaned up: {execution_id}")
        except Exception as e:
            logger.error(f"Failed to cleanup signature collection: {e}")
    
    def _create_signature_message(self, execution_id: str) -> str:
        """
        创建签名消息
        
        Args:
            execution_id: 执行ID
            
        Returns:
            str: 签名消息
        """
        return f"Emergency Guardian Execution Authorization: {execution_id}"
    
    def _hash_message(self, message: str) -> str:
        """
        计算消息哈希
        
        Args:
            message: 消息内容
            
        Returns:
            str: 消息哈希
        """
        if WEB3_AVAILABLE:
            return Web3.keccak(text=message).hex()
        else:
            # Mock模式下返回简单哈希
            return f"0x{''.join([f'{ord(c):02x}' for c in message[:32]])}"
    
    def get_collection_summary(self) -> Dict[str, Any]:
        """
        获取收集器状态摘要
        
        Returns:
            Dict: 状态摘要
        """
        return {
            "total_collections": len(self.collections),
            "active_collections": len([c for c in self.collections.values() if c.status == SignatureStatus.IN_PROGRESS]),
            "completed_collections": len([c for c in self.collections.values() if c.status == SignatureStatus.COMPLETED]),
            "failed_collections": len([c for c in self.collections.values() if c.status in [SignatureStatus.FAILED, SignatureStatus.EXPIRED]]),
            "collections": {eid: c.to_dict() for eid, c in self.collections.items()}
        }


# 工厂函数
def create_signature_collector(config: Dict[str, Any]) -> SignatureCollector:
    """
    创建签名收集器实例
    
    Args:
        config: 配置字典
        
    Returns:
        SignatureCollector: 收集器实例
    """
    return SignatureCollector(config)