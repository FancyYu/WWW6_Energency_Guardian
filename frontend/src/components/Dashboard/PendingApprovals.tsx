/**
 * PendingApprovals Component - 待审批请求组件
 */

import React, { useEffect } from "react";
import { Card, CardHeader, CardContent, Badge, Button } from "../Common";
import { useEmergencies, useAppStore } from "../../store";
import type { GuardianApproval } from "../../types";

const formatTimeAgo = (date: Date | string) => {
  // 确保 date 是 Date 对象
  const dateObj = date instanceof Date ? date : new Date(date);

  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();
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

export const PendingApprovals: React.FC = () => {
  const emergencies = useEmergencies();
  const { updateEmergency, addActivity, addNotification } = useAppStore();

  // 当前守护者ID（基于角色切换）
  const [currentGuardianId, setCurrentGuardianId] =
    React.useState("guardian-001");

  // 获取待审批的紧急情况
  const pendingApprovals = emergencies.filter(
    (emergency) =>
      emergency.status === "pending" || emergency.status === "active"
  );

  // 初始化一些示例数据（仅在没有数据时）
  useEffect(() => {
    if (emergencies.length === 0) {
      // 这里可以添加一些示例数据，但通常应该从API获取
    }
  }, [emergencies.length]);

  const handleApprove = (emergencyId: string) => {
    console.log(
      "Approving emergency:",
      emergencyId,
      "by guardian:",
      currentGuardianId
    );

    const emergency = emergencies.find((e) => e.id === emergencyId);
    if (!emergency) return;

    // 使用当前选择的守护者ID
    const updatedApprovals = emergency.approvals.map((approval) =>
      approval.guardianId === currentGuardianId
        ? { ...approval, status: "approved" as const, timestamp: new Date() }
        : approval
    );

    // 检查是否所有守护者都已批准
    const allApproved = updatedApprovals.every(
      (approval) => approval.status === "approved"
    );
    const newStatus = allApproved ? "executed" : "active";

    // 更新紧急情况
    updateEmergency(emergencyId, {
      approvals: updatedApprovals,
      status: newStatus,
      updatedAt: new Date(),
      ...(allApproved && {
        executionTx: `0x${Math.random().toString(16).slice(2, 66)}`,
      }),
    });

    // 获取当前守护者名称
    const currentGuardian = emergency.approvals.find(
      (a) => a.guardianId === currentGuardianId
    );
    const guardianName = currentGuardian?.guardianName || "守护者";

    // 添加活动日志
    addActivity({
      id: `activity-${Date.now()}`,
      type: "emergency_approved",
      description: `${guardianName}批准了紧急请求: ${emergency.title}`,
      timestamp: new Date(),
    });

    // 添加通知
    addNotification({
      id: `notification-${Date.now()}`,
      type: "emergency_approved",
      title: allApproved ? "紧急请求已执行" : "紧急请求已批准",
      message: allApproved
        ? `紧急请求"${emergency.title}"已获得所有守护者批准并执行`
        : `${guardianName}已批准紧急请求"${emergency.title}"`,
      isRead: false,
      createdAt: new Date(),
    });
  };

  const handleReject = (emergencyId: string) => {
    console.log(
      "Rejecting emergency:",
      emergencyId,
      "by guardian:",
      currentGuardianId
    );

    const emergency = emergencies.find((e) => e.id === emergencyId);
    if (!emergency) return;

    // 使用当前选择的监护人ID
    const updatedApprovals = emergency.approvals.map((approval) =>
      approval.guardianId === currentGuardianId
        ? { ...approval, status: "rejected" as const, timestamp: new Date() }
        : approval
    );

    // 更新紧急情况状态为已取消（因为被拒绝）
    updateEmergency(emergencyId, {
      approvals: updatedApprovals,
      status: "cancelled", // 使用正确的状态值
      updatedAt: new Date(),
    });

    // 获取当前守护者名称
    const currentGuardian = emergency.approvals.find(
      (a) => a.guardianId === currentGuardianId
    );
    const guardianName = currentGuardian?.guardianName || "守护者";

    // 添加活动日志
    addActivity({
      id: `activity-${Date.now()}`,
      type: "emergency_rejected",
      description: `${guardianName}拒绝了紧急请求: ${emergency.title}`,
      timestamp: new Date(),
    });

    // 添加通知
    addNotification({
      id: `notification-${Date.now()}`,
      type: "error", // 使用正确的通知类型
      title: "紧急请求已拒绝",
      message: `${guardianName}已拒绝紧急请求"${emergency.title}"`,
      isRead: false,
      createdAt: new Date(),
    });
  };

  const getCurrentGuardianApproval = (approvals: GuardianApproval[]) => {
    return approvals.find(
      (approval) => approval.guardianId === currentGuardianId
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">待审批请求</h3>
          <div className="flex items-center space-x-3">
            {/* 监护人选择器 */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">当前监护人:</span>
              <select
                value={currentGuardianId}
                onChange={(e) => setCurrentGuardianId(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="guardian-001">张医生</option>
                <option value="guardian-002">李律师</option>
                <option value="guardian-003">王财务</option>
              </select>
            </div>
            <Badge variant="emergency" size="sm">
              {pendingApprovals.length} 个待处理
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {pendingApprovals.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {pendingApprovals.map((emergency) => {
              const currentApproval = getCurrentGuardianApproval(
                emergency.approvals
              );
              const canApprove =
                currentApproval && currentApproval.status === "pending";

              return (
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
                        {emergency.expiresAt && (
                          <>
                            <span>•</span>
                            <span>
                              过期时间: {formatTimeAgo(emergency.expiresAt)}
                            </span>
                          </>
                        )}
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
                      {canApprove ? (
                        <>
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
                        </>
                      ) : (
                        <Badge
                          variant={
                            currentApproval?.status === "approved"
                              ? "success"
                              : currentApproval?.status === "rejected"
                              ? "emergency"
                              : "gray"
                          }
                        >
                          {currentApproval?.status === "approved"
                            ? "已批准"
                            : currentApproval?.status === "rejected"
                            ? "已拒绝"
                            : "无权限"}
                        </Badge>
                      )}
                      <Button variant="outline" size="sm">
                        详情
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
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
