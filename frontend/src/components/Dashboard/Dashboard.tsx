/**
 * Dashboard Component - 主仪表板组件
 */

import React, { useEffect } from "react";
import { StatsCard } from "./StatsCard";
import { RecentActivity } from "./RecentActivity";
import { GuardianStatus } from "./GuardianStatus";
import { useStats, useAppStore } from "../../store";
import type { DashboardStats } from "../../types";

// Icons
const ShieldIcon = () => (
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
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

const UsersIcon = () => (
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
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
    />
  </svg>
);

const CurrencyIcon = () => (
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
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const ClockIcon = () => (
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
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

// Mock stats data
const mockStats: DashboardStats = {
  totalEmergencies: 12,
  activeEmergencies: 2,
  totalGuardians: 3,
  activeGuardians: 2,
  totalAmount: "45.7",
  averageResponseTime: 18,
};

export const Dashboard: React.FC = () => {
  const stats = useStats();
  const { setStats } = useAppStore();

  // Load stats on component mount
  useEffect(() => {
    // In a real app, this would be an API call
    setStats(mockStats);
  }, [setStats]);

  const displayStats = stats || mockStats;

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">欢迎回来</h2>
        <p className="mt-1 text-sm text-gray-600">这是您的紧急守护系统概览。</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="总紧急情况"
          value={displayStats.totalEmergencies}
          icon={<ShieldIcon />}
          color="blue"
          change={{
            value: 12,
            type: "increase",
          }}
        />

        <StatsCard
          title="活跃监护人"
          value={`${displayStats.activeGuardians}/${displayStats.totalGuardians}`}
          icon={<UsersIcon />}
          color="green"
        />

        <StatsCard
          title="总保护金额"
          value={`${displayStats.totalAmount} ETH`}
          icon={<CurrencyIcon />}
          color="purple"
          change={{
            value: 8,
            type: "increase",
          }}
        />

        <StatsCard
          title="平均响应时间"
          value={`${displayStats.averageResponseTime}分钟`}
          icon={<ClockIcon />}
          color="yellow"
          change={{
            value: 5,
            type: "decrease",
          }}
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column - Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>

        {/* Right column - Guardian Status */}
        <div className="lg:col-span-1">
          <GuardianStatus />
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">快速操作</h3>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href="/emergencies/new"
              className="relative group bg-red-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-red-500 rounded-lg hover:bg-red-100 transition-colors"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-red-100 text-red-600 group-hover:bg-red-200">
                  <ShieldIcon />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">
                  <span className="absolute inset-0" aria-hidden="true" />
                  紧急求助
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  立即创建紧急情况并通知监护人
                </p>
              </div>
            </a>

            <a
              href="/guardians/add"
              className="relative group bg-blue-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-blue-100 text-blue-600 group-hover:bg-blue-200">
                  <UsersIcon />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">
                  <span className="absolute inset-0" aria-hidden="true" />
                  添加监护人
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  邀请新的监护人保护您的资产
                </p>
              </div>
            </a>

            <a
              href="/settings"
              className="relative group bg-green-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-500 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-100 text-green-600 group-hover:bg-green-200">
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
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">
                  <span className="absolute inset-0" aria-hidden="true" />
                  安全设置
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  配置时间锁和安全参数
                </p>
              </div>
            </a>

            <a
              href="/activities"
              className="relative group bg-purple-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-purple-500 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-purple-100 text-purple-600 group-hover:bg-purple-200">
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">
                  <span className="absolute inset-0" aria-hidden="true" />
                  查看报告
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  查看详细的活动记录和统计
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
