"""
Emergency Coordinator - 紧急协调引擎

负责协调用户失能情况下的紧急响应流程，作为监护人、智能合约和第三方机构间的协调者。
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum

try:
    import google.generativeai as genai
    from web3 import Web3
    from eth_account import Account
    from cryptography.hazmat.primitives import hashes
    from cryptography.hazmat.primitives.asymmetric import rsa, padding
    EXTERNAL_DEPS_AVAILABLE = True
except ImportError:
    EXTERNAL_DEPS_AVAILABLE = False
    # Mock classes for testing
    class Web3:
        @staticmethod
        def HTTPProvider(url): return None
    class Account:
        @staticmethod
        def from_key(key): 
            class MockAccount:
                address = "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87"
            return MockAccount()

try:
    from .gemini_analyzer import GeminiAnalyzer
    from .zkp_validator import ZKProofValidator
    from .proposal_manager import ProposalManager
    from .mock_notification_coordinator import MockNotificationCoordinator
except ImportError:
    # Will be handled in the class initialization
    pass

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class MockZKProofValidator:
    """Mock ZK Proof Validator for testing and development"""
    
    def __init__(self):
        self.verification_stats = {
            'total_verifications': 0,
            'successful_verifications': 0,
            'failed_verifications': 0,
            'by_type': {
                'identity': {'success': 0, 'failed': 0},
                'emergency': {'success': 0, 'failed': 0},
                'authorization': {'success': 0, 'failed': 0}
            }
        }
    
    async def verify_identity_proof(self, proof_data: Dict[str, Any]) -> bool:
        """Mock identity proof verification - always returns True for testing"""
        logger.info("Mock: Verifying identity proof")
        await asyncio.sleep(0.1)  # Simulate verification delay
        self.verification_stats['total_verifications'] += 1
        self.verification_stats['successful_verifications'] += 1
        self.verification_stats['by_type']['identity']['success'] += 1
        return True
    
    async def verify_emergency_proof(self, proof_data: Dict[str, Any]) -> bool:
        """Mock emergency proof verification - always returns True for testing"""
        logger.info("Mock: Verifying emergency proof")
        await asyncio.sleep(0.1)  # Simulate verification delay
        self.verification_stats['total_verifications'] += 1
        self.verification_stats['successful_verifications'] += 1
        self.verification_stats['by_type']['emergency']['success'] += 1
        return True
    
    async def verify_authorization_proof(self, proof_data: Dict[str, Any]) -> bool:
        """Mock authorization proof verification - always returns True for testing"""
        logger.info("Mock: Verifying authorization proof")
        await asyncio.sleep(0.1)  # Simulate verification delay
        self.verification_stats['total_verifications'] += 1
        self.verification_stats['successful_verifications'] += 1
        self.verification_stats['by_type']['authorization']['success'] += 1
        return True
    
    def get_verification_stats(self) -> Dict[str, Any]:
        """Get verification statistics"""
        stats = self.verification_stats.copy()
        # Calculate success rate
        if stats['total_verifications'] > 0:
            stats['success_rate'] = stats['successful_verifications'] / stats['total_verifications']
        else:
            stats['success_rate'] = 0.0
        return stats


class MockGeminiAnalyzer:
    """Mock Gemini Analyzer for testing and development"""
    
    async def analyze_emergency(self, prompt: str, documents: List[Dict[str, Any]]) -> str:
        """Mock Gemini analysis - returns simulated response"""
        logger.info("Mock: Analyzing emergency with Gemini")
        await asyncio.sleep(0.2)  # Simulate API delay
        
        # Return a mock JSON response
        mock_response = {
            "severity": "HIGH",
            "urgency": 85,
            "amount_reasonable": True,
            "recommended_amount": 45.5,
            "confidence": 0.92,
            "institution_credibility": 0.88,
            "risks": ["时间紧急", "需要立即处理"],
            "explanation": "基于提供的医疗文档和症状描述，这是一个高风险的紧急医疗情况，建议立即处理。患者症状表明可能存在心脏相关问题，需要紧急医疗干预。"
        }
        
        return f"```json\n{json.dumps(mock_response, ensure_ascii=False, indent=2)}\n```"


class MockProposalManager:
    """Mock Proposal Manager for testing and development"""
    
    def __init__(self, config: Dict[str, Any]):
        self.proposals = {}
        self.statistics = {
            'total_proposals': 0,
            'pending_proposals': 0,
            'approved_proposals': 0,
            'rejected_proposals': 0,
            'cancelled_proposals': 0
        }
    
    async def get_proposal_status(self, proposal_id: str) -> Dict[str, Any]:
        """Mock proposal status retrieval"""
        logger.info(f"Mock: Getting proposal status for {proposal_id}")
        return {
            'found': True,
            'proposal': {
                'id': proposal_id,
                'metadata': {
                    'status': 'pending',
                    'created_at': datetime.now().isoformat(),
                    'updated_at': datetime.now().isoformat(),
                    'signatures_count': 0,
                    'required_signatures': 2
                }
            }
        }
    
    async def cancel_proposal(self, proposal_id: str, reason: str) -> bool:
        """Mock proposal cancellation"""
        logger.info(f"Mock: Cancelling proposal {proposal_id} - {reason}")
        return True
    
    def get_proposal_statistics(self) -> Dict[str, Any]:
        """Get proposal statistics"""
        stats = self.statistics.copy()
        stats['total_requested_amount'] = 0.0
        stats['average_amount'] = 0.0
        stats['average_confidence_score'] = 0.85  # Mock average confidence score
        return stats


class EmergencyType(Enum):
    """紧急情况类型"""
    MEDICAL_EMERGENCY = "medical_emergency"
    FINANCIAL_EMERGENCY = "financial_emergency"
    SECURITY_INCIDENT = "security_incident"
    ACCIDENT_INSURANCE = "accident_insurance"
    FAMILY_SUPPORT = "family_support"
    LEGAL_ASSISTANCE = "legal_assistance"
    UNKNOWN = "unknown"


class SeverityLevel(Enum):
    """严重程度级别"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class EmergencyData:
    """紧急情况数据结构"""
    emergency_id: str
    user_address: str
    emergency_type: EmergencyType
    institution_name: str
    institution_address: str
    documents: List[Dict[str, Any]]
    requested_amount: float  # ETH
    zk_proof: Dict[str, Any]
    timestamp: datetime
    contact_info: Dict[str, str]
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典格式"""
        data = asdict(self)
        data['emergency_type'] = self.emergency_type.value
        data['timestamp'] = self.timestamp.isoformat()
        return data


@dataclass
class EmergencyAnalysis:
    """Gemini 分析结果"""
    severity_level: SeverityLevel
    urgency_score: int  # 0-100
    recommended_amount: float
    confidence_score: float  # 0-1
    risk_factors: List[str]
    reasoning: str
    institution_credibility: float  # 0-1
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典格式"""
        data = asdict(self)
        data['severity_level'] = self.severity_level.value
        return data


@dataclass
class EmergencyResponse:
    """紧急响应结果"""
    success: bool
    proposal_id: Optional[str]
    transaction_hash: Optional[str]
    message: str
    analysis: Optional[EmergencyAnalysis]
    
    @classmethod
    def success_response(cls, proposal_id: str, tx_hash: str, analysis: EmergencyAnalysis) -> 'EmergencyResponse':
        return cls(
            success=True,
            proposal_id=proposal_id,
            transaction_hash=tx_hash,
            message="Emergency proposal submitted successfully",
            analysis=analysis
        )
    
    @classmethod
    def error_response(cls, message: str) -> 'EmergencyResponse':
        return cls(
            success=False,
            proposal_id=None,
            transaction_hash=None,
            message=message,
            analysis=None
        )


class EmergencyCoordinator:
    """
    紧急协调引擎 - 核心协调器
    
    负责：
    1. 验证紧急情况 ZKP 证明
    2. 使用 Gemini 分析医疗数据严重性
    3. 生成和提交紧急提案到智能合约
    4. 协调各方响应
    """
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        
        if not EXTERNAL_DEPS_AVAILABLE:
            logger.warning("External dependencies not available, running in mock mode")
            self.gemini_analyzer = MockGeminiAnalyzer()
            # 创建Mock ZKP验证器
            self.zkp_validator = MockZKProofValidator()
            self.proposal_manager = MockProposalManager(config)
            # 导入Mock通知协调器
            try:
                from .mock_notification_coordinator import MockNotificationCoordinator
            except ImportError:
                from mock_notification_coordinator import MockNotificationCoordinator
            self.notification_coordinator = MockNotificationCoordinator()
            self.w3 = None
            self.account = Account.from_key(config['ai_agent_private_key'])
            return
            
        self.gemini_analyzer = GeminiAnalyzer(config.get('gemini_api_key'))
        self.zkp_validator = ZKProofValidator()
        self.proposal_manager = ProposalManager(config)
        
        # 初始化通知协调器 (优先使用Mock版本进行开发)
        if config.get('use_mock_notifications', True):
            try:
                from .mock_notification_coordinator import MockNotificationCoordinator
            except ImportError:
                from mock_notification_coordinator import MockNotificationCoordinator
            self.notification_coordinator = MockNotificationCoordinator(config.get('notification_config', {}))
        else:
            try:
                from .notification_coordinator import NotificationCoordinator
            except ImportError:
                from notification_coordinator import NotificationCoordinator
            self.notification_coordinator = NotificationCoordinator(config.get('notification_config', {}))
        
        # Web3 连接
        self.w3 = Web3(Web3.HTTPProvider(config['web3_provider_url']))
        self.account = Account.from_key(config['ai_agent_private_key'])
        
        logger.info(f"Emergency Coordinator initialized for agent: {self.account.address}")
    
    async def handle_emergency_request(self, emergency_data: EmergencyData) -> EmergencyResponse:
        """
        处理紧急情况请求的主流程
        
        Args:
            emergency_data: 紧急情况数据
            
        Returns:
            EmergencyResponse: 处理结果
        """
        try:
            logger.info(f"Processing emergency request {emergency_data.emergency_id}")
            
            # 1. 验证 ZKP 证明
            if not await self._verify_emergency_proof(emergency_data.zk_proof):
                return EmergencyResponse.error_response("Invalid ZK proof")
            
            # 2. 使用 Gemini 分析紧急情况
            analysis = await self._analyze_emergency_with_gemini(emergency_data)
            if analysis.confidence_score < 0.7:
                return EmergencyResponse.error_response(
                    f"Low confidence analysis: {analysis.confidence_score}"
                )
            
            # 3. 生成紧急提案
            proposal = await self._generate_emergency_proposal(emergency_data, analysis)
            
            # 4. 提交到智能合约
            tx_hash = await self._submit_proposal_to_contract(proposal)
            
            # 5. 发送紧急通知给所有监护人
            await self._notify_guardians_of_emergency(emergency_data, analysis)
            
            # 6. 记录成功处理
            logger.info(f"Emergency proposal {proposal['id']} submitted with tx: {tx_hash}")
            
            return EmergencyResponse.success_response(
                proposal_id=proposal['id'],
                tx_hash=tx_hash,
                analysis=analysis
            )
            
        except Exception as e:
            logger.error(f"Error processing emergency request: {str(e)}")
            return EmergencyResponse.error_response(f"Processing error: {str(e)}")
    
    async def _verify_emergency_proof(self, zk_proof: Dict[str, Any]) -> bool:
        """
        验证紧急情况的 ZKP 证明
        
        Args:
            zk_proof: ZK 证明数据
            
        Returns:
            bool: 验证结果
        """
        try:
            # 验证身份证明
            identity_valid = await self.zkp_validator.verify_identity_proof(
                zk_proof.get('identity_proof', {})
            )
            
            # 验证紧急状态证明
            emergency_valid = await self.zkp_validator.verify_emergency_proof(
                zk_proof.get('emergency_proof', {})
            )
            
            # 验证授权证明
            auth_valid = await self.zkp_validator.verify_authorization_proof(
                zk_proof.get('authorization_proof', {})
            )
            
            result = identity_valid and emergency_valid and auth_valid
            logger.info(f"ZK proof verification result: {result}")
            
            return result
            
        except Exception as e:
            logger.error(f"ZK proof verification failed: {e}")
            return False
    
    async def _analyze_emergency_with_gemini(self, emergency_data: EmergencyData) -> EmergencyAnalysis:
        """
        使用 Gemini 分析紧急情况
        
        Args:
            emergency_data: 紧急情况数据
            
        Returns:
            EmergencyAnalysis: 分析结果
        """
        try:
            # 构建分析提示
            prompt = self._build_analysis_prompt(emergency_data)
            
            # 调用 Gemini 分析 (支持Mock模式)
            if self.gemini_analyzer:
                gemini_response = await self.gemini_analyzer.analyze_emergency(
                    prompt=prompt,
                    documents=emergency_data.documents
                )
            else:
                # 如果没有Gemini分析器，返回默认分析
                logger.warning("No Gemini analyzer available, using default analysis")
                gemini_response = """```json
                {
                    "severity": "MEDIUM",
                    "urgency": 60,
                    "amount_reasonable": true,
                    "recommended_amount": 30.0,
                    "confidence": 0.7,
                    "institution_credibility": 0.75,
                    "risks": ["分析器不可用"],
                    "explanation": "使用默认分析，建议人工审核"
                }
                ```"""
            
            # 解析响应
            analysis = self._parse_gemini_response(gemini_response)
            
            logger.info(f"Gemini analysis completed with confidence: {analysis.confidence_score}")
            
            return analysis
            
        except Exception as e:
            logger.error(f"Gemini analysis failed: {e}")
            # 返回默认的低置信度分析
            return EmergencyAnalysis(
                severity_level=SeverityLevel.MEDIUM,
                urgency_score=50,
                recommended_amount=emergency_data.requested_amount,
                confidence_score=0.3,
                risk_factors=["Analysis failed"],
                reasoning="Gemini analysis unavailable",
                institution_credibility=0.5
            )
    
    def _build_analysis_prompt(self, emergency_data: EmergencyData) -> str:
        """
        构建 Gemini 分析提示
        
        Args:
            emergency_data: 紧急情况数据
            
        Returns:
            str: 分析提示
        """
        return f"""
        作为紧急情况分析专家，请分析以下紧急情况：
        
        **基本信息**:
        - 情况类型: {emergency_data.emergency_type.value}
        - 提交机构: {emergency_data.institution_name}
        - 机构地址: {emergency_data.institution_address}
        - 请求金额: {emergency_data.requested_amount} ETH
        - 提交时间: {emergency_data.timestamp.isoformat()}
        
        **相关文档**: {len(emergency_data.documents)} 个文档
        
        请从以下维度进行专业分析：
        
        1. **严重程度评估** (LOW/MEDIUM/HIGH/CRITICAL)
           - 基于医疗紧急性、生命威胁程度
           - 考虑时间敏感性
        
        2. **紧急程度评分** (0-100分)
           - 0-25: 非紧急，可延后处理
           - 26-50: 一般紧急，需要关注
           - 51-75: 高度紧急，需要快速响应
           - 76-100: 极度紧急，立即处理
        
        3. **金额合理性分析**
           - 评估请求金额是否合理
           - 提供建议金额
           - 考虑地区医疗费用标准
        
        4. **机构可信度评估** (0-1)
           - 机构资质和声誉
           - 文档真实性
           - 历史记录
        
        5. **风险因素识别**
           - 潜在的欺诈风险
           - 信息不完整风险
           - 其他需要注意的风险点
        
        请以JSON格式返回分析结果：
        {{
            "severity": "HIGH",
            "urgency": 85,
            "amount_reasonable": true,
            "recommended_amount": 45.5,
            "confidence": 0.92,
            "institution_credibility": 0.88,
            "risks": ["风险1", "风险2"],
            "explanation": "详细分析说明，包括判断依据和建议"
        }}
        
        注意：请基于医疗专业知识和常识进行分析，确保分析结果的准确性和可靠性。
        """
    
    def _parse_gemini_response(self, response: str) -> EmergencyAnalysis:
        """
        解析 Gemini 响应
        
        Args:
            response: Gemini 响应文本
            
        Returns:
            EmergencyAnalysis: 解析后的分析结果
        """
        try:
            # 尝试解析 JSON 响应
            if "```json" in response:
                json_start = response.find("```json") + 7
                json_end = response.find("```", json_start)
                json_str = response[json_start:json_end].strip()
            else:
                # 假设整个响应就是 JSON
                json_str = response.strip()
            
            data = json.loads(json_str)
            
            # 映射严重程度
            severity_map = {
                "LOW": SeverityLevel.LOW,
                "MEDIUM": SeverityLevel.MEDIUM,
                "HIGH": SeverityLevel.HIGH,
                "CRITICAL": SeverityLevel.CRITICAL
            }
            
            return EmergencyAnalysis(
                severity_level=severity_map.get(data.get('severity', 'MEDIUM'), SeverityLevel.MEDIUM),
                urgency_score=min(100, max(0, data.get('urgency', 50))),
                recommended_amount=max(0, data.get('recommended_amount', 0)),
                confidence_score=min(1.0, max(0.0, data.get('confidence', 0.5))),
                risk_factors=data.get('risks', []),
                reasoning=data.get('explanation', 'No explanation provided'),
                institution_credibility=min(1.0, max(0.0, data.get('institution_credibility', 0.5)))
            )
            
        except Exception as e:
            logger.error(f"Failed to parse Gemini response: {e}")
            logger.debug(f"Response content: {response}")
            
            # 返回默认分析
            return EmergencyAnalysis(
                severity_level=SeverityLevel.MEDIUM,
                urgency_score=50,
                recommended_amount=0,
                confidence_score=0.3,
                risk_factors=["Response parsing failed"],
                reasoning="Failed to parse Gemini analysis",
                institution_credibility=0.5
            )
    
    async def _generate_emergency_proposal(self, emergency_data: EmergencyData, analysis: EmergencyAnalysis) -> Dict[str, Any]:
        """
        生成紧急提案
        
        Args:
            emergency_data: 紧急情况数据
            analysis: Gemini 分析结果
            
        Returns:
            Dict: 提案数据
        """
        proposal_id = f"emergency_{emergency_data.emergency_id}_{int(datetime.now().timestamp())}"
        
        # 根据严重程度确定紧急级别
        emergency_level_map = {
            SeverityLevel.LOW: 1,
            SeverityLevel.MEDIUM: 1,
            SeverityLevel.HIGH: 2,
            SeverityLevel.CRITICAL: 3
        }
        
        emergency_level = emergency_level_map[analysis.severity_level]
        
        # 计算时间锁（基于紧急程度）
        if analysis.urgency_score >= 90:
            timelock_hours = 2  # 极度紧急
        elif analysis.urgency_score >= 75:
            timelock_hours = 6  # 高度紧急
        elif analysis.urgency_score >= 50:
            timelock_hours = 12  # 一般紧急
        else:
            timelock_hours = 24  # 非紧急
        
        proposal = {
            'id': proposal_id,
            'user_address': emergency_data.user_address,
            'emergency_type': emergency_data.emergency_type.value,
            'emergency_level': emergency_level,
            'requested_amount': analysis.recommended_amount,
            'recipient_address': emergency_data.institution_address,
            'timelock_hours': timelock_hours,
            'evidence_hash': self._calculate_evidence_hash(emergency_data),
            'ai_analysis': analysis.to_dict(),
            'confidence_score': analysis.confidence_score,
            'reasoning': analysis.reasoning,
            'timestamp': datetime.now().isoformat(),
            'ai_agent_address': self.account.address
        }
        
        return proposal
    
    def _calculate_evidence_hash(self, emergency_data: EmergencyData) -> str:
        """
        计算证据哈希
        
        Args:
            emergency_data: 紧急情况数据
            
        Returns:
            str: 证据哈希
        """
        # 创建证据摘要
        evidence_summary = {
            'emergency_id': emergency_data.emergency_id,
            'user_address': emergency_data.user_address,
            'institution_name': emergency_data.institution_name,
            'requested_amount': emergency_data.requested_amount,
            'document_count': len(emergency_data.documents),
            'timestamp': emergency_data.timestamp.isoformat()
        }
        
        # 计算哈希
        evidence_str = json.dumps(evidence_summary, sort_keys=True)
        
        try:
            # 尝试使用cryptography库
            digest = hashes.Hash(hashes.SHA256())
            digest.update(evidence_str.encode('utf-8'))
            return digest.finalize().hex()
        except (NameError, ImportError):
            # 如果cryptography不可用，使用hashlib
            import hashlib
            return hashlib.sha256(evidence_str.encode('utf-8')).hexdigest()
    
    async def _submit_proposal_to_contract(self, proposal: Dict[str, Any]) -> str:
        """
        提交提案到智能合约
        
        Args:
            proposal: 提案数据
            
        Returns:
            str: 交易哈希
        """
        try:
            # 这里应该调用智能合约的 proposeEmergencyByAI 函数
            # 目前返回模拟的交易哈希
            
            logger.info(f"Submitting proposal {proposal['id']} to smart contract")
            
            # 模拟交易提交
            await asyncio.sleep(1)  # 模拟网络延迟
            
            # 生成模拟交易哈希
            tx_hash = f"0x{''.join([f'{ord(c):02x}' for c in proposal['id'][:32]])}"
            
            logger.info(f"Proposal submitted with transaction hash: {tx_hash}")
            
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
        return await self.proposal_manager.get_proposal_status(proposal_id)
    
    async def cancel_proposal(self, proposal_id: str, reason: str) -> bool:
        """
        取消提案
        
        Args:
            proposal_id: 提案ID
            reason: 取消原因
            
        Returns:
            bool: 取消是否成功
        """
        return await self.proposal_manager.cancel_proposal(proposal_id, reason)
    
    async def _notify_guardians_of_emergency(self, emergency_data: EmergencyData, analysis: EmergencyAnalysis):
        """
        通知监护人紧急情况
        
        Args:
            emergency_data: 紧急情况数据
            analysis: AI分析结果
        """
        try:
            logger.info(f"Notifying guardians of emergency {emergency_data.emergency_id}")
            
            # 准备通知数据
            # 从documents中提取描述信息
            description = ""
            symptoms = ""
            for doc in emergency_data.documents:
                if 'description' in doc:
                    if '症状' in doc['description'] or '疑似' in doc['description']:
                        symptoms = doc['description']
                    description += doc['description'] + " "
            
            notification_data = {
                'emergency_id': emergency_data.emergency_id,
                'severity_level': analysis.severity_level.value,
                'urgency_score': analysis.urgency_score,
                'location': emergency_data.institution_name,
                'symptoms': symptoms or description[:100] + "..." if len(description) > 100 else description,
                'ai_severity': f"{analysis.severity_level.value} - 置信度 {analysis.confidence_score:.1%}",
                'ai_recommendation': analysis.reasoning,
                'action_url': f"https://app.emergency-guardian.com/emergency/{emergency_data.emergency_id}",
                'description': description,
                'timestamp': emergency_data.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                'requested_amount': emergency_data.requested_amount,
                'institution': emergency_data.institution_name
            }
            
            # 根据紧急类型确定通知类型
            emergency_type_map = {
                EmergencyType.MEDICAL_EMERGENCY: 'medical',
                EmergencyType.FINANCIAL_EMERGENCY: 'financial',
                EmergencyType.SECURITY_INCIDENT: 'security'
            }
            
            notification_type = emergency_type_map.get(emergency_data.emergency_type, 'medical')
            
            # 发送通知
            # 将严重程度级别转换为数字
            severity_level_map = {
                SeverityLevel.LOW: 1,
                SeverityLevel.MEDIUM: 2,
                SeverityLevel.HIGH: 3,
                SeverityLevel.CRITICAL: 3
            }
            severity_level_int = severity_level_map.get(analysis.severity_level, 2)
            
            results = await self.notification_coordinator.send_emergency_notification(
                emergency_id=emergency_data.emergency_id,
                emergency_type=notification_type,
                severity_level=severity_level_int,
                message_data=notification_data
            )
            
            logger.info(f"Guardian notification results: {results['notifications_sent']}/{results['total_guardians']} sent")
            
            # 如果是高优先级紧急情况，启动响应监控
            if analysis.urgency_score >= 80:
                asyncio.create_task(self._monitor_guardian_responses(emergency_data.emergency_id))
            
        except Exception as e:
            logger.error(f"Failed to notify guardians: {e}")
            # 通知失败不应该阻止紧急流程继续
    
    async def _monitor_guardian_responses(self, emergency_id: str, timeout_minutes: int = 30):
        """
        监控监护人响应情况
        
        Args:
            emergency_id: 紧急情况ID
            timeout_minutes: 超时时间（分钟）
        """
        try:
            logger.info(f"Starting guardian response monitoring for {emergency_id}")
            
            start_time = datetime.now()
            timeout_time = start_time + timedelta(minutes=timeout_minutes)
            
            while datetime.now() < timeout_time:
                # 检查监护人响应状态
                guardian_status = await self.notification_coordinator.get_all_guardian_status()
                
                responded_count = sum(1 for status in guardian_status.values() 
                                    if status.value in ['acknowledged', 'responded'])
                total_count = len(guardian_status)
                
                logger.info(f"Guardian response status: {responded_count}/{total_count}")
                
                # 如果大部分监护人已响应，停止监控
                if responded_count >= total_count * 0.7:
                    logger.info("Sufficient guardian responses received")
                    break
                
                # 等待一段时间再检查
                await asyncio.sleep(60)  # 每分钟检查一次
            
            # 超时处理
            if datetime.now() >= timeout_time:
                logger.warning(f"Guardian response monitoring timed out for {emergency_id}")
                await self._handle_response_timeout(emergency_id)
            
        except Exception as e:
            logger.error(f"Error in guardian response monitoring: {e}")
    
    async def _handle_response_timeout(self, emergency_id: str):
        """
        处理监护人响应超时
        
        Args:
            emergency_id: 紧急情况ID
        """
        try:
            logger.warning(f"Handling response timeout for {emergency_id}")
            
            # 发送超时提醒通知
            timeout_data = {
                'emergency_id': emergency_id,
                'message': '紧急情况响应超时，请立即查看',
                'urgency': 'CRITICAL'
            }
            
            # 这里可以发送更紧急的通知或启动备用流程
            # 例如：联系备用监护人、发送语音电话等
            
            logger.info(f"Timeout handling completed for {emergency_id}")
            
        except Exception as e:
            logger.error(f"Error handling response timeout: {e}")
    
    async def register_guardian(self, guardian_id: str, contact_info: Dict[str, str], preferences: Dict[str, Any] = None):
        """
        注册监护人到通知系统
        
        Args:
            guardian_id: 监护人ID
            contact_info: 联系信息
            preferences: 通知偏好
        """
        await self.notification_coordinator.register_guardian(guardian_id, contact_info, preferences)
        logger.info(f"Guardian {guardian_id} registered for notifications")
    
    async def update_guardian_status(self, guardian_id: str, status: str):
        """
        更新监护人状态
        
        Args:
            guardian_id: 监护人ID
            status: 状态 ('acknowledged', 'responded', 'offline')
        """
        try:
            from .notification_coordinator import GuardianStatus
        except ImportError:
            from notification_coordinator import GuardianStatus
        
        status_map = {
            'acknowledged': GuardianStatus.ACKNOWLEDGED,
            'responded': GuardianStatus.RESPONDED,
            'offline': GuardianStatus.OFFLINE,
            'notified': GuardianStatus.NOTIFIED
        }
        
        if status in status_map:
            await self.notification_coordinator.update_guardian_status(guardian_id, status_map[status])
            logger.info(f"Guardian {guardian_id} status updated to {status}")
    
    def get_notification_stats(self) -> Dict[str, Any]:
        """获取通知统计信息"""
        return self.notification_coordinator.get_notification_stats()


# 工厂函数
def create_emergency_coordinator(config: Dict[str, Any]) -> EmergencyCoordinator:
    """
    创建紧急协调器实例
    
    Args:
        config: 配置字典
        
    Returns:
        EmergencyCoordinator: 协调器实例
    """
    required_keys = [
        'gemini_api_key',
        'web3_provider_url', 
        'ai_agent_private_key'
    ]
    
    for key in required_keys:
        if key not in config:
            raise ValueError(f"Missing required config key: {key}")
    
    return EmergencyCoordinator(config)