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
        id: "zk_proof",
        title: "零知识证明验证",
        status: emergency.status === "approved" ? "completed" : "pending",
        description: "验证监护人身份和授权的零知识证明",
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="warning">等待中</Badge>;
      case "active":
        return <Badge variant="primary">进行中</Badge>;
      case "approved":
        return <Badge variant="success">已批准</Badge>;
      case "executed":
        return <Badge variant="success">已执行</Badge>;
      case "cancelled":
        return <Badge variant="gray">已取消</Badge>;
      case "expired":
        return <Badge variant="gray">已过期</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
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

  const getTimeRemaining = () => {
    if (!emergency.expiresAt) return null;

    const now = new Date();
    const expiry = new Date(emergency.expiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return "已过期";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}小时${minutes}分钟`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Emergency Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {emergency.title}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                紧急请求 ID: {emergency.id.slice(0, 8)}...
                {emergency.id.slice(-4)}
              </p>
            </div>
            <div className="text-right">
              {getStatusBadge(emergency.status)}
              {emergency.expiresAt && (
                <p className="text-sm text-gray-600 mt-1">
                  剩余时间: {getTimeRemaining()}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">类型</p>
              <p className="text-sm text-gray-900">{emergency.type}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">级别</p>
              <Badge
                variant={
                  emergency.level === "critical" ? "emergency" : "warning"
                }
              >
                {emergency.level}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">请求金额</p>
              <p className="text-sm text-gray-900">
                {emergency.requestedAmount
                  ? `${emergency.requestedAmount} ETH`
                  : "无"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Steps */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">验证流程</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-start space-x-4">
                {/* Step Icon */}
                <div className="flex-shrink-0">{getStepIcon(step.status)}</div>

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

      {/* Transaction Details */}
      {emergency.executionTx && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">交易详情</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">
                  交易哈希:
                </span>
                <a
                  href={`https://etherscan.io/tx/${emergency.executionTx}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 font-mono"
                >
                  {emergency.executionTx.slice(0, 10)}...
                  {emergency.executionTx.slice(-8)}
                </a>
              </div>
              {emergency.recipientAddress && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    接收地址:
                  </span>
                  <span className="text-sm text-gray-900 font-mono">
                    {emergency.recipientAddress.slice(0, 6)}...
                    {emergency.recipientAddress.slice(-4)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onRefresh}>
          刷新状态
        </Button>

        <div className="space-x-3">
          {emergency.status === "pending" && onCancel && (
            <Button variant="outline" onClick={onCancel}>
              取消请求
            </Button>
          )}

          {emergency.status === "executed" && (
            <Button
              onClick={() =>
                window.open(
                  `https://etherscan.io/tx/${emergency.executionTx}`,
                  "_blank"
                )
              }
            >
              查看交易
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
