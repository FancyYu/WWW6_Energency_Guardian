/**
 * PendingApprovals Component - 待审批请求组件
 */

import React from "react";
import { Card, CardHeader, CardContent, Badge, Button } from "../Common";
import type { Emergency } from "../../types";

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}天前`;
  } else if (hours > 0) {
    return `${hours}小时前`;
  } else if (minutes > 0) {
    return `${minutes}分钟前`;
  } else {
    return "刚刚";
  }
};

const getEmergencyTypeLabel = (type: string) => {
  const labels = {
    medical: "医疗紧急",
    financial: "财务紧急",
    security: "安全紧急",
    legal: "法律紧急",
    family: "家庭紧急",
    other: "其他紧急",
  };
  return labels[type as keyof typeof labels] || "未知类型";
};

const getEmergencyLevelBadge = (level: string) => {
  switch (level) {
    case "critical":
      return <Badge variant="emergency">紧急</Badge>;
    case "high":
      return <Badge variant="warning">高</Badge>;
    case "medium":
      return <Badge variant="primary">中</Badge>;
    case "low":
      return <Badge variant="gray">低</Badge>;
    default:
      return <Badge variant="gray">未知</Badge>;
  }
};

// Mock data for pending approvals
const mockPendingApprovals: Emergency[] = [
  {
    id: "1",
    userId: "user1",
    type: "medical",
    level: "critical",
    status: "pending",
    title: "紧急医疗费用",
    description: "需要立即支付手术费用，情况紧急",
    requestedAmount: "15.5",
    recipientAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    updatedAt: new Date(Date.now() - 30 * 60 * 1000),
    expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
    approvals: [
      {
        guardianId: "guardian1",
        guardianAddress: "0x8ba1f109551bD432803012645Hac136c30c6C87",
        guardianName: "Alice Johnson",
        status: "pending",
      },
      {
        guardianId: "guardian2",
        guardianAddress: "0x9cd2f109551bD432803012645Hac136c30c7D98",
        guardianName: "Bob Smith",
        status: "pending",
      },
    ],
  },
  {
    id: "2",
    userId: "user2",
    type: "financial",
    level: "high",
    status: "pending",
    title: "紧急资金转移",
    description: "需要转移资金到安全地址",
    requestedAmount: "8.2",
    recipientAddress: "0x1234567890123456789012345678901234567890",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
    approvals: [
      {
        guardianId: "guardian1",
        guardianAddress: "0x8ba1f109551bD432803012645Hac136c30c6C87",
        guardianName: "Alice Johnson",
        status: "approved",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
      {
        guardianId: "guardian2",
        guardianAddress: "0x9cd2f109551bD432803012645Hac136c30c7D98",
        guardianName: "Bob Smith",
        status: "pending",
      },
    ],
  },
];

export const PendingApprovals: React.FC = () => {
  const pendingApprovals = mockPendingApprovals;

  const handleApprove = (emergencyId: string) => {
    console.log("Approving emergency:", emergencyId);
    // In a real app, this would call the smart contract
  };

  const handleReject = (emergencyId: string) => {
    console.log("Rejecting emergency:", emergencyId);
    // In a real app, this would call the smart contract
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">待审批请求</h3>
          <Badge variant="emergency" size="sm">
            {pendingApprovals.length} 个待处理
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {pendingApprovals.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {pendingApprovals.map((emergency) => (
              <div key={emergency.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {emergency.title}
                      </h4>
                      {getEmergencyLevelBadge(emergency.level)}
                      <Badge variant="gray" size="sm">
                        {getEmergencyTypeLabel(emergency.type)}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                      {emergency.description}
                    </p>

                    <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                      <span>请求金额: {emergency.requestedAmount} ETH</span>
                      <span>•</span>
                      <span>
                        创建时间: {formatTimeAgo(emergency.createdAt)}
                      </span>
                      <span>•</span>
                      <span>
                        过期时间:{" "}
                        {emergency.expiresAt
                          ? formatTimeAgo(emergency.expiresAt)
                          : "无限制"}
                      </span>
                    </div>

                    {/* Approval status */}
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-2">
                        审批状态 (
                        {
                          emergency.approvals.filter(
                            (a) => a.status === "approved"
                          ).length
                        }
                        /{emergency.approvals.length}):
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {emergency.approvals.map((approval) => (
                          <div
                            key={approval.guardianId}
                            className="flex items-center space-x-1"
                          >
                            <span className="text-xs text-gray-600">
                              {approval.guardianName}:
                            </span>
                            <Badge
                              variant={
                                approval.status === "approved"
                                  ? "success"
                                  : approval.status === "rejected"
                                  ? "emergency"
                                  : "gray"
                              }
                              size="sm"
                            >
                              {approval.status === "approved"
                                ? "已批准"
                                : approval.status === "rejected"
                                ? "已拒绝"
                                : "待处理"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recipient address */}
                    <div className="text-xs text-gray-500 font-mono">
                      接收地址: {emergency.recipientAddress?.slice(0, 10)}...
                      {emergency.recipientAddress?.slice(-8)}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleApprove(emergency.id)}
                    >
                      批准
                    </Button>
                    <Button
                      variant="emergency"
                      size="sm"
                      onClick={() => handleReject(emergency.id)}
                    >
                      拒绝
                    </Button>
                    <Button variant="outline" size="sm">
                      详情
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              没有待审批请求
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              当前没有需要您审批的紧急请求。
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
