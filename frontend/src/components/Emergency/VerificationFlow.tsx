/**
 * VerificationFlow Component - 验证流程显示
 */

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "../Common/Card";
import { Badge } from "../Common/Badge";
import { Button } from "../Common/Button";
import type { Emergency, GuardianApproval } from "../../types";

interface VerificationFlowProps {
  emergency: Emergency;
  onCancel?: () => void;
  onRefresh?: () => void;
}

interface VerificationStep {
  id: string;
  title: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  timestamp?: Date;
  description: string;
}

export const VerificationFlow: React.FC<VerificationFlowProps> = ({
  emergency,
  onCancel,
  onRefresh,
}) => {
  const [steps, setSteps] = useState<VerificationStep[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);

  const demoSteps = [
    { id: 1, title: "紧急请求详情", icon: "📋" },
    { id: 2, title: "AI智能分析", icon: "🤖" },
    { id: 3, title: "零知识证明", icon: "🔐" },
    { id: 4, title: "监护人审批", icon: "👥" },
  ];

  useEffect(() => {
    // Initialize verification steps based on emergency status
    const initialSteps: VerificationStep[] = [
      {
        id: "submitted",
        title: "紧急请求已提交",
        status: "completed",
        timestamp: emergency.createdAt,
        description: "紧急请求已成功提交到区块链网络",
      },
      {
        id: "ai_analysis",
        title: "AI智能分析",
        status: emergency.status === "draft" ? "pending" : "completed",
        timestamp:
          emergency.status !== "draft" ? emergency.createdAt : undefined,
        description: "AI代理正在分析紧急情况并生成处理建议",
      },
      {
        id: "zk_proof",
        title: "零知识证明验证",
        status: emergency.status === "draft" ? "pending" : "completed",
        description: "验证监护人身份和授权的零知识证明",
      },
      {
        id: "notification",
        title: "通知监护人",
        status: emergency.status === "draft" ? "pending" : "completed",
        timestamp:
          emergency.status !== "draft" ? emergency.createdAt : undefined,
        description: "正在通知所有监护人审批此紧急请求",
      },
      {
        id: "guardian_approval",
        title: "监护人审批",
        status: getApprovalStatus(emergency.approvals),
        description: `需要 ${getRequiredApprovals(
          emergency.level
        )} 个监护人审批`,
      },
      {
        id: "execution",
        title: "执行操作",
        status: emergency.status === "executed" ? "completed" : "pending",
        description: "执行紧急操作并转移资金",
      },
    ];

    setSteps(initialSteps);
  }, [emergency]);

  const getApprovalStatus = (
    approvals: GuardianApproval[]
  ): VerificationStep["status"] => {
    const approvedCount = approvals.filter(
      (a) => a.status === "approved"
    ).length;
    const rejectedCount = approvals.filter(
      (a) => a.status === "rejected"
    ).length;
    const requiredApprovals = getRequiredApprovals(emergency.level);

    if (rejectedCount > 0) return "failed";
    if (approvedCount >= requiredApprovals) return "completed";
    if (approvals.some((a) => a.status === "pending")) return "in_progress";
    return "pending";
  };

  const getRequiredApprovals = (level: string): number => {
    switch (level) {
      case "critical":
        return 3;
      case "high":
        return 2;
      case "medium":
        return 2;
      case "low":
        return 1;
      default:
        return 2;
    }
  };

  const getStepIcon = (status: VerificationStep["status"]) => {
    switch (status) {
      case "completed":
        return (
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        );
      case "in_progress":
        return (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
          </div>
        );
      case "failed":
        return (
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-gray-500 rounded-full" />
          </div>
        );
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return "completed";
    if (stepId === currentStep) return "current";
    return "upcoming";
  };

  const getApprovalProgress = () => {
    const approvedCount = emergency.approvals.filter(
      (a) => a.status === "approved"
    ).length;
    const totalCount = emergency.approvals.length;
    return {
      approved: approvedCount,
      total: totalCount,
      percentage: (approvedCount / totalCount) * 100,
    };
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Demo Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              紧急请求验证流程
            </h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
              >
                {showAdvancedFeatures ? "隐藏" : "显示"}高级功能
              </Button>
              <Badge variant="primary">ID: {emergency.id.slice(-8)}</Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {demoSteps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full text-lg font-medium cursor-pointer ${
                      getStepStatus(step.id) === "completed"
                        ? "bg-green-500 text-white"
                        : getStepStatus(step.id) === "current"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                    onClick={() => setCurrentStep(step.id)}
                  >
                    {getStepStatus(step.id) === "completed" ? "✓" : step.icon}
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500">步骤 {step.id}</div>
                  </div>
                </div>
                {index < demoSteps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 ${
                      getStepStatus(step.id) === "completed"
                        ? "bg-green-500"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="mt-6 flex justify-center space-x-3">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                上一步
              </Button>
            )}
            {currentStep < demoSteps.length && (
              <Button onClick={() => setCurrentStep(currentStep + 1)}>
                下一步
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Content */}
        <div className="space-y-6">
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900">
                  📋 紧急请求详情
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        类型
                      </label>
                      <p className="text-gray-900">{emergency.type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        级别
                      </label>
                      <Badge
                        variant={
                          emergency.level === "high" ? "warning" : "primary"
                        }
                      >
                        {emergency.level}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      标题
                    </label>
                    <p className="text-gray-900">{emergency.title}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      描述
                    </label>
                    <p className="text-gray-900">{emergency.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        请求金额
                      </label>
                      <p className="text-gray-900">
                        {emergency.requestedAmount} ETH
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        状态
                      </label>
                      <Badge
                        variant={
                          emergency.status === "active" ? "success" : "warning"
                        }
                      >
                        {emergency.status}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      接收地址
                    </label>
                    <p className="text-gray-900 font-mono text-sm">
                      {emergency.recipientAddress}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      创建时间
                    </label>
                    <p className="text-gray-900">
                      {emergency.createdAt.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900">
                  🤖 AI智能分析
                </h3>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🤖</div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    AI智能分析功能
                  </h4>
                  <p className="text-gray-600">
                    基于Google Gemini的AI代理正在分析紧急情况...
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900">
                  🔐 零知识证明
                </h3>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🔐</div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    零知识证明验证
                  </h4>
                  <p className="text-gray-600">
                    使用ZK-SNARKs技术验证身份和授权...
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    👥 监护人审批状态
                  </h3>
                  <Badge variant="primary">
                    {getApprovalProgress().approved}/
                    {getApprovalProgress().total} 已批准
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>审批进度</span>
                      <span>
                        {Math.round(getApprovalProgress().percentage)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-500 h-3 rounded-full transition-all duration-300"
                        style={{
                          width: `${getApprovalProgress().percentage}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Guardian approvals */}
                  <div className="space-y-3">
                    {emergency.approvals.map((approval, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              approval.status === "approved"
                                ? "bg-green-500"
                                : approval.status === "rejected"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                            }`}
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              {approval.guardianName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {approval.guardianAddress.slice(0, 10)}...
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              approval.status === "approved"
                                ? "success"
                                : approval.status === "rejected"
                                ? "emergency"
                                : "warning"
                            }
                          >
                            {approval.status === "approved"
                              ? "已批准"
                              : approval.status === "rejected"
                              ? "已拒绝"
                              : "待处理"}
                          </Badge>
                          {approval.timestamp && (
                            <p className="text-xs text-gray-500 mt-1">
                              {approval.timestamp.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {emergency.status === "executed" && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-green-600 text-lg">🎉</span>
                        <h4 className="font-medium text-green-900">
                          紧急请求已执行
                        </h4>
                      </div>
                      <p className="text-green-700 text-sm mb-2">
                        所有必要的监护人已批准，资金已成功转移
                      </p>
                      {emergency.executionTx && (
                        <p className="text-xs text-green-600 font-mono">
                          交易哈希: {emergency.executionTx}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Side Panel - Technical Details */}
        {showAdvancedFeatures && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900">
                  🔧 技术详情
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div>
                    <label className="font-medium text-gray-600">
                      区块链网络
                    </label>
                    <p className="text-gray-900">Ethereum Sepolia Testnet</p>
                  </div>

                  <div>
                    <label className="font-medium text-gray-600">
                      智能合约
                    </label>
                    <p className="text-gray-900 font-mono text-xs">
                      0x6af445EA589D8f550a3D1dacf34745071a4D5b4F
                    </p>
                  </div>

                  <div>
                    <label className="font-medium text-gray-600">
                      ZK证明验证器
                    </label>
                    <p className="text-gray-900 font-mono text-xs">
                      0xf9D10528B5b1837cd12be6A449475a1288832263
                    </p>
                  </div>

                  {emergency.transactionHash && (
                    <div>
                      <label className="font-medium text-gray-600">
                        创建交易
                      </label>
                      <p className="text-gray-900 font-mono text-xs">
                        {emergency.transactionHash}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="font-medium text-gray-600">
                      AI代理状态
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600">在线</span>
                    </div>
                  </div>

                  <div>
                    <label className="font-medium text-gray-600">
                      ZK证明状态
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-blue-600">已验证</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Architecture */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900">
                  🏗️ 系统架构
                </h3>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <h4 className="font-medium text-blue-900 mb-1">前端层</h4>
                    <p className="text-blue-800">
                      React + TypeScript + Zustand
                    </p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded p-3">
                    <h4 className="font-medium text-purple-900 mb-1">
                      AI代理层
                    </h4>
                    <p className="text-purple-800">
                      Python FastAPI + Google Gemini
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <h4 className="font-medium text-green-900 mb-1">
                      区块链层
                    </h4>
                    <p className="text-green-800">
                      Ethereum + Solidity + ZK-SNARKs
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <h4 className="font-medium text-yellow-900 mb-1">存储层</h4>
                    <p className="text-yellow-800">IPFS + 本地持久化</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Original Verification Steps (when advanced features are hidden) */}
      {!showAdvancedFeatures && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">验证流程</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-start space-x-4">
                  {/* Step Icon */}
                  <div className="flex-shrink-0">
                    {getStepIcon(step.status)}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">
                        {step.title}
                      </h4>
                      {step.timestamp && (
                        <span className="text-xs text-gray-500">
                          {formatTime(step.timestamp)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {step.description}
                    </p>

                    {/* Guardian Approvals Detail */}
                    {step.id === "guardian_approval" &&
                      emergency.approvals.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {emergency.approvals.map((approval) => (
                            <div
                              key={approval.guardianId}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded"
                            >
                              <div className="flex items-center space-x-2">
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    approval.status === "approved"
                                      ? "bg-green-500"
                                      : approval.status === "rejected"
                                      ? "bg-red-500"
                                      : "bg-yellow-500"
                                  }`}
                                />
                                <span className="text-sm text-gray-700">
                                  {approval.guardianName}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge
                                  variant={
                                    approval.status === "approved"
                                      ? "success"
                                      : approval.status === "rejected"
                                      ? "emergency"
                                      : "warning"
                                  }
                                >
                                  {approval.status === "approved"
                                    ? "已批准"
                                    : approval.status === "rejected"
                                    ? "已拒绝"
                                    : "等待中"}
                                </Badge>
                                {approval.timestamp && (
                                  <span className="text-xs text-gray-500">
                                    {formatTime(approval.timestamp)}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-4 mt-8 w-0.5 h-6 bg-gray-200" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          返回监控
        </Button>
        <div className="space-x-3">
          <Button variant="outline" onClick={onRefresh}>
            刷新状态
          </Button>
          {emergency.status === "executed" && (
            <Button variant="success">查看交易详情</Button>
          )}
        </div>
      </div>
    </div>
  );
};
