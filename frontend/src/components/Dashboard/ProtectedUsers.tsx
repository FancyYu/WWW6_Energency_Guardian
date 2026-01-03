/**
 * ProtectedUsers Component - 保护用户组件
 */

import React from "react";
import { Card, CardHeader, CardContent, Badge } from "../Common";

interface ProtectedUser {
  id: string;
  address: string;
  name: string;
  email?: string;
  relationship: string;
  isActive: boolean;
  lastActivity?: Date;
  totalEmergencies: number;
  protectedAmount: string; // ETH
  riskLevel: "low" | "medium" | "high";
}

const formatLastActivity = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
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
    return "刚刚活跃";
  }
};

const getRiskLevelBadge = (riskLevel: string) => {
  switch (riskLevel) {
    case "high":
      return <Badge variant="emergency">高风险</Badge>;
    case "medium":
      return <Badge variant="warning">中风险</Badge>;
    case "low":
      return <Badge variant="success">低风险</Badge>;
    default:
      return <Badge variant="gray">未知</Badge>;
  }
};

const getStatusBadge = (user: ProtectedUser) => {
  if (!user.isActive) {
    return <Badge variant="gray">离线</Badge>;
  }

  if (!user.lastActivity) {
    return <Badge variant="gray">未知</Badge>;
  }

  const lastActivityMinutes =
    (Date.now() - user.lastActivity.getTime()) / 60000;

  if (lastActivityMinutes < 60) {
    return <Badge variant="success">在线</Badge>;
  } else if (lastActivityMinutes < 24 * 60) {
    return <Badge variant="warning">最近活跃</Badge>;
  } else {
    return <Badge variant="gray">离线</Badge>;
  }
};

// Mock data for protected users
const mockProtectedUsers: ProtectedUser[] = [
  {
    id: "1",
    address: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
    name: "张三",
    email: "zhang@example.com",
    relationship: "家人",
    isActive: true,
    lastActivity: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    totalEmergencies: 3,
    protectedAmount: "45.7",
    riskLevel: "low",
  },
  {
    id: "2",
    address: "0x8ba1f109551bD432803012645Hac136c30c6C87",
    name: "李四",
    email: "li@example.com",
    relationship: "朋友",
    isActive: true,
    lastActivity: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    totalEmergencies: 1,
    protectedAmount: "28.3",
    riskLevel: "medium",
  },
  {
    id: "3",
    address: "0x9cd2f109551bD432803012645Hac136c30c7D98",
    name: "王五",
    relationship: "同事",
    isActive: false,
    lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    totalEmergencies: 7,
    protectedAmount: "82.6",
    riskLevel: "high",
  },
  {
    id: "4",
    address: "0x1234567890123456789012345678901234567890",
    name: "赵六",
    email: "zhao@example.com",
    relationship: "家人",
    isActive: true,
    lastActivity: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    totalEmergencies: 0,
    protectedAmount: "12.1",
    riskLevel: "low",
  },
  {
    id: "5",
    address: "0xabcdef1234567890abcdef1234567890abcdef12",
    name: "孙七",
    relationship: "朋友",
    isActive: true,
    lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    totalEmergencies: 2,
    protectedAmount: "67.4",
    riskLevel: "medium",
  },
];

export const ProtectedUsers: React.FC = () => {
  const protectedUsers = mockProtectedUsers;
  const activeUsers = protectedUsers.filter((u) => u.isActive);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">保护用户</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {activeUsers.length}/{protectedUsers.length} 在线
            </span>
            <a
              href="/protected-users"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              查看全部
            </a>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {protectedUsers.map((user) => (
            <div key={user.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                      </p>
                      {getRiskLevelBadge(user.riskLevel)}
                    </div>
                    <div className="flex items-center mt-1 space-x-2">
                      <p className="text-xs text-gray-500">
                        {user.relationship}
                      </p>
                      <span className="text-xs text-gray-300">•</span>
                      <p className="text-xs text-gray-500">
                        {user.totalEmergencies} 次紧急情况
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status badge */}
                <div className="flex flex-col items-end space-y-1">
                  {getStatusBadge(user)}
                </div>
              </div>

              {/* Additional info */}
              <div className="mt-3 ml-13">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>保护金额: {user.protectedAmount} ETH</span>
                  {user.lastActivity && (
                    <span>
                      最后活跃: {formatLastActivity(user.lastActivity)}
                    </span>
                  )}
                </div>
                <div className="mt-1 text-xs text-gray-400 font-mono">
                  {user.address.slice(0, 10)}...{user.address.slice(-8)}
                </div>
                {user.email && (
                  <div className="mt-1 text-xs text-gray-500">{user.email}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {protectedUsers.length === 0 && (
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              没有保护用户
            </h3>
            <p className="mt-1 text-sm text-gray-500">您还没有保护任何用户。</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
