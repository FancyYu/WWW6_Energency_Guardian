/**
 * SettingsPage Component - 设置页面
 */

import React from "react";
import { GlassCard } from "../Glass";

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">安全设置</h2>
        <p className="mt-1 text-sm text-gray-600">配置时间锁和安全参数。</p>
      </div>

      <GlassCard variant="medium" glow="none" className="shadow-medium">
        <GlassCard.Header>
          <h3 className="text-lg font-medium text-white">时间锁配置</h3>
        </GlassCard.Header>
        <GlassCard.Body>
          <div className="text-center py-8">
            <p className="text-gray-300">安全设置功能正在开发中...</p>
          </div>
        </GlassCard.Body>
      </GlassCard>
    </div>
  );
};
