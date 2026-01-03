/**
 * StatsCard Component - 统计卡片组件
 */

import React from "react";
import { Card, CardContent } from "../Common";
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
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon,
  color = "blue",
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    yellow: "bg-yellow-50 text-yellow-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <Card>
      <CardContent>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div
              className={clsx(
                "flex items-center justify-center w-8 h-8 rounded-md",
                colorClasses[color]
              )}
            >
              {icon}
            </div>
          </div>

          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {value}
                </div>
                {change && (
                  <div
                    className={clsx(
                      "ml-2 flex items-baseline text-sm font-semibold",
                      change.type === "increase"
                        ? "text-green-600"
                        : "text-red-600"
                    )}
                  >
                    {change.type === "increase" ? (
                      <svg
                        className="self-center flex-shrink-0 h-5 w-5 text-green-500"
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
                        className="self-center flex-shrink-0 h-5 w-5 text-red-500"
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
      </CardContent>
    </Card>
  );
};
