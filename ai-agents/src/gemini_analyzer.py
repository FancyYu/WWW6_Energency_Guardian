"""
Gemini Analyzer - 使用 Gemini 1.5 Pro 分析医疗数据和紧急情况

负责：
1. 分析医疗文档和紧急情况的严重性
2. 评估机构可信度和文档真实性
3. 提供专业的医疗建议和风险评估
"""

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime

try:
    import google.generativeai as genai
    from google.generativeai.types import HarmCategory, HarmBlockThreshold
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

logger = logging.getLogger(__name__)


class GeminiAnalyzer:
    """
    Gemini 医疗数据分析器
    
    使用 Google Gemini 1.5 Pro 模型分析紧急医疗情况
    """
    
    def __init__(self, api_key: str):
        """
        初始化 Gemini 分析器
        
        Args:
            api_key: Google AI API 密钥
        """
        self.api_key = api_key
        
        if not GEMINI_AVAILABLE:
            logger.warning("Gemini API not available, running in mock mode")
            self.model = None
            return
            
        genai.configure(api_key=api_key)
        
        # 配置模型
        self.model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            generation_config={
                "temperature": 0.1,  # 低温度确保一致性
                "top_p": 0.8,
                "top_k": 40,
                "max_output_tokens": 2048,
            },
            safety_settings={
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            }
        )
        
        logger.info("Gemini Analyzer initialized with model: gemini-2.5-flash")
    
    async def analyze_emergency(self, prompt: str, documents: List[Dict[str, Any]]) -> str:
        """
        分析紧急情况
        
        Args:
            prompt: 分析提示
            documents: 相关文档列表
            
        Returns:
            str: Gemini 分析结果
        """
        try:
            # 构建完整的分析内容
            full_content = self._build_analysis_content(prompt, documents)
            
            # 调用 Gemini API
            response = await self._call_gemini_api(full_content)
            
            logger.info("Gemini analysis completed successfully")
            return response
            
        except Exception as e:
            logger.error(f"Gemini analysis failed: {e}")
            raise
    
    def _build_analysis_content(self, prompt: str, documents: List[Dict[str, Any]]) -> str:
        """
        构建分析内容
        
        Args:
            prompt: 基础提示
            documents: 文档列表
            
        Returns:
            str: 完整的分析内容
        """
        content_parts = [prompt]
        
        # 添加文档信息
        if documents:
            content_parts.append("\n**相关文档信息**:")
            for i, doc in enumerate(documents, 1):
                doc_info = f"""
                文档 {i}:
                - 类型: {doc.get('type', 'unknown')}
                - 标题: {doc.get('title', 'untitled')}
                - 大小: {doc.get('size', 0)} bytes
                - 哈希: {doc.get('hash', 'unknown')}
                - 描述: {doc.get('description', 'no description')}
                """
                content_parts.append(doc_info)
        
        # 添加分析指导原则
        content_parts.append(self._get_analysis_guidelines())
        
        return "\n".join(content_parts)
    
    def _get_analysis_guidelines(self) -> str:
        """
        获取分析指导原则
        
        Returns:
            str: 分析指导原则
        """
        return """
        
        **分析指导原则**:
        
        1. **医疗专业性**: 基于医学知识和临床经验进行分析
        2. **客观性**: 避免主观偏见，基于事实和证据
        3. **风险意识**: 识别潜在风险和不确定因素
        4. **伦理考量**: 考虑医疗伦理和患者权益
        5. **时效性**: 考虑紧急情况的时间敏感性
        
        **重点关注**:
        - 生命威胁程度
        - 治疗紧急性
        - 费用合理性
        - 机构资质
        - 文档完整性
        
        **输出要求**:
        - 使用标准 JSON 格式
        - 提供清晰的数值评分
        - 包含详细的分析说明
        - 标明置信度水平
        """
    
    async def _call_gemini_api(self, content: str) -> str:
        """
        调用 Gemini API
        
        Args:
            content: 分析内容
            
        Returns:
            str: API 响应
        """
        try:
            # 异步调用 Gemini
            response = await asyncio.get_event_loop().run_in_executor(
                None, 
                lambda: self.model.generate_content(content)
            )
            
            # 检查响应
            if not response.text:
                raise ValueError("Empty response from Gemini API")
            
            return response.text
            
        except Exception as e:
            logger.error(f"Gemini API call failed: {e}")
            raise
    
    async def analyze_medical_document(self, document: Dict[str, Any]) -> Dict[str, Any]:
        """
        分析单个医疗文档
        
        Args:
            document: 文档信息
            
        Returns:
            Dict: 文档分析结果
        """
        prompt = f"""
        请分析以下医疗文档的真实性和重要性：
        
        文档类型: {document.get('type', 'unknown')}
        文档标题: {document.get('title', 'untitled')}
        文档描述: {document.get('description', 'no description')}
        
        请评估：
        1. 文档类型的医疗重要性 (0-100)
        2. 文档内容的完整性 (0-100)
        3. 文档的可信度 (0-100)
        4. 紧急程度指示 (0-100)
        
        返回 JSON 格式：
        {{
            "importance": 85,
            "completeness": 90,
            "credibility": 88,
            "urgency_indicator": 75,
            "analysis": "详细分析说明"
        }}
        """
        
        try:
            response = await self._call_gemini_api(prompt)
            
            # 解析响应
            if "```json" in response:
                json_start = response.find("```json") + 7
                json_end = response.find("```", json_start)
                json_str = response[json_start:json_end].strip()
            else:
                json_str = response.strip()
            
            result = json.loads(json_str)
            result['document_id'] = document.get('id', 'unknown')
            
            return result
            
        except Exception as e:
            logger.error(f"Document analysis failed: {e}")
            return {
                'document_id': document.get('id', 'unknown'),
                'importance': 50,
                'completeness': 50,
                'credibility': 50,
                'urgency_indicator': 50,
                'analysis': f'Analysis failed: {str(e)}'
            }
    
    async def assess_institution_credibility(self, institution_name: str, institution_address: str) -> Dict[str, Any]:
        """
        评估机构可信度
        
        Args:
            institution_name: 机构名称
            institution_address: 机构地址
            
        Returns:
            Dict: 机构可信度评估
        """
        prompt = f"""
        请评估以下医疗机构的可信度：
        
        机构名称: {institution_name}
        机构地址: {institution_address}
        
        请基于以下维度评估：
        1. 机构类型识别 (医院/诊所/急救中心等)
        2. 地址合理性 (是否为合理的医疗机构地址)
        3. 名称专业性 (是否符合医疗机构命名规范)
        4. 整体可信度评分 (0-100)
        
        返回 JSON 格式：
        {{
            "institution_type": "医院",
            "address_validity": 85,
            "name_professionalism": 90,
            "overall_credibility": 87,
            "risk_factors": ["风险因素1", "风险因素2"],
            "analysis": "详细分析说明"
        }}
        """
        
        try:
            response = await self._call_gemini_api(prompt)
            
            # 解析响应
            if "```json" in response:
                json_start = response.find("```json") + 7
                json_end = response.find("```", json_start)
                json_str = response[json_start:json_end].strip()
            else:
                json_str = response.strip()
            
            return json.loads(json_str)
            
        except Exception as e:
            logger.error(f"Institution credibility assessment failed: {e}")
            return {
                'institution_type': 'unknown',
                'address_validity': 50,
                'name_professionalism': 50,
                'overall_credibility': 50,
                'risk_factors': [f'Assessment failed: {str(e)}'],
                'analysis': 'Credibility assessment unavailable'
            }
    
    async def validate_emergency_scenario(self, emergency_type: str, documents: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        验证紧急情况场景的合理性
        
        Args:
            emergency_type: 紧急情况类型
            documents: 相关文档
            
        Returns:
            Dict: 场景验证结果
        """
        prompt = f"""
        请验证以下紧急情况场景的合理性：
        
        紧急情况类型: {emergency_type}
        相关文档数量: {len(documents)}
        
        请评估：
        1. 场景类型与文档的匹配度 (0-100)
        2. 紧急情况的合理性 (0-100)
        3. 文档支持强度 (0-100)
        4. 潜在欺诈风险 (0-100, 越高风险越大)
        
        返回 JSON 格式：
        {{
            "scenario_document_match": 85,
            "scenario_reasonableness": 90,
            "document_support_strength": 88,
            "fraud_risk": 15,
            "validation_result": "VALID/SUSPICIOUS/INVALID",
            "analysis": "详细验证说明"
        }}
        """
        
        try:
            response = await self._call_gemini_api(prompt)
            
            # 解析响应
            if "```json" in response:
                json_start = response.find("```json") + 7
                json_end = response.find("```", json_start)
                json_str = response[json_start:json_end].strip()
            else:
                json_str = response.strip()
            
            return json.loads(json_str)
            
        except Exception as e:
            logger.error(f"Emergency scenario validation failed: {e}")
            return {
                'scenario_document_match': 50,
                'scenario_reasonableness': 50,
                'document_support_strength': 50,
                'fraud_risk': 70,
                'validation_result': 'SUSPICIOUS',
                'analysis': f'Validation failed: {str(e)}'
            }
    
    def get_model_info(self) -> Dict[str, Any]:
        """
        获取模型信息
        
        Returns:
            Dict: 模型信息
        """
        return {
            'model_name': 'gemini-2.5-flash',
            'provider': 'Google AI',
            'capabilities': [
                'medical_document_analysis',
                'emergency_assessment',
                'institution_credibility',
                'fraud_detection',
                'multilingual_support'
            ],
            'limitations': [
                'requires_internet_connection',
                'api_rate_limits',
                'content_safety_filters'
            ]
        }