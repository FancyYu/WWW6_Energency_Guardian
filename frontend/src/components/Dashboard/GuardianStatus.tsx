/**
 * GuardianStatus Component - 守护者状态组件
 */

import React from "react";
import { Card, CardHeader, CardContent, Badge } from "../Common";
import type { Guardian } from "../../types";

// Mock data for demonstration
const mockGuardians: Guardian[] = [
  {
    id: "1",
    address: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
    name: "Alice Johnson",
    email: "alice@example.com",
    phone: "+1-555-0123",
    relationship: "配偶",
    priority: 1,
    isActive: true,
    lastSeen: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    responseTime: 15, // 15 minutes average
  },
  {
    id: "2",
    address: "0x8ba1f109551bD432803012645Hac136c30c6C87",
    name: "Bob Smith",
    email: "bob@example.com",
    phone: "+1-555-0456",
    relationship: "兄弟",
    priority: 2,
    isActive: true,
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    responseTime: 25, // 25 minutes average
  },
  {
    id: "3",
    address: "0x9cd2f109551bD432803012645Hac136c30c7D98",
    name: "Carol Davis",
    email: "carol@example.com",
    relationship: "朋友",
    priority: 3,
    isActive: false,
    lastSeen: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    responseTime: 45, // 45 minutes average
  },
];

const formatLastSeen = (date: Date) => {
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
    return "在线";
  }
};

const getStatusBadge = (guardian: Guardian) => {
  if (!guardian.isActive) {
    return (
      <Badge variant="gray" size="sm">
        离线
      </Badge>
    );
  }

  const lastSeenMinutes = (Date.now() - guardian.lastSeen!.getTime()) / 60000;

  if (lastSeenMinutes < 60) {
    return (
      <Badge variant="success" size="sm">
        在线
      </Badge>
    );
  } else if (lastSeenMinutes < 24 * 60) {
    return (
      <Badge variant="warning" size="sm">
        最近活跃
      </Badge>
    );
  } else {
    return (
      <Badge variant="gray" size="sm">
        离线
      </Badge>
    );
  }
};

const getResponseTimeBadge = (responseTime: number) => {
  if (responseTime <= 15) {
    return (
      <Badge variant="success" size="sm">
        快速
      </Badge>
    );
  } else if (responseTime <= 30) {
    return (
      <Badge variant="warning" size="sm">
        正常
      </Badge>
    );
  } else {
    return (
      <Badge variant="emergency" size="sm">
        较慢
      </Badge>
    );
  }
};

export const GuardianStatus: React.FC = () => {
  const guardians = mockGuardians;
  const activeGuardians = guardians.filter((g) => g.isActive);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">守护者状态</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {activeGuardians.length}/{guardians.length} 在线
            </span>
            <a
              href="/guardians"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              管理
            </a>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-gray-200">
          {guardians.map((guardian) => (
            <div key={guardian.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {guardian.name.charAt(0)}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {guardian.name}
                      </p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        优先级 {guardian.priority}
                      </span>
                    </div>
                    <div className="flex items-center mt-1 space-x-2">
                      <p className="text-xs text-gray-500">
                        {guardian.relationship}
                      </p>
                      <span className="text-xs text-gray-300">•</span>
                      <p className="text-xs text-gray-500">
                        {guardian.lastSeen
                          ? formatLastSeen(guardian.lastSeen)
                          : "从未上线"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status badges */}
                <div className="flex flex-col items-end space-y-1">
                  {getStatusBadge(guardian)}
                  {guardian.responseTime &&
                    getResponseTimeBadge(guardian.responseTime)}
                </div>
              </div>

              {/* Contact info */}
              <div className="mt-2 ml-13">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  {guardian.email && <span>{guardian.email}</span>}
                  {guardian.phone && <span>{guardian.phone}</span>}
                </div>
                <div className="mt-1 text-xs text-gray-400 font-mono">
                  {guardian.address.slice(0, 10)}...{guardian.address.slice(-8)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {guardians.length === 0 && (
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
              没有守护者
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              开始添加守护者来保护您的资产。
            </p>
            <div className="mt-6">
              <a
                href="/guardians"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                添加守护者
              </a>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
