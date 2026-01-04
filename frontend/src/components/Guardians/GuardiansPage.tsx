/**
 * GuardiansPage Component - 守护者管理页面
 */

import React from "react";
import { GlassCard } from "../Glass";

export const GuardiansPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">守护者管理</h2>
        <p className="mt-1 text-sm text-gray-600">
          管理您的守护者列表和权限设置。
        </p>
      </div>

      <GlassCard variant="medium" glow="none" className="shadow-medium">
        <GlassCard.Header>
          <h3 className="text-lg font-medium text-white">守护者列表</h3>
        </GlassCard.Header>
        <GlassCard.Body>
          <div className="text-center py-8">
            <p className="text-gray-300">守护者管理功能正在开发中...</p>
          </div>
        </GlassCard.Body>
      </GlassCard>
    </div>
  );
};
