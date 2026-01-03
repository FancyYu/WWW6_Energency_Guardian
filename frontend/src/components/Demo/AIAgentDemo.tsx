/**
 * AIAgentDemo Component - AI智能代理演示组件
 */

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, Badge, Button } from "../Common";

interface AIAnalysis {
  stage: string;
  status: "analyzing" | "completed" | "failed";
  progress: number;
  result?: any;
  details: string;
}

interface AIRecommendation {
  type: "action" | "alert" | "optimization";
  title: string;
  description: string;
  confidence: number;
  priority: "high" | "medium" | "low";
}

export const AIAgentDemo: React.FC<{ emergencyData?: any }> = ({
  emergencyData,
}) => {
  const [analyses, setAnalyses] = useState<AIAnalysis[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(
    []
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiStatus, setAiStatus] = useState<"idle" | "thinking" | "complete">(
    "idle"
  );

  useEffect(() => {
    if (emergencyData && !isAnalyzing) {
      startAIAnalysis();
    }
  }, [emergencyData]);

  const startAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAiStatus("thinking");

    const analysisStages = [
      {
        stage: "情况评估",
        details: "分析紧急情况的严重程度和类型",
      },
      {
        stage: "风险分析",
        details: "评估潜在风险和影响范围",
      },
      {
        stage: "资源匹配",
        details: "匹配最适合的监护人和资源",
      },
      {
        stage: "策略生成",
        details: "生成最优的处理策略和建议",
      },
    ];

    // 初始化分析状态
    const initialAnalyses = analysisStages.map((stage) => ({
      ...stage,
      status: "analyzing" as const,
      progress: 0,
    }));
    setAnalyses(initialAnalyses);

    // 模拟AI分析过程
    for (let i = 0; i < analysisStages.length; i++) {
      await simulateAIAnalysis(i);
    }

    // 生成AI推荐
    generateRecommendations();

    setAiStatus("complete");
    setIsAnalyzing(false);
  };

  const simulateAIAnalysis = async (index: number) => {
    // 分析进度
    for (let progress = 0; progress <= 100; progress += 15) {
      await new Promise((resolve) => setTimeout(resolve, 120));
      setAnalyses((prev) =>
        prev.map((analysis, i) =>
          i === index ? { ...analysis, progress } : analysis
        )
      );
    }

    // 完成分析
    const results = [
      {
        severity: "高",
        confidence: 0.92,
        factors: ["医疗紧急", "时间敏感", "资金需求明确"],
      },
      {
        riskLevel: "中等",
        mitigationStrategies: ["多重验证", "分阶段执行", "实时监控"],
      },
      {
        matchedGuardians: 3,
        optimalPath: "医疗专家优先",
        responseTime: "< 15分钟",
      },
      {
        strategy: "快速响应",
        steps: 4,
        estimatedTime: "30分钟",
        successRate: "95%",
      },
    ];

    setAnalyses((prev) =>
      prev.map((analysis, i) =>
        i === index
          ? {
              ...analysis,
              status: "completed",
              progress: 100,
              result: results[i],
            }
          : analysis
      )
    );
  };

  const generateRecommendations = () => {
    const aiRecommendations: AIRecommendation[] = [
      {
        type: "action",
        title: "优先联系医疗专家监护人",
        description: "基于紧急类型分析，建议优先通知具有医疗背景的监护人张医生",
        confidence: 0.94,
        priority: "high",
      },
      {
        type: "alert",
        title: "启用快速审批模式",
        description: "检测到高紧急级别，建议启用快速审批流程以减少等待时间",
        confidence: 0.87,
        priority: "high",
      },
      {
        type: "optimization",
        title: "预分配资金池",
        description: "基于历史数据，建议预先分配资金池以加速执行过程",
        confidence: 0.76,
        priority: "medium",
      },
      {
        type: "action",
        title: "自动生成医疗报告",
        description: "AI可以自动生成标准化医疗紧急报告，提高处理效率",
        confidence: 0.82,
        priority: "medium",
      },
    ];

    setRecommendations(aiRecommendations);
  };

  const getStatusBadge = (status: AIAnalysis["status"]) => {
    switch (status) {
      case "analyzing":
        return <Badge variant="warning">分析中</Badge>;
      case "completed":
        return <Badge variant="success">完成</Badge>;
      case "failed":
        return <Badge variant="emergency">失败</Badge>;
      default:
        return <Badge variant="gray">待处理</Badge>;
    }
  };

  const getRecommendationIcon = (type: AIRecommendation["type"]) => {
    switch (type) {
      case "action":
        return "⚡";
      case "alert":
        return "🚨";
      case "optimization":
        return "🎯";
      default:
        return "💡";
    }
  };

  const getPriorityColor = (priority: AIRecommendation["priority"]) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-medium text-gray-900">🤖 AI智能代理</h3>
            <Badge variant="primary" size="sm">
              Gemini AI
            </Badge>
            {aiStatus === "thinking" && (
              <div className="flex items-center space-x-1">
                <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"></div>
                <div
                  className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            )}
          </div>
          {!isAnalyzing && analyses.length === 0 && (
            <Button onClick={startAIAnalysis} size="sm">
              开始AI分析
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {analyses.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🤖</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              AI智能紧急协调系统
            </h4>
            <p className="text-gray-600 mb-4">
              基于Google Gemini的AI代理提供智能分析和决策支持
            </p>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-left">
              <h5 className="font-medium text-purple-900 mb-2">AI能力：</h5>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>
                  • <strong>智能分析</strong>：自动评估紧急情况严重程度
                </li>
                <li>
                  • <strong>风险预测</strong>：基于历史数据预测潜在风险
                </li>
                <li>
                  • <strong>资源优化</strong>：智能匹配最适合的监护人
                </li>
                <li>
                  • <strong>决策支持</strong>：提供数据驱动的处理建议
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* AI分析进度 */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 mb-3">🧠 AI分析进度</h4>
              {analyses.map((analysis, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h5 className="font-medium text-gray-900">
                        {analysis.stage}
                      </h5>
                      <p className="text-sm text-gray-600">
                        {analysis.details}
                      </p>
                    </div>
                    {getStatusBadge(analysis.status)}
                  </div>

                  {/* Progress bar */}
                  <div className="mb-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          analysis.status === "completed"
                            ? "bg-green-500"
                            : analysis.status === "failed"
                            ? "bg-red-500"
                            : "bg-blue-500"
                        }`}
                        style={{ width: `${analysis.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Analysis results */}
                  {analysis.result && (
                    <div className="bg-gray-50 rounded p-2 text-xs">
                      <pre className="text-gray-700">
                        {JSON.stringify(analysis.result, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* AI推荐 */}
            {recommendations.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  💡 AI智能推荐
                </h4>
                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 ${getPriorityColor(
                        rec.priority
                      )}`}
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">
                          {getRecommendationIcon(rec.type)}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium">{rec.title}</h5>
                            <div className="flex items-center space-x-2">
                              <Badge variant="gray" size="sm">
                                置信度: {Math.round(rec.confidence * 100)}%
                              </Badge>
                              <Badge
                                variant={
                                  rec.priority === "high"
                                    ? "emergency"
                                    : rec.priority === "medium"
                                    ? "warning"
                                    : "success"
                                }
                                size="sm"
                              >
                                {rec.priority === "high"
                                  ? "高优先级"
                                  : rec.priority === "medium"
                                  ? "中优先级"
                                  : "低优先级"}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm">{rec.description}</p>

                          {/* Confidence bar */}
                          <div className="mt-2">
                            <div className="w-full bg-white bg-opacity-50 rounded-full h-1">
                              <div
                                className="h-1 rounded-full bg-current opacity-60"
                                style={{ width: `${rec.confidence * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI服务状态 */}
            {aiStatus === "complete" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-green-600 text-lg">🎉</span>
                  <h4 className="font-medium text-green-900">AI分析完成</h4>
                </div>
                <p className="text-green-700 text-sm mb-3">
                  AI代理已完成全面分析，生成了 {recommendations.length}{" "}
                  条智能推荐
                </p>
                <div className="bg-white rounded p-3 text-xs text-gray-600">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>分析时间:</strong> 2.3秒
                      <br />
                      <strong>处理数据:</strong> 1.2MB
                      <br />
                      <strong>模型版本:</strong> Gemini-1.5-Pro
                    </div>
                    <div>
                      <strong>置信度:</strong> 87.5%
                      <br />
                      <strong>推荐准确率:</strong> 94.2%
                      <br />
                      <strong>API调用:</strong> 成功
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
