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
import type { Emergency, EmergencyType, EmergencyLevel } from "../../types";

type ViewMode = "trigger" | "monitor" | "verification";

interface EmergencyRequest {
  type: EmergencyType;
  level: EmergencyLevel;
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
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create new emergency
      const newEmergency: Emergency = {
        id: `emergency-${Date.now()}`,
        userId: "user-001",
        type: request.type,
        level: request.level,
        status: "pending",
        title: request.title,
        description: request.description,
        requestedAmount: request.requestedAmount,
        recipientAddress: request.recipientAddress,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        approvals: [
          {
            guardianId: "guardian-001",
            guardianAddress: "0x123...",
            guardianName: "张医生",
            status: "pending",
          },
          {
            guardianId: "guardian-002",
            guardianAddress: "0x456...",
            guardianName: "李护士",
            status: "pending",
          },
        ],
      };

      addEmergency(newEmergency);

      // Add activity log
      addActivity({
        id: `activity-${Date.now()}`,
        type: "emergency_created",
        description: `创建紧急请求: ${request.title}`,
        timestamp: new Date(),
      });

      // Add notification
      addNotification({
        id: `notification-${Date.now()}`,
        type: "emergency_created",
        title: "紧急请求已创建",
        message: `您的紧急请求"${request.title}"已提交，正在通知监护人。`,
        isRead: false,
        createdAt: new Date(),
      });

      // Switch to verification view
      setSelectedEmergency(newEmergency);
      setViewMode("verification");
    } catch (error) {
      console.error("Failed to create emergency:", error);
      // Handle error (show toast, etc.)
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
