/**
 * Demo Data - 演示数据初始化
 */

import type { Emergency, Guardian, Notification, ActivityLog } from "../types";

// 示例监护人数据
export const demoGuardians: Guardian[] = [
  {
    id: "guardian-001",
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    name: "张医生",
    email: "zhang.doctor@example.com",
    phone: "+86 138 0013 8001",
    relationship: "医疗顾问",
    priority: 1,
    isActive: true,
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    responseTime: 8, // minutes
  },
  {
    id: "guardian-002",
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    name: "李律师",
    email: "li.lawyer@example.com",
    phone: "+86 139 0013 9002",
    relationship: "法律顾问",
    priority: 2,
    isActive: true,
    lastSeen: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    responseTime: 12, // minutes
  },
  {
    id: "guardian-003",
    address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    name: "王财务",
    email: "wang.finance@example.com",
    phone: "+86 137 0013 7003",
    relationship: "财务顾问",
    priority: 3,
    isActive: true,
    lastSeen: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    responseTime: 5, // minutes
  },
];

// 示例紧急情况数据
export const demoEmergencies: Emergency[] = [
  {
    id: "emergency-001",
    userId: "user-001",
    type: "medical",
    level: "high",
    status: "active",
    title: "紧急医疗费用",
    description:
      "需要紧急支付手术费用，医院要求立即付款以进行紧急手术。患者情况危急，需要立即进行心脏搭桥手术。",
    requestedAmount: "5.0",
    recipientAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    updatedAt: new Date(),
    expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000), // 22 hours from now
    approvals: [
      {
        guardianId: "guardian-001",
        guardianAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        guardianName: "张医生",
        status: "approved",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      },
      {
        guardianId: "guardian-002",
        guardianAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        guardianName: "李律师",
        status: "pending",
      },
      {
        guardianId: "guardian-003",
        guardianAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        guardianName: "王财务",
        status: "pending",
      },
    ],
  },
  {
    id: "emergency-002",
    userId: "user-001",
    type: "financial",
    level: "medium",
    status: "executed",
    title: "紧急生活费",
    description: "临时生活费支持，用于支付房租和基本生活开销。",
    requestedAmount: "2.0",
    recipientAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
    executionTx:
      "0xabcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd1234",
    approvals: [
      {
        guardianId: "guardian-001",
        guardianAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        guardianName: "张医生",
        status: "approved",
        timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000),
      },
      {
        guardianId: "guardian-002",
        guardianAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        guardianName: "李律师",
        status: "approved",
        timestamp: new Date(Date.now() - 21 * 60 * 60 * 1000),
      },
      {
        guardianId: "guardian-003",
        guardianAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        guardianName: "王财务",
        status: "approved",
        timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000),
      },
    ],
  },
  {
    id: "emergency-003",
    userId: "user-001",
    type: "security",
    level: "critical",
    status: "pending",
    title: "安全威胁紧急转移",
    description:
      "检测到钱包可能存在安全风险，需要紧急转移资金到安全地址。发现异常登录活动和可疑交易尝试。",
    requestedAmount: "10.5",
    recipientAddress: "0x8ba1f109551bD432803012645Hac136c30c6C87",
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    updatedAt: new Date(),
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    approvals: [
      {
        guardianId: "guardian-001",
        guardianAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        guardianName: "张医生",
        status: "pending",
      },
      {
        guardianId: "guardian-002",
        guardianAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        guardianName: "李律师",
        status: "pending",
      },
      {
        guardianId: "guardian-003",
        guardianAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        guardianName: "王财务",
        status: "pending",
      },
    ],
  },
];

// 示例通知数据
export const demoNotifications: Notification[] = [
  {
    id: "notification-001",
    type: "emergency_created",
    title: "新的紧急请求",
    message: "用户创建了新的紧急请求：紧急医疗费用",
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: "notification-002",
    type: "emergency_approved",
    title: "紧急请求已批准",
    message: "张医生已批准紧急请求：紧急医疗费用",
    isRead: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: "notification-003",
    type: "emergency_executed",
    title: "紧急请求已执行",
    message: '紧急请求"紧急生活费"已获得所有监护人批准并执行',
    isRead: true,
    createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
  },
];

// 示例活动日志数据
export const demoActivities: ActivityLog[] = [
  {
    id: "activity-001",
    type: "emergency_created",
    description: "创建紧急请求: 安全威胁紧急转移",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: "activity-002",
    type: "emergency_approved",
    description: "监护人批准了紧急请求: 紧急医疗费用",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: "activity-003",
    type: "emergency_created",
    description: "创建紧急请求: 紧急医疗费用",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: "activity-004",
    type: "emergency_executed",
    description: "紧急请求已执行: 紧急生活费 (交易: 0xabcd...1234)",
    timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000),
  },
  {
    id: "activity-005",
    type: "guardian_added",
    description: "添加新监护人: 王财务",
    timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
  },
];

// 初始化演示数据的函数
export const initializeDemoData = (store: any) => {
  // 检查是否已经有数据，避免重复初始化
  const currentEmergencies = store.getState().emergencies;
  const currentGuardians = store.getState().guardians;

  if (currentEmergencies.length === 0) {
    store.getState().setEmergencies(demoEmergencies);
  }

  if (currentGuardians.length === 0) {
    store.getState().setGuardians(demoGuardians);
  }

  // 总是更新通知和活动（这些可能会变化）
  const currentNotifications = store.getState().notifications;
  if (currentNotifications.length === 0) {
    store.getState().setNotifications(demoNotifications);
  }

  const currentActivities = store.getState().activities;
  if (currentActivities.length === 0) {
    store.getState().setActivities(demoActivities);
  }
};

// 重置演示数据的函数
export const resetDemoData = (store: any) => {
  store.getState().setEmergencies(demoEmergencies);
  store.getState().setGuardians(demoGuardians);
  store.getState().setNotifications(demoNotifications);
  store.getState().setActivities(demoActivities);
};
