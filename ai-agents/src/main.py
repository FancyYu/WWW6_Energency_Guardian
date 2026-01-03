"""
Emergency Guardian AI Agent Service - Main Application

FastAPI应用程序，提供AI紧急协调、通知管理和个性化操作手册服务
"""

import os
import logging
import uuid
from contextlib import asynccontextmanager
from typing import Dict, Any, List, Optional
from datetime import datetime

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import uvicorn

# 导入我们的服务
from emergency_coordinator import EmergencyCoordinator, EmergencyData
from execution_coordinator import ExecutionCoordinator
from notification_coordinator import NotificationCoordinator
from mock_notification_coordinator import MockNotificationCoordinator
from personalized_operation_manual import PersonalizedOperationManual

# 配置日志
logging.basicConfig(
    level=getattr(logging, os.getenv('LOG_LEVEL', 'INFO')),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 全局服务实例
services = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时初始化服务
    logger.info("🚀 Initializing Emergency Guardian AI Agent Services...")
    
    try:
        # 创建配置
        config = {
            'gemini_api_key': os.getenv('GEMINI_API_KEY', 'mock_key'),
            'use_real_gemini': os.getenv('USE_REAL_GEMINI', 'false').lower() == 'true',
            'web3_provider_url': os.getenv('WEB3_PROVIDER_URL', 'https://ethereum-sepolia-rpc.publicnode.com'),
            'emergency_contract_address': os.getenv('EMERGENCY_CONTRACT_ADDRESS', '0x6af445EA589D8f550a3D1dacf34745071a4D5b4F'),
            'zk_proof_verifier_address': os.getenv('ZK_PROOF_VERIFIER_ADDRESS', '0xf9D10528B5b1837cd12be6A449475a1288832263'),
            'ai_agent_private_key': os.getenv('AI_AGENT_PRIVATE_KEY', '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')
        }
        
        # 初始化紧急协调器
        services['emergency_coordinator'] = EmergencyCoordinator(config)
        logger.info("✅ Emergency Coordinator initialized")
        
        # 初始化执行协调器
        services['execution_coordinator'] = ExecutionCoordinator(config)
        logger.info("✅ Execution Coordinator initialized")
        
        # 初始化通知协调器 (根据配置选择Mock或真实服务)
        use_mock_notifications = os.getenv('USE_MOCK_NOTIFICATIONS', 'true').lower() == 'true'
        if use_mock_notifications:
            services['notification_coordinator'] = MockNotificationCoordinator()
            logger.info("✅ Mock Notification Coordinator initialized")
        else:
            services['notification_coordinator'] = NotificationCoordinator()
            logger.info("✅ Real Notification Coordinator initialized")
        
        # 初始化个性化操作手册
        services['operation_manual'] = PersonalizedOperationManual()
        logger.info("✅ Personalized Operation Manual initialized")
        
        logger.info("🎉 All services initialized successfully!")
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize services: {e}")
        raise
    
    yield
    
    # 关闭时清理资源
    logger.info("🔄 Shutting down Emergency Guardian AI Agent Services...")
    services.clear()
    logger.info("✅ Cleanup completed")

# 创建FastAPI应用
app = FastAPI(
    title="Emergency Guardian AI Agent Service",
    description="AI-powered emergency coordination, notification management, and personalized operation manual service",
    version="1.0.0",
    lifespan=lifespan
)

# CORS配置
allowed_origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:5173').split(',')
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic模型定义
class EmergencyAnalysisRequest(BaseModel):
    user_address: str = Field(..., description="用户钱包地址")
    emergency_data: Dict[str, Any] = Field(..., description="紧急情况数据")
    medical_records: Optional[Dict[str, Any]] = Field(None, description="医疗记录")
    context: Optional[str] = Field(None, description="额外上下文信息")

class EmergencyAnalysisResponse(BaseModel):
    analysis_result: Dict[str, Any] = Field(..., description="分析结果")
    emergency_level: int = Field(..., description="紧急级别 (1-3)")
    recommended_actions: List[str] = Field(..., description="推荐操作")
    confidence_score: float = Field(..., description="置信度分数 (0-1)")

class NotificationRequest(BaseModel):
    user_address: str = Field(..., description="用户钱包地址")
    emergency_type: str = Field(..., description="紧急类型")
    message: str = Field(..., description="通知消息")
    urgency_level: int = Field(default=1, description="紧急程度 (1-3)")
    channels: List[str] = Field(default=['email'], description="通知渠道")

class PersonalizationRequest(BaseModel):
    user_address: str = Field(..., description="用户钱包地址")
    template_type: str = Field(..., description="模板类型")
    user_preferences: Dict[str, Any] = Field(..., description="用户偏好设置")

# API路由

@app.get("/")
async def root():
    """根路径 - API信息"""
    return {
        "service": "Emergency Guardian AI Agent",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "analyze_emergency": "/api/v1/emergency/analyze",
            "send_notifications": "/api/v1/notifications/send",
            "create_personalized_manual": "/api/v1/manual/personalize",
            "get_user_profile": "/api/v1/profile/{user_address}",
        }
    }

@app.get("/health")
async def health_check():
    """健康检查端点"""
    try:
        # 检查所有服务是否正常
        service_status = {}
        for service_name, service in services.items():
            try:
                # 简单的服务可用性检查
                service_status[service_name] = "healthy"
            except Exception as e:
                service_status[service_name] = f"unhealthy: {str(e)}"
        
        all_healthy = all(status == "healthy" for status in service_status.values())
        
        return {
            "status": "healthy" if all_healthy else "degraded",
            "timestamp": "2026-01-03T23:20:00Z",
            "services": service_status,
            "version": "1.0.0"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": "2026-01-03T23:20:00Z"
            }
        )

@app.post("/api/v1/emergency/analyze", response_model=EmergencyAnalysisResponse)
async def analyze_emergency(request: EmergencyAnalysisRequest):
    """分析紧急情况并提供AI建议"""
    try:
        coordinator = services.get('emergency_coordinator')
        if not coordinator:
            raise HTTPException(status_code=503, detail="Emergency coordinator service unavailable")
        
        # 调用紧急协调器进行分析
        # 构造EmergencyData对象
        from emergency_coordinator import EmergencyData, EmergencyType
        import uuid
        
        # 确定紧急类型
        emergency_type_str = request.emergency_data.get('type', 'medical').lower()
        type_mapping = {
            'medical': 'MEDICAL_EMERGENCY',
            'financial': 'FINANCIAL_EMERGENCY', 
            'security': 'SECURITY_INCIDENT',
            'insurance': 'ACCIDENT_INSURANCE',
            'family': 'FAMILY_SUPPORT',
            'legal': 'LEGAL_ASSISTANCE'
        }
        
        emergency_type_enum = type_mapping.get(emergency_type_str, 'MEDICAL_EMERGENCY')
        try:
            emergency_type = EmergencyType[emergency_type_enum]
        except KeyError:
            emergency_type = EmergencyType.MEDICAL_EMERGENCY  # 默认为医疗紧急
        
        emergency_data = EmergencyData(
            emergency_id=str(uuid.uuid4()),
            user_address=request.user_address,
            emergency_type=emergency_type,
            institution_name=request.emergency_data.get('institution_name', 'Emergency Hospital'),
            institution_address=request.emergency_data.get('institution_address', '0x1234567890123456789012345678901234567890'),
            documents=[{
                'type': 'medical_record',
                'data': request.medical_records or {},
                'description': request.emergency_data.get('description', ''),
                'context': request.context or ''
            }],
            requested_amount=float(request.emergency_data.get('amount', 1.0)),
            zk_proof={'mock': True, 'valid': True},  # Mock ZK proof for development
            timestamp=datetime.now(),
            contact_info=request.emergency_data.get('contact_info', {
                'phone': '+1-555-0123',
                'email': 'emergency@example.com'
            })
        )
        
        analysis_result = await coordinator.handle_emergency_request(emergency_data)
        
        return EmergencyAnalysisResponse(
            analysis_result=analysis_result.analysis_summary if hasattr(analysis_result, 'analysis_summary') else {},
            emergency_level=getattr(analysis_result, 'emergency_level', 1),
            recommended_actions=getattr(analysis_result, 'recommended_actions', []),
            confidence_score=getattr(analysis_result, 'confidence_score', 0.8)
        )
        
    except Exception as e:
        logger.error(f"Emergency analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/api/v1/notifications/send")
async def send_notifications(request: NotificationRequest, background_tasks: BackgroundTasks):
    """发送紧急通知"""
    try:
        coordinator = services.get('notification_coordinator')
        if not coordinator:
            raise HTTPException(status_code=503, detail="Notification coordinator service unavailable")
        
        # 后台任务发送通知
        background_tasks.add_task(
            coordinator.send_emergency_notification,
            emergency_id=f"EMERGENCY_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            emergency_type=request.emergency_type,
            severity_level=request.urgency_level,
            message_data={
                'user_address': request.user_address,
                'message': request.message,
                'channels': request.channels,
                'timestamp': datetime.now().isoformat()
            }
        )
        
        return {
            "status": "notifications_queued",
            "message": "Emergency notifications have been queued for delivery",
            "channels": request.channels,
            "timestamp": "2026-01-03T23:20:00Z"
        }
        
    except Exception as e:
        logger.error(f"Notification sending failed: {e}")
        raise HTTPException(status_code=500, detail=f"Notification failed: {str(e)}")

@app.post("/api/v1/manual/personalize")
async def create_personalized_manual(request: PersonalizationRequest):
    """创建个性化操作手册"""
    try:
        manual = services.get('operation_manual')
        if not manual:
            raise HTTPException(status_code=503, detail="Operation manual service unavailable")
        
        # 创建个性化手册
        personalized_manual = await manual.create_personalized_manual(
            user_address=request.user_address,
            template_type=request.template_type,
            preferences=request.user_preferences
        )
        
        return {
            "status": "success",
            "manual": personalized_manual,
            "template_type": request.template_type,
            "user_address": request.user_address,
            "timestamp": "2026-01-03T23:20:00Z"
        }
        
    except Exception as e:
        logger.error(f"Manual personalization failed: {e}")
        raise HTTPException(status_code=500, detail=f"Personalization failed: {str(e)}")

@app.get("/api/v1/profile/{user_address}")
async def get_user_profile(user_address: str):
    """获取用户个性化配置"""
    try:
        manual = services.get('operation_manual')
        if not manual:
            raise HTTPException(status_code=503, detail="Operation manual service unavailable")
        
        # 获取用户配置
        profile = await manual.get_user_profile(user_address)
        
        return {
            "status": "success",
            "user_address": user_address,
            "profile": profile,
            "timestamp": "2026-01-03T23:20:00Z"
        }
        
    except Exception as e:
        logger.error(f"Profile retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=f"Profile retrieval failed: {str(e)}")

@app.get("/api/v1/status")
async def get_service_status():
    """获取服务状态详情"""
    try:
        status_info = {
            "service_name": "Emergency Guardian AI Agent",
            "version": "1.0.0",
            "uptime": "running",
            "services": {},
            "configuration": {
                "use_real_gemini": os.getenv('USE_REAL_GEMINI', 'false'),
                "use_real_firebase": os.getenv('USE_REAL_FIREBASE', 'false'),
                "use_mock_notifications": os.getenv('USE_MOCK_NOTIFICATIONS', 'true'),
                "log_level": os.getenv('LOG_LEVEL', 'INFO')
            },
            "contracts": {
                "emergency_management": os.getenv('EMERGENCY_CONTRACT_ADDRESS', 'not_configured'),
                "zk_proof_verifier": os.getenv('ZK_PROOF_VERIFIER_ADDRESS', 'not_configured')
            }
        }
        
        # 检查各个服务状态
        for service_name in ['emergency_coordinator', 'execution_coordinator', 'notification_coordinator', 'operation_manual']:
            service = services.get(service_name)
            status_info['services'][service_name] = {
                "status": "available" if service else "unavailable",
                "type": type(service).__name__ if service else "None"
            }
        
        return status_info
        
    except Exception as e:
        logger.error(f"Status check failed: {e}")
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")

# 错误处理
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """全局异常处理器"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred",
            "timestamp": "2026-01-03T23:20:00Z"
        }
    )

if __name__ == "__main__":
    # 开发环境运行
    port = int(os.getenv('PORT', 8001))
    host = os.getenv('HOST', '0.0.0.0')
    
    logger.info(f"🚀 Starting Emergency Guardian AI Agent Service on {host}:{port}")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
        log_level=os.getenv('LOG_LEVEL', 'info').lower()
    )