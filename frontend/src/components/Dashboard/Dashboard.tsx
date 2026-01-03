/**
 * Dashboard Component - 主仪表板组件
 */

import React, { useEffect } from "react";
import { StatsCard } from "./StatsCard";
import { RecentActivity } from "./RecentActivity";
import { GuardianStatus } from "./GuardianStatus";
import { GlassCard, GlassButton } from "../Glass";
import { useStats, useAppStore } from "../../store";
import { useRouter } from "../../hooks/useRouter";
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
  const { navigate } = useRouter();

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
          animationDelay={0}
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
          animationDelay={150}
        />

        <StatsCard
          title="总保护金额"
          value={`${displayStats.totalAmount} ETH`}
          icon={<CurrencyIcon />}
          color="purple"
          animationDelay={300}
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
          animationDelay={450}
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
      <GlassCard variant="medium" glow="none" className="shadow-medium">
        <GlassCard.Header>
          <h3 className="text-lg font-medium text-white">快速操作</h3>
        </GlassCard.Header>
        <GlassCard.Body>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <GlassButton
              variant="emergency"
              size="lg"
              glow
              onClick={() => navigate("emergency")}
              className="h-auto p-6 flex-col items-start text-left"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emergency-500/20 text-emergency-400 mb-4">
                <ShieldIcon />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">
                  紧急求助
                </h3>
                <p className="text-sm text-gray-300">
                  立即创建紧急情况并通知监护人
                </p>
              </div>
            </GlassButton>

            <GlassButton
              variant="primary"
              size="lg"
              glow
              onClick={() => navigate("guardians")}
              className="h-auto p-6 flex-col items-start text-left"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-500/20 text-primary-400 mb-4">
                <UsersIcon />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">
                  添加监护人
                </h3>
                <p className="text-sm text-gray-300">
                  邀请新的监护人保护您的资产
                </p>
              </div>
            </GlassButton>

            <GlassButton
              variant="success"
              size="lg"
              glow
              onClick={() => navigate("settings")}
              className="h-auto p-6 flex-col items-start text-left"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-success-500/20 text-success-400 mb-4">
                <svg
                  className="w-6 h-6"
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
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">
                  安全设置
                </h3>
                <p className="text-sm text-gray-300">配置时间锁和安全参数</p>
              </div>
            </GlassButton>

            <GlassButton
              variant="secondary"
              size="lg"
              glow
              onClick={() => navigate("activities")}
              className="h-auto p-6 flex-col items-start text-left"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 mb-4">
                <svg
                  className="w-6 h-6"
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
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">
                  查看报告
                </h3>
                <p className="text-sm text-gray-300">
                  查看详细的活动记录和统计
                </p>
              </div>
            </GlassButton>
          </div>
        </GlassCard.Body>
      </GlassCard>
    </div>
  );
};
