/**
 * OperationMonitor Component - 操作监控
 */

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "../Common/Card";
import { Badge } from "../Common/Badge";
import { Button } from "../Common/Button";
import type { Emergency } from "../../types";

interface OperationMonitorProps {
  emergencies: Emergency[];
  onViewDetails: (emergency: Emergency) => void;
  onRefresh: () => void;
}

interface MonitorStats {
  total: number;
  pending: number;
  active: number;
  completed: number;
  failed: number;
}

interface SystemHealth {
  status: "healthy" | "warning" | "critical";
  uptime: string;
  responseTime: number;
  lastUpdate: Date;
}

export const OperationMonitor: React.FC<OperationMonitorProps> = ({
  emergencies,
  onViewDetails,
  onRefresh,
}) => {
  const [stats, setStats] = useState<MonitorStats>({
    total: 0,
    pending: 0,
    active: 0,
    completed: 0,
    failed: 0,
  });

  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: "healthy",
    uptime: "99.9%",
    responseTime: 1.2,
    lastUpdate: new Date(),
  });

  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    // Calculate stats from emergencies
    const newStats: MonitorStats = {
      total: emergencies.length,
      pending: emergencies.filter((e) => e.status === "pending").length,
      active: emergencies.filter((e) => e.status === "active").length,
      completed: emergencies.filter((e) => e.status === "executed").length,
      failed: emergencies.filter(
        (e) => e.status === "cancelled" || e.status === "expired"
      ).length,
    };
    setStats(newStats);
  }, [emergencies]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (autoRefresh) {
      interval = setInterval(() => {
        onRefresh();
        setSystemHealth((prev) => ({
          ...prev,
          lastUpdate: new Date(),
          responseTime: Math.random() * 2 + 0.5, // Simulate response time
        }));
      }, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, onRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "active":
        return "primary";
      case "executed":
        return "success";
      case "cancelled":
      case "expired":
        return "gray";
      default:
        return "gray";
    }
  };

  const getHealthColor = (status: SystemHealth["status"]) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      case "critical":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}天前`;
    if (hours > 0) return `${hours}小时前`;
    if (minutes > 0) return `${minutes}分钟前`;
    return "刚刚";
  };

  return (
    <div className="space-y-6">
      {/* System Health */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">系统状态</h3>
            <div className="flex items-center space-x-2">
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(
                  systemHealth.status
                )}`}
              >
                {systemHealth.status === "healthy"
                  ? "正常"
                  : systemHealth.status === "warning"
                  ? "警告"
                  : "异常"}
              </div>
              <Button variant="outline" size="sm" onClick={onRefresh}>
                刷新
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {systemHealth.uptime}
              </p>
              <p className="text-sm text-gray-600">系统可用性</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {systemHealth.responseTime.toFixed(1)}s
              </p>
              <p className="text-sm text-gray-600">平均响应时间</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {stats.active}
              </p>
              <p className="text-sm text-gray-600">活跃操作</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">最后更新</p>
              <p className="text-sm font-medium">
                {formatTime(systemHealth.lastUpdate)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">操作统计</h3>
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>自动刷新</span>
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">总操作数</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </p>
              <p className="text-sm text-gray-600">等待中</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
              <p className="text-sm text-gray-600">进行中</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {stats.completed}
              </p>
              <p className="text-sm text-gray-600">已完成</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              <p className="text-sm text-gray-600">失败/取消</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Operations */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">最近操作</h3>
        </CardHeader>
        <CardContent>
          {emergencies.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="text-gray-600">暂无紧急操作记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {emergencies.slice(0, 10).map((emergency) => (
                <div
                  key={emergency.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          emergency.status === "executed"
                            ? "bg-green-500"
                            : emergency.status === "active"
                            ? "bg-blue-500 animate-pulse"
                            : emergency.status === "pending"
                            ? "bg-yellow-500"
                            : "bg-gray-400"
                        }`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {emergency.title}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge
                          variant={getStatusColor(emergency.status) as any}
                        >
                          {emergency.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {emergency.type} • {getTimeAgo(emergency.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {emergency.requestedAmount && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {emergency.requestedAmount} ETH
                        </p>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(emergency)}
                    >
                      查看
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real-time Alerts */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">实时警报</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.active > 0 && (
              <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800">
                    有 {stats.active} 个紧急操作正在进行中
                  </p>
                  <p className="text-sm text-blue-600">
                    请密切关注操作进度和监护人响应
                  </p>
                </div>
              </div>
            )}

            {stats.pending > 3 && (
              <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-800">
                    等待审批的请求较多 ({stats.pending} 个)
                  </p>
                  <p className="text-sm text-yellow-600">
                    建议联系监护人加快审批流程
                  </p>
                </div>
              </div>
            )}

            {systemHealth.responseTime > 3 && (
              <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">
                    系统响应时间较慢 ({systemHealth.responseTime.toFixed(1)}s)
                  </p>
                  <p className="text-sm text-red-600">
                    网络可能存在拥堵，请耐心等待
                  </p>
                </div>
              </div>
            )}

            {stats.active === 0 && stats.pending === 0 && (
              <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-green-600"
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
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    系统运行正常
                  </p>
                  <p className="text-sm text-green-600">
                    所有操作已完成，无待处理事项
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
