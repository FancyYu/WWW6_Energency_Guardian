/**
 * RecentActivity Component - 最近活动组件
 */

import React from "react";
import { Card, CardHeader, CardContent, Badge } from "../Common";
import { useActivities } from "../../store";

const ActivityIcon: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case "emergency_created":
      return (
        <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
          <svg
            className="w-4 h-4 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
      );
    case "guardian_added":
      return (
        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
          <svg
            className="w-4 h-4 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
        </div>
      );
    case "emergency_approved":
      return (
        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
          <svg
            className="w-4 h-4 text-blue-600"
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
      );
    case "emergency_executed":
      return (
        <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
          <svg
            className="w-4 h-4 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
      );
    default:
      return (
        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
          <svg
            className="w-4 h-4 text-gray-600"
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
      );
  }
};

const getActivityBadgeVariant = (type: string) => {
  switch (type) {
    case "emergency_created":
      return "emergency";
    case "guardian_added":
      return "success";
    case "emergency_approved":
      return "primary";
    case "emergency_executed":
      return "success";
    default:
      return "gray";
  }
};

const formatRelativeTime = (date: Date | string) => {
  // 确保 date 是 Date 对象
  const dateObj = date instanceof Date ? date : new Date(date);

  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}天前`;
  } else if (hours > 0) {
    return `${hours}小时前`;
  } else if (minutes > 0) {
    return `${minutes}分钟前`;
  } else {
    return "刚刚";
  }
};

export const RecentActivity: React.FC = () => {
  const activities = useActivities();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">最近活动</h3>
          <a
            href="/activities"
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            查看全部
          </a>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {activities.length > 0 ? (
          <div className="flow-root">
            <ul className="divide-y divide-gray-200">
              {activities.slice(0, 5).map((activity) => (
                <li key={activity.id} className="px-6 py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <ActivityIcon type={activity.type} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        {activity.description}
                      </p>
                      <div className="flex items-center mt-1 space-x-2">
                        <p className="text-xs text-gray-500">
                          {formatRelativeTime(activity.timestamp)}
                        </p>
                        {activity.txHash && (
                          <>
                            <span className="text-xs text-gray-300">•</span>
                            <a
                              href={`https://etherscan.io/tx/${activity.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary-600 hover:text-primary-500"
                            >
                              查看交易
                            </a>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <Badge
                        variant={getActivityBadgeVariant(activity.type)}
                        size="sm"
                      >
                        {activity.type === "emergency_created" && "紧急"}
                        {activity.type === "guardian_added" && "监护人"}
                        {activity.type === "emergency_approved" && "批准"}
                        {activity.type === "emergency_executed" && "执行"}
                      </Badge>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="px-6 py-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              暂无活动记录
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              当您开始使用系统时，活动记录将显示在这里。
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
