/**
 * StatsCard Component - 统计卡片组件
 * 使用玻璃拟态效果和微交互动画的现代化统计卡片
 */

import React from "react";
import { GlassCard } from "../Glass";
import { usePulseAnimation } from "../../animations/hooks";
import { clsx } from "clsx";

export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease";
  };
  icon: React.ReactNode;
  color?: "blue" | "green" | "red" | "yellow" | "purple";
  animationDelay?: number;
  enablePulse?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon,
  color = "blue",
  animationDelay = 0,
  enablePulse = false,
}) => {
  const colorClasses = {
    blue: "bg-primary-500/10 text-primary-400 shadow-glow-blue/50",
    green: "bg-success-500/10 text-success-400 shadow-glow-green/50",
    red: "bg-emergency-500/10 text-emergency-400 shadow-glow-red/50",
    yellow: "bg-warning-500/10 text-warning-400 shadow-glow-yellow/50",
    purple: "bg-purple-500/10 text-purple-400 shadow-glow-purple/50",
  };

  const glowColors = {
    blue: "blue" as const,
    green: "green" as const,
    red: "red" as const,
    yellow: "yellow" as const,
    purple: "purple" as const,
  };

  const pulseColors = {
    blue: "rgba(59, 130, 246, 0.3)",
    green: "rgba(34, 197, 94, 0.3)",
    red: "rgba(239, 68, 68, 0.3)",
    yellow: "rgba(245, 158, 11, 0.3)",
    purple: "rgba(147, 51, 234, 0.3)",
  };

  // 脉冲动画（用于重要数据变化时）
  const pulseRef = usePulseAnimation(enablePulse, {
    color: pulseColors[color],
    duration: 2000,
    intensity: 1.02,
  });

  return (
    <GlassCard
      ref={pulseRef}
      variant="medium"
      glow={glowColors[color]}
      hoverable
      animateOnMount
      animationDelay={animationDelay}
      animationIntensity="medium"
      className="transition-all duration-300 hover:shadow-lg"
    >
      <GlassCard.Body className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div
              className={clsx(
                "flex items-center justify-center w-12 h-12 rounded-xl backdrop-blur-sm border border-white/20",
                colorClasses[color]
              )}
            >
              {icon}
            </div>
          </div>

          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-300 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline mt-1">
                <div className="text-2xl font-bold text-white">{value}</div>
                {change && (
                  <div
                    className={clsx(
                      "ml-2 flex items-baseline text-sm font-semibold",
                      change.type === "increase"
                        ? "text-success-400"
                        : "text-emergency-400"
                    )}
                  >
                    {change.type === "increase" ? (
                      <svg
                        className="self-center flex-shrink-0 h-4 w-4 text-success-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="self-center flex-shrink-0 h-4 w-4 text-emergency-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    <span className="sr-only">
                      {change.type === "increase" ? "Increased" : "Decreased"}{" "}
                      by
                    </span>
                    {Math.abs(change.value)}%
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </GlassCard.Body>
    </GlassCard>
  );
};
