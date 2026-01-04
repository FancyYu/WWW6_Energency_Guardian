/**
 * EmergencyPage Component - 紧急操作主页面
 */

import React, { useState, useEffect } from "react";
import { EmergencyTrigger } from "./EmergencyTrigger";
import { VerificationFlow } from "./VerificationFlow";
import { OperationMonitor } from "./OperationMonitor";
import { Button } from "../Common/Button";
import { Badge } from "../Common/Badge";
import { useEmergencies, useAppStore } from "../../store";
import { useRouter } from "../../context/RouterContext";
import type {
  Emergency,
  EmergencyType,
  EmergencyLevel as EmergencyLevelType,
} from "../../types";

type ViewMode = "trigger" | "monitor" | "verification";

interface EmergencyRequest {
  type: EmergencyType;
  level: EmergencyLevelType;
  title: string;
  description: string;
  requestedAmount?: string;
  recipientAddress?: string;
  attachments?: File[];
}

export const EmergencyPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("monitor");
  const [selectedEmergency, setSelectedEmergency] = useState<Emergency | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emergencies = useEmergencies();
  const { addEmergency, addActivity, addNotification } = useAppStore();
  const { navigate } = useRouter();

  // Mock data for demonstration
  useEffect(() => {
    if (emergencies.length === 0) {
      // Add some mock emergencies for demonstration
      const mockEmergencies: Emergency[] = [
        {
          id: "emergency-001",
          userId: "user-001",
          type: "medical",
          level: "high",
          status: "active",
          title: "紧急医疗费用",
          description: "需要紧急支付手术费用",
          requestedAmount: "5.0",
          recipientAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          updatedAt: new Date(),
          approvals: [
            {
              guardianId: "guardian-001",
              guardianAddress: "0x123...",
              guardianName: "张医生",
              status: "approved",
              timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
            },
            {
              guardianId: "guardian-002",
              guardianAddress: "0x456...",
              guardianName: "李护士",
              status: "pending",
            },
          ],
        },
        {
          id: "emergency-002",
          userId: "user-001",
          type: "financial",
          level: "medium",
          status: "executed",
          title: "紧急生活费",
          description: "临时生活费支持",
          requestedAmount: "2.0",
          recipientAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
          executionTx:
            "0xabcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd1234",
          approvals: [
            {
              guardianId: "guardian-001",
              guardianAddress: "0x123...",
              guardianName: "张医生",
              status: "approved",
              timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000),
            },
            {
              guardianId: "guardian-002",
              guardianAddress: "0x456...",
              guardianName: "李护士",
              status: "approved",
              timestamp: new Date(Date.now() - 21 * 60 * 60 * 1000),
            },
          ],
        },
      ];

      mockEmergencies.forEach((emergency) => addEmergency(emergency));
    }
  }, [emergencies.length, addEmergency]);

  const handleTriggerEmergency = async (request: EmergencyRequest) => {
    setIsSubmitting(true);

    try {
      // 为演示目的，跳过钱包连接检查，直接创建本地记录
      console.log("Creating emergency request for demo:", request);

      // 创建本地紧急情况记录（演示模式）
      const newEmergency: Emergency = {
        id: `emergency-${Date.now()}`,
        userId: "demo-user-001",
        type: request.type,
        level: request.level,
        status: "pending",
        title: request.title,
        description: request.description,
        requestedAmount: request.requestedAmount,
        recipientAddress:
          request.recipientAddress ||
          "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        transactionHash: `0x${Math.random().toString(16).slice(2, 66)}`, // 模拟交易哈希
        approvals: [
          {
            guardianId: "guardian-001",
            guardianAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            guardianName: "张医生",
            status: "pending",
          },
          {
            guardianId: "guardian-002",
            guardianAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
            guardianName: "李律师",
            status: "pending",
          },
          {
            guardianId: "guardian-003",
            guardianAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
            guardianName: "王财务",
            status: "pending",
          },
        ],
      };

      addEmergency(newEmergency);

      // 添加活动日志
      addActivity({
        id: `activity-${Date.now()}`,
        type: "emergency_created",
        description: `创建紧急请求: ${request.title}`,
        timestamp: new Date(),
      });

      // 添加通知
      addNotification({
        id: `notification-${Date.now()}`,
        type: "emergency_created",
        title: "紧急请求已创建",
        message: `您的紧急请求"${request.title}"已成功创建，等待监护人审批`,
        isRead: false,
        createdAt: new Date(),
      });

      // 切换到验证视图
      setSelectedEmergency(newEmergency);
      setViewMode("verification");
    } catch (error) {
      console.error("Failed to create emergency:", error);

      // 显示错误通知
      addNotification({
        id: `notification-${Date.now()}`,
        type: "error",
        title: "创建失败",
        message: `创建紧急请求失败: ${
          error instanceof Error ? error.message : "未知错误"
        }`,
        isRead: false,
        createdAt: new Date(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (emergency: Emergency) => {
    setSelectedEmergency(emergency);
    setViewMode("verification");
  };

  const handleRefresh = () => {
    // In a real app, this would fetch latest data from API
    console.log("Refreshing emergency data...");
  };

  const handleCancelEmergency = () => {
    if (selectedEmergency) {
      // Update emergency status to cancelled
      // In a real app, this would be an API call
      console.log("Cancelling emergency:", selectedEmergency.id);
      setViewMode("monitor");
      setSelectedEmergency(null);
    }
  };

  const getActiveEmergencies = () => {
    return emergencies.filter(
      (e) => e.status === "active" || e.status === "pending"
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {/* 返回主页按钮 */}
              <button
                onClick={() => navigate("dashboard")}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span className="text-sm font-medium">返回主页</span>
              </button>

              <div className="h-6 w-px bg-gray-300"></div>

              <h1 className="text-xl font-semibold text-gray-900">
                紧急操作中心
              </h1>
              {getActiveEmergencies().length > 0 && (
                <Badge variant="emergency">
                  {getActiveEmergencies().length} 个活跃请求
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant={viewMode === "monitor" ? "primary" : "outline"}
                onClick={() => {
                  setViewMode("monitor");
                  setSelectedEmergency(null);
                }}
              >
                监控面板
              </Button>
              <Button
                variant={viewMode === "trigger" ? "primary" : "outline"}
                onClick={() => setViewMode("trigger")}
              >
                创建请求
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === "trigger" && (
          <EmergencyTrigger
            onTrigger={handleTriggerEmergency}
            isLoading={isSubmitting}
          />
        )}

        {viewMode === "monitor" && (
          <OperationMonitor
            emergencies={emergencies}
            onViewDetails={handleViewDetails}
            onRefresh={handleRefresh}
          />
        )}

        {viewMode === "verification" && selectedEmergency && (
          <VerificationFlow
            emergency={selectedEmergency}
            onCancel={handleCancelEmergency}
            onRefresh={handleRefresh}
          />
        )}
      </div>

      {/* Emergency Quick Action Button */}
      {viewMode !== "trigger" && (
        <div className="fixed bottom-6 right-6">
          <Button
            variant="emergency"
            size="lg"
            onClick={() => setViewMode("trigger")}
            className="shadow-lg hover:shadow-xl transition-shadow"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            紧急求助
          </Button>
        </div>
      )}
    </div>
  );
};
