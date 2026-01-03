/**
 * 通用类型定义
 */

// 用户角色类型
export const UserRole = {
  PROTECTED_USER: "protected_user",
  GUARDIAN: "guardian",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// 用户信息
export interface User {
  id: string;
  address: string;
  name?: string;
  email?: string;
  avatar?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// 监护人信息
export interface Guardian {
  id: string;
  address: string;
  name: string;
  email?: string;
  phone?: string;
  relationship: string;
  priority: number;
  isActive: boolean;
  lastSeen?: Date;
  responseTime?: number; // 平均响应时间（分钟）
}

// 紧急情况类型
export const EmergencyType = {
  MEDICAL: "medical",
  FINANCIAL: "financial",
  SECURITY: "security",
  LEGAL: "legal",
  FAMILY: "family",
  OTHER: "other",
} as const;

export type EmergencyType = (typeof EmergencyType)[keyof typeof EmergencyType];

// 紧急级别
export const EmergencyLevel = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

export type EmergencyLevel =
  (typeof EmergencyLevel)[keyof typeof EmergencyLevel];

// 紧急状态
export const EmergencyStatus = {
  DRAFT: "draft",
  PENDING: "pending",
  ACTIVE: "active",
  APPROVED: "approved",
  EXECUTED: "executed",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
} as const;

export type EmergencyStatus =
  (typeof EmergencyStatus)[keyof typeof EmergencyStatus];

// 紧急情况
export interface Emergency {
  id: string;
  userId: string;
  type: EmergencyType;
  level: EmergencyLevel;
  status: EmergencyStatus;
  title: string;
  description: string;
  requestedAmount?: string; // ETH amount
  recipientAddress?: string;
  attachments?: string[]; // IPFS hashes
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  approvals: GuardianApproval[];
  executionTx?: string;
  transactionHash?: string;
}

// 监护人批准
export interface GuardianApproval {
  guardianId: string;
  guardianAddress: string;
  guardianName: string;
  status: "pending" | "approved" | "rejected";
  signature?: string;
  timestamp?: Date;
  comment?: string;
}

// 钱包连接状态
export interface WalletState {
  isConnected: boolean;
  address?: string;
  chainId?: number;
  networkName?: string;
  balance?: string;
  walletType?: string;
}

// 通知类型
export const NotificationType = {
  EMERGENCY_CREATED: "emergency_created",
  EMERGENCY_APPROVED: "emergency_approved",
  EMERGENCY_EXECUTED: "emergency_executed",
  GUARDIAN_ADDED: "guardian_added",
  GUARDIAN_REMOVED: "guardian_removed",
  SYSTEM_UPDATE: "system_update",
  ERROR: "error",
} as const;

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

// 通知
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  data?: any; // 额外数据
}

// 仪表板统计
export interface DashboardStats {
  totalEmergencies: number;
  activeEmergencies: number;
  totalGuardians: number;
  activeGuardians: number;
  totalAmount: string; // ETH
  averageResponseTime: number; // 分钟
}

// 监护人仪表板统计
export interface GuardianDashboardStats {
  totalProtectedUsers: number;
  pendingApprovals: number;
  totalApprovals: number;
  averageResponseTime: number; // 分钟
  totalAmountProtected: string; // ETH
}

// 活动日志
export interface ActivityLog {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  txHash?: string;
  metadata?: any;
}

// 表单状态
export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isValid: boolean;
}

// API 响应
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 分页
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// 分页响应
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: Pagination;
}
