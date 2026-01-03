/**
 * ActivitiesPage Component - 活动记录页面
 */

import React from "react";
import { GlassCard } from "../Glass";

export const ActivitiesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">活动记录</h2>
        <p className="mt-1 text-sm text-gray-600">查看详细的活动记录和统计。</p>
      </div>

      <GlassCard variant="medium" glow="none" className="shadow-medium">
        <GlassCard.Header>
          <h3 className="text-lg font-medium text-white">最近活动</h3>
        </GlassCard.Header>
        <GlassCard.Body>
          <div className="text-center py-8">
            <p className="text-gray-300">活动记录功能正在开发中...</p>
          </div>
        </GlassCard.Body>
      </GlassCard>
    </div>
  );
};
