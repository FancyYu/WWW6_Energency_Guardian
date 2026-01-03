# Emergency Guardian UI 设计师资料包

## 📋 项目概述

**项目名称**: Emergency Guardian (紧急守护系统)
**项目类型**: Web3 紧急情况资源协调平台
**技术栈**: React 18 + TypeScript + TailwindCSS
**设计风格**: 现代化、专业、安全感、易用性

## 🎯 产品定位

Emergency Guardian 是一个基于区块链的紧急资产管理系统，为用户在紧急情况下提供快速、安全的资产访问。系统通过多重签名监护人机制和零知识证明技术，确保资产安全的同时提供紧急情况下的快速响应。

## 👥 用户角色

### 1. 受保护用户 (Protected User)

- **主要需求**: 在紧急情况下快速获得资产支持
- **关键操作**: 创建紧急请求、监控审批状态、管理监护人
- **心理状态**: 紧急时刻可能焦虑、需要清晰简单的操作流程

### 2. 监护人 (Guardian)

- **主要需求**: 快速审批紧急请求、管理保护的用户
- **关键操作**: 审批/拒绝请求、查看用户状态、设置响应偏好
- **心理状态**: 需要专业、高效的工作界面，快速做出决策

## 🎨 当前设计系统

### 色彩方案

```css
/* 主色调 - 蓝色系 (信任、专业) */
primary: {
  50: "#eff6ff",   /* 极浅蓝 */
  500: "#3b82f6",  /* 标准蓝 */
  600: "#2563eb",  /* 主要蓝 */
  700: "#1d4ed8",  /* 深蓝 */
}

/* 紧急色 - 红色系 (紧急、警告) */
emergency: {
  50: "#fef2f2",   /* 极浅红 */
  500: "#ef4444",  /* 标准红 */
  600: "#dc2626",  /* 主要红 */
  700: "#b91c1c",  /* 深红 */
}

/* 成功色 - 绿色系 (成功、安全) */
success: {
  50: "#f0fdf4",   /* 极浅绿 */
  500: "#22c55e",  /* 标准绿 */
  600: "#16a34a",  /* 主要绿 */
  700: "#15803d",  /* 深绿 */
}

/* 警告色 - 黄色系 (注意、等待) */
warning: {
  50: "#fffbeb",   /* 极浅黄 */
  500: "#f59e0b",  /* 标准黄 */
  600: "#d97706",  /* 主要黄 */
  700: "#b45309",  /* 深黄 */
}
```

### 字体系统

- **主字体**: Inter (现代、清晰、易读)
- **字重**: 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)

### 组件尺寸

```css
/* 按钮尺寸 */
sm: "h-8 px-3 text-sm"     /* 小按钮 */
md: "h-10 px-4 text-sm"    /* 标准按钮 */
lg: "h-12 px-6 text-base"  /* 大按钮 */

/* 圆角 */
rounded-md: "6px"          /* 标准圆角 */
rounded-lg: "8px"          /* 大圆角 */

/* 阴影 */
shadow-sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)"
shadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)"
```

## 🏗️ 界面架构

### 1. 主布局结构

```
┌─────────────────────────────────────┐
│ Header (角色切换 + 导航)              │
├─────────────┬───────────────────────┤
│ Sidebar     │ Main Content Area     │
│ - 导航菜单   │ - 仪表板内容           │
│ - 快速操作   │ - 统计卡片             │
│ - 状态指示   │ - 数据表格             │
│             │ - 操作按钮             │
└─────────────┴───────────────────────┘
```

### 2. 紧急页面布局

```
┌─────────────────────────────────────┐
│ Emergency Header (状态 + 操作切换)    │
├─────────────────────────────────────┤
│ Full Width Content Area             │
│ - 3步式表单 / 监控面板 / 验证流程     │
│                                     │
│ [浮动紧急按钮]                       │
└─────────────────────────────────────┘
```

## 📱 核心界面详解

### 1. 受保护用户仪表板

**设计重点**: 清晰的状态展示 + 快速紧急操作

**关键元素**:

- 4 个统计卡片 (总紧急情况、活跃监护人、保护金额、响应时间)
- 最近活动列表 (时间线样式)
- 监护人状态面板 (在线状态、响应时间)
- 4 个快速操作按钮 (紧急求助、添加监护人、安全设置、查看报告)

**视觉层次**:

1. 欢迎信息 (次要)
2. 统计卡片 (主要) - 使用彩色图标和数字
3. 内容区域 (主要) - 2:1 网格布局
4. 快速操作 (重要) - 彩色背景卡片

### 2. 监护人仪表板

**设计重点**: 专业工作界面 + 高效决策支持

**关键元素**:

- 5 个统计卡片 (保护用户数、待审批、总审批、响应时间、保护金额)
- 待审批请求列表 (优先级排序)
- 受保护用户管理面板
- 4 个专业操作按钮 (处理审批、管理用户、监护设置、监护报告)

**视觉层次**:

1. 控制台标题 (主要)
2. 统计卡片 (重要) - 包含变化趋势指示
3. 工作区域 (主要) - 2:1 网格布局
4. 专业操作 (重要) - 功能性图标设计

### 3. 紧急操作系统

**设计重点**: 紧急情况下的清晰操作流程

#### 3.1 紧急请求创建 (3 步式)

**步骤 1: 基本信息**

- 紧急类型选择 (6 种类型，图标+文字)
- 紧急级别 (4 级，颜色编码)
- 标题和描述输入

**步骤 2: 详细信息**

- 金额设置 (ETH 输入)
- 接收地址 (地址输入+验证)
- 文件上传 (拖拽区域)

**步骤 3: 确认提交**

- 信息预览卡片
- 最终确认按钮

#### 3.2 验证流程监控

**5 步进度条**:

1. ✅ 请求已提交
2. 📢 通知监护人
3. 👥 监护人审批 (实时状态)
4. 🔐 ZK 证明验证
5. ⚡ 执行操作

#### 3.3 操作监控面板

- 系统健康指标 (可用性、响应时间)
- 操作统计卡片 (总数、状态分布)
- 最近操作列表 (时间戳、状态、金额)
- 智能警报系统 (颜色编码)

## 🎨 设计改进建议

### 1. 视觉层次优化

**当前问题**: 信息密度较高，视觉层次不够清晰
**建议改进**:

- 增加更多白空间
- 使用更明显的视觉分组
- 强化重要操作的视觉权重

### 2. 色彩系统增强

**当前问题**: 色彩使用相对保守
**建议改进**:

- 为不同紧急级别设计更直观的色彩编码
- 增加状态指示的色彩丰富度
- 考虑深色模式支持

### 3. 交互反馈改进

**当前问题**: 缺少微交互和状态反馈
**建议改进**:

- 添加加载状态动画
- 增加操作成功/失败的反馈
- 实现更流畅的页面过渡

### 4. 移动端适配

**当前问题**: 主要针对桌面端设计
**建议改进**:

- 优化移动端布局
- 简化移动端操作流程
- 考虑触摸友好的交互设计

## 📊 关键数据展示

### 统计卡片设计模式

```typescript
interface StatsCard {
  title: string; // 指标名称
  value: string | number; // 主要数值
  icon: ReactNode; // 功能图标
  color: "blue" | "green" | "red" | "yellow" | "purple";
  change?: {
    // 变化趋势 (可选)
    value: number;
    type: "increase" | "decrease";
  };
}
```

### 状态徽章系统

```typescript
type BadgeVariant =
  | "success" // 绿色 - 成功、已完成
  | "warning" // 黄色 - 等待、处理中
  | "emergency" // 红色 - 紧急、错误
  | "gray" // 灰色 - 默认、未激活
  | "primary"; // 蓝色 - 信息、活跃
```

## 🔧 技术实现细节

### 组件库结构

```
src/components/
├── Common/              # 基础组件
│   ├── Button.tsx      # 按钮组件
│   ├── Card.tsx        # 卡片组件
│   ├── Badge.tsx       # 徽章组件
│   └── Input.tsx       # 输入组件
├── Dashboard/          # 仪表板组件
│   ├── Dashboard.tsx   # 用户仪表板
│   ├── GuardianDashboard.tsx  # 监护人仪表板
│   ├── StatsCard.tsx   # 统计卡片
│   └── Layout.tsx      # 布局组件
└── Emergency/          # 紧急操作组件
    ├── EmergencyPage.tsx      # 主页面
    ├── EmergencyTrigger.tsx   # 创建请求
    ├── VerificationFlow.tsx   # 验证流程
    └── OperationMonitor.tsx   # 监控面板
```

### 状态管理 (Zustand)

```typescript
interface AppState {
  // 用户状态
  currentRole: "protected_user" | "guardian";
  user: User | null;

  // 数据状态
  emergencies: Emergency[];
  guardians: Guardian[];
  activities: Activity[];
  notifications: Notification[];

  // UI状态
  sidebarOpen: boolean;
  loading: boolean;
}
```

## 🎯 设计目标与原则

### 1. 安全感设计

- 使用稳重的色彩搭配
- 清晰的状态指示
- 明确的操作反馈
- 专业的视觉语言

### 2. 紧急情况优化

- 简化紧急操作流程
- 突出重要操作按钮
- 清晰的进度指示
- 快速的响应反馈

### 3. 角色差异化

- 用户界面：友好、简单、引导性强
- 监护人界面：专业、高效、信息密集

### 4. 可访问性

- 符合 WCAG 标准
- 键盘导航支持
- 屏幕阅读器友好
- 色彩对比度达标

## 📁 提供的代码文件

### 核心组件文件

1. `frontend/src/App.tsx` - 主应用组件
   /\*\*

- App Component - 主应用组件
  \*/

import { Layout, Dashboard, GuardianDashboard } from "./components/Dashboard";
import { EmergencyPage } from "./components/Emergency";
import { useCurrentRole } from "./store";
import { useRouter } from "./hooks/useRouter";
import "./index.css";

function App() {
const currentRole = useCurrentRole();
const { currentRoute } = useRouter();

const renderContent = () => {
switch (currentRoute) {
case "emergency":
return <EmergencyPage />;
case "dashboard":
default:
return currentRole === "protected_user" ? (
<Dashboard />
) : (
<GuardianDashboard />
);
}
};

return (

<div className="min-h-screen bg-gray-50">
{currentRoute === "emergency" ? (
// Emergency page has its own layout
renderContent()
) : (
<Layout>{renderContent()}</Layout>
)}
</div>
);
}

export default App;

2. `frontend/src/components/Dashboard/Dashboard.tsx` - 用户仪表板
   /\*\*

- Dashboard Component - 主仪表板组件
  \*/

import React, { useEffect } from "react";
import { StatsCard } from "./StatsCard";
import { RecentActivity } from "./RecentActivity";
import { GuardianStatus } from "./GuardianStatus";
import { useStats, useAppStore } from "../../store";
import { useRouter } from "../../hooks/useRouter";
import type { DashboardStats } from "../../types";

// Icons
const ShieldIcon = () => (
<svg
className="w-5 h-5"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"

>

    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />

  </svg>
);

const UsersIcon = () => (
<svg
className="w-5 h-5"
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
);

const CurrencyIcon = () => (
<svg
className="w-5 h-5"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"

>

    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />

  </svg>
);

const ClockIcon = () => (
<svg
className="w-5 h-5"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"

>

    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />

  </svg>
);

// Mock stats data
const mockStats: DashboardStats = {
totalEmergencies: 12,
activeEmergencies: 2,
totalGuardians: 3,
activeGuardians: 2,
totalAmount: "45.7",
averageResponseTime: 18,
};

export const Dashboard: React.FC = () => {
const stats = useStats();
const { setStats } = useAppStore();
const { navigate } = useRouter();

// Load stats on component mount
useEffect(() => {
// In a real app, this would be an API call
setStats(mockStats);
}, [setStats]);

const displayStats = stats || mockStats;

return (

<div className="space-y-6">
{/_ Welcome section _/}
<div>
<h2 className="text-2xl font-bold text-gray-900">欢迎回来</h2>
<p className="mt-1 text-sm text-gray-600">这是您的紧急守护系统概览。</p>
</div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="总紧急情况"
          value={displayStats.totalEmergencies}
          icon={<ShieldIcon />}
          color="blue"
          change={{
            value: 12,
            type: "increase",
          }}
        />

        <StatsCard
          title="活跃监护人"
          value={`${displayStats.activeGuardians}/${displayStats.totalGuardians}`}
          icon={<UsersIcon />}
          color="green"
        />

        <StatsCard
          title="总保护金额"
          value={`${displayStats.totalAmount} ETH`}
          icon={<CurrencyIcon />}
          color="purple"
          change={{
            value: 8,
            type: "increase",
          }}
        />

        <StatsCard
          title="平均响应时间"
          value={`${displayStats.averageResponseTime}分钟`}
          icon={<ClockIcon />}
          color="yellow"
          change={{
            value: 5,
            type: "decrease",
          }}
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column - Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>

        {/* Right column - Guardian Status */}
        <div className="lg:col-span-1">
          <GuardianStatus />
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">快速操作</h3>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button
              onClick={() => navigate("emergency")}
              className="relative group bg-red-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-red-500 rounded-lg hover:bg-red-100 transition-colors text-left"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-red-100 text-red-600 group-hover:bg-red-200">
                  <ShieldIcon />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">紧急求助</h3>
                <p className="mt-2 text-sm text-gray-500">
                  立即创建紧急情况并通知监护人
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate("guardians")}
              className="relative group bg-blue-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg hover:bg-blue-100 transition-colors text-left"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-blue-100 text-blue-600 group-hover:bg-blue-200">
                  <UsersIcon />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">
                  添加监护人
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  邀请新的监护人保护您的资产
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate("settings")}
              className="relative group bg-green-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-500 rounded-lg hover:bg-green-100 transition-colors text-left"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-100 text-green-600 group-hover:bg-green-200">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">安全设置</h3>
                <p className="mt-2 text-sm text-gray-500">
                  配置时间锁和安全参数
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate("activities")}
              className="relative group bg-purple-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-purple-500 rounded-lg hover:bg-purple-100 transition-colors text-left"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-purple-100 text-purple-600 group-hover:bg-purple-200">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">查看报告</h3>
                <p className="mt-2 text-sm text-gray-500">
                  查看详细的活动记录和统计
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

);
};

3. `frontend/src/components/Dashboard/GuardianDashboard.tsx` - 监护人仪表板
   /\*\*

- GuardianDashboard Component - 监护人仪表板组件
  \*/

import React, { useEffect } from "react";
import { StatsCard } from "./StatsCard";
import { PendingApprovals } from "./PendingApprovals";
import { ProtectedUsers } from "./ProtectedUsers";
import { useGuardianStats, useAppStore } from "../../store";
import type { GuardianDashboardStats } from "../../types";

// Icons
const ShieldIcon = () => (
<svg
className="w-5 h-5"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"

>

    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />

  </svg>
);

const UsersIcon = () => (
<svg
className="w-5 h-5"
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
);

const CheckIcon = () => (
<svg
className="w-5 h-5"
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
);

const ClockIcon = () => (
<svg
className="w-5 h-5"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"

>

    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />

  </svg>
);

const CurrencyIcon = () => (
<svg
className="w-5 h-5"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"

>

    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />

  </svg>
);

// Mock stats data for guardian
const mockGuardianStats: GuardianDashboardStats = {
totalProtectedUsers: 5,
pendingApprovals: 2,
totalApprovals: 28,
averageResponseTime: 12,
totalAmountProtected: "156.8",
};

export const GuardianDashboard: React.FC = () => {
const guardianStats = useGuardianStats();
const { setGuardianStats } = useAppStore();

// Load stats on component mount
useEffect(() => {
// In a real app, this would be an API call
setGuardianStats(mockGuardianStats);
}, [setGuardianStats]);

const displayStats = guardianStats || mockGuardianStats;

return (

<div className="space-y-6">
{/_ Welcome section _/}
<div>
<h2 className="text-2xl font-bold text-gray-900">监护人控制台</h2>
<p className="mt-1 text-sm text-gray-600">
管理您保护的用户和处理紧急审批请求。
</p>
</div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          title="保护用户数"
          value={displayStats.totalProtectedUsers}
          icon={<UsersIcon />}
          color="blue"
        />

        <StatsCard
          title="待审批请求"
          value={displayStats.pendingApprovals}
          icon={<ShieldIcon />}
          color="red"
          change={{
            value: 2,
            type: "increase",
          }}
        />

        <StatsCard
          title="总审批数"
          value={displayStats.totalApprovals}
          icon={<CheckIcon />}
          color="green"
          change={{
            value: 15,
            type: "increase",
          }}
        />

        <StatsCard
          title="平均响应时间"
          value={`${displayStats.averageResponseTime}分钟`}
          icon={<ClockIcon />}
          color="yellow"
          change={{
            value: 3,
            type: "decrease",
          }}
        />

        <StatsCard
          title="保护总金额"
          value={`${displayStats.totalAmountProtected} ETH`}
          icon={<CurrencyIcon />}
          color="purple"
          change={{
            value: 12,
            type: "increase",
          }}
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column - Pending Approvals */}
        <div className="lg:col-span-2">
          <PendingApprovals />
        </div>

        {/* Right column - Protected Users */}
        <div className="lg:col-span-1">
          <ProtectedUsers />
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">监护人操作</h3>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href="/approvals"
              className="relative group bg-red-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-red-500 rounded-lg hover:bg-red-100 transition-colors"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-red-100 text-red-600 group-hover:bg-red-200">
                  <ShieldIcon />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">
                  <span className="absolute inset-0" aria-hidden="true" />
                  处理审批
                </h3>
                <p className="mt-2 text-sm text-gray-500">审批或拒绝紧急请求</p>
              </div>
            </a>

            <a
              href="/protected-users"
              className="relative group bg-blue-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-blue-100 text-blue-600 group-hover:bg-blue-200">
                  <UsersIcon />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">
                  <span className="absolute inset-0" aria-hidden="true" />
                  管理用户
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  查看和管理保护的用户
                </p>
              </div>
            </a>

            <a
              href="/guardian-settings"
              className="relative group bg-green-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-500 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-100 text-green-600 group-hover:bg-green-200">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">
                  <span className="absolute inset-0" aria-hidden="true" />
                  监护人设置
                </h3>
                <p className="mt-2 text-sm text-gray-500">配置通知和响应偏好</p>
              </div>
            </a>

            <a
              href="/guardian-reports"
              className="relative group bg-purple-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-purple-500 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-purple-100 text-purple-600 group-hover:bg-purple-200">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">
                  <span className="absolute inset-0" aria-hidden="true" />
                  监护报告
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  查看监护活动和统计报告
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>

);
};

4. `frontend/src/components/Emergency/EmergencyPage.tsx` - 紧急操作页面
   /\*\*

- EmergencyPage Component - 紧急操作主页面
  \*/

import React, { useState, useEffect } from "react";
import { EmergencyTrigger } from "./EmergencyTrigger";
import { VerificationFlow } from "./VerificationFlow";
import { OperationMonitor } from "./OperationMonitor";
import { Button } from "../Common/Button";
import { Badge } from "../Common/Badge";
import { useEmergencies, useAppStore } from "../../store";
import type { Emergency, EmergencyType, EmergencyLevel } from "../../types";

type ViewMode = "trigger" | "monitor" | "verification";

interface EmergencyRequest {
type: EmergencyType;
level: EmergencyLevel;
title: string;
description: string;
requestedAmount?: string;
recipientAddress?: string;
attachments?: File[];
}

export const EmergencyPage: React.FC = () => {
const [viewMode, setViewMode] = useState<ViewMode>("monitor");
const [selectedEmergency, setSelectedEmergency] = useState<Emergency | null>(
null
);
const [isSubmitting, setIsSubmitting] = useState(false);

const emergencies = useEmergencies();
const { addEmergency, addActivity, addNotification } = useAppStore();

// Mock data for demonstration
useEffect(() => {
if (emergencies.length === 0) {
// Add some mock emergencies for demonstration
const mockEmergencies: Emergency[] = [
{
id: "emergency-001",
userId: "user-001",
type: "medical",
level: "high",
status: "active",
title: "紧急医疗费用",
description: "需要紧急支付手术费用",
requestedAmount: "5.0",
recipientAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
createdAt: new Date(Date.now() - 2 _ 60 _ 60 _ 1000), // 2 hours ago
updatedAt: new Date(),
approvals: [
{
guardianId: "guardian-001",
guardianAddress: "0x123...",
guardianName: "张医生",
status: "approved",
timestamp: new Date(Date.now() - 1 _ 60 _ 60 _ 1000),
},
{
guardianId: "guardian-002",
guardianAddress: "0x456...",
guardianName: "李护士",
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
description: "临时生活费支持",
requestedAmount: "2.0",
recipientAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
createdAt: new Date(Date.now() - 24 _ 60 _ 60 _ 1000), // 1 day ago
updatedAt: new Date(Date.now() - 20 _ 60 _ 60 _ 1000),
executionTx:
"0xabcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd1234",
approvals: [
{
guardianId: "guardian-001",
guardianAddress: "0x123...",
guardianName: "张医生",
status: "approved",
timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000),
},
{
guardianId: "guardian-002",
guardianAddress: "0x456...",
guardianName: "李护士",
status: "approved",
timestamp: new Date(Date.now() - 21 * 60 * 60 * 1000),
},
],
},
];

      mockEmergencies.forEach((emergency) => addEmergency(emergency));
    }

}, [emergencies.length, addEmergency]);

const handleTriggerEmergency = async (request: EmergencyRequest) => {
setIsSubmitting(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create new emergency
      const newEmergency: Emergency = {
        id: `emergency-${Date.now()}`,
        userId: "user-001",
        type: request.type,
        level: request.level,
        status: "pending",
        title: request.title,
        description: request.description,
        requestedAmount: request.requestedAmount,
        recipientAddress: request.recipientAddress,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        approvals: [
          {
            guardianId: "guardian-001",
            guardianAddress: "0x123...",
            guardianName: "张医生",
            status: "pending",
          },
          {
            guardianId: "guardian-002",
            guardianAddress: "0x456...",
            guardianName: "李护士",
            status: "pending",
          },
        ],
      };

      addEmergency(newEmergency);

      // Add activity log
      addActivity({
        id: `activity-${Date.now()}`,
        type: "emergency_created",
        description: `创建紧急请求: ${request.title}`,
        timestamp: new Date(),
      });

      // Add notification
      addNotification({
        id: `notification-${Date.now()}`,
        type: "emergency_created",
        title: "紧急请求已创建",
        message: `您的紧急请求"${request.title}"已提交，正在通知监护人。`,
        isRead: false,
        createdAt: new Date(),
      });

      // Switch to verification view
      setSelectedEmergency(newEmergency);
      setViewMode("verification");
    } catch (error) {
      console.error("Failed to create emergency:", error);
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false);
    }

};

const handleViewDetails = (emergency: Emergency) => {
setSelectedEmergency(emergency);
setViewMode("verification");
};

const handleRefresh = () => {
// In a real app, this would fetch latest data from API
console.log("Refreshing emergency data...");
};

const handleCancelEmergency = () => {
if (selectedEmergency) {
// Update emergency status to cancelled
// In a real app, this would be an API call
console.log("Cancelling emergency:", selectedEmergency.id);
setViewMode("monitor");
setSelectedEmergency(null);
}
};

const getActiveEmergencies = () => {
return emergencies.filter(
(e) => e.status === "active" || e.status === "pending"
);
};

return (

<div className="min-h-screen bg-gray-50">
{/_ Header _/}
<div className="bg-white shadow-sm border-b border-gray-200">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="flex items-center justify-between h-16">
<div className="flex items-center space-x-4">
<h1 className="text-xl font-semibold text-gray-900">
紧急操作中心
</h1>
{getActiveEmergencies().length > 0 && (
<Badge variant="emergency">
{getActiveEmergencies().length} 个活跃请求
</Badge>
)}
</div>

            <div className="flex items-center space-x-3">
              <Button
                variant={viewMode === "monitor" ? "primary" : "outline"}
                onClick={() => {
                  setViewMode("monitor");
                  setSelectedEmergency(null);
                }}
              >
                监控面板
              </Button>
              <Button
                variant={viewMode === "trigger" ? "primary" : "outline"}
                onClick={() => setViewMode("trigger")}
              >
                创建请求
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === "trigger" && (
          <EmergencyTrigger
            onTrigger={handleTriggerEmergency}
            isLoading={isSubmitting}
          />
        )}

        {viewMode === "monitor" && (
          <OperationMonitor
            emergencies={emergencies}
            onViewDetails={handleViewDetails}
            onRefresh={handleRefresh}
          />
        )}

        {viewMode === "verification" && selectedEmergency && (
          <VerificationFlow
            emergency={selectedEmergency}
            onCancel={handleCancelEmergency}
            onRefresh={handleRefresh}
          />
        )}
      </div>

      {/* Emergency Quick Action Button */}
      {viewMode !== "trigger" && (
        <div className="fixed bottom-6 right-6">
          <Button
            variant="emergency"
            size="lg"
            onClick={() => setViewMode("trigger")}
            className="shadow-lg hover:shadow-xl transition-shadow"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            紧急求助
          </Button>
        </div>
      )}
    </div>

);
};

5. `frontend/src/components/Common/Button.tsx` - 按钮组件
   /\*\*

- Button Component - 通用按钮组件
  \*/

import React from "react";
import { clsx } from "clsx";

export interface ButtonProps
extends React.ButtonHTMLAttributes<HTMLButtonElement> {
variant?: "primary" | "secondary" | "emergency" | "success" | "outline";
size?: "sm" | "md" | "lg";
loading?: boolean;
icon?: React.ReactNode;
children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
variant = "primary",
size = "md",
loading = false,
icon,
children,
className,
disabled,
...props
}) => {
const baseClasses =
"inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

const variantClasses = {
primary:
"bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500",
secondary:
"bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500",
emergency:
"bg-emergency-600 text-white hover:bg-emergency-700 focus-visible:ring-emergency-500",
success:
"bg-success-600 text-white hover:bg-success-700 focus-visible:ring-success-500",
outline:
"border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-primary-500",
};

const sizeClasses = {
sm: "h-8 px-3 text-sm",
md: "h-10 px-4 text-sm",
lg: "h-12 px-6 text-base",
};

return (
<button
className={clsx(
baseClasses,
variantClasses[variant],
sizeClasses[size],
className
)}
disabled={disabled || loading}
{...props} >
{loading && (
<svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
<circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
<path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
</svg>
)}
{!loading && icon && <span className="mr-2">{icon}</span>}
{children}
</button>
);
};

### 样式配置文件

1. `frontend/tailwind.config.js` - TailwindCSS 配置
   /** @type {import('tailwindcss').Config} \*/
   export default {
   content: ["./index.html", "./src/**/\*.{js,ts,jsx,tsx}"],
   theme: {
   extend: {
   colors: {
   primary: {
   50: "#eff6ff",
   100: "#dbeafe",
   200: "#bfdbfe",
   300: "#93c5fd",
   400: "#60a5fa",
   500: "#3b82f6",
   600: "#2563eb",
   700: "#1d4ed8",
   800: "#1e40af",
   900: "#1e3a8a",
   },
   emergency: {
   50: "#fef2f2",
   100: "#fee2e2",
   200: "#fecaca",
   300: "#fca5a5",
   400: "#f87171",
   500: "#ef4444",
   600: "#dc2626",
   700: "#b91c1c",
   800: "#991b1b",
   900: "#7f1d1d",
   },
   success: {
   50: "#f0fdf4",
   100: "#dcfce7",
   200: "#bbf7d0",
   300: "#86efac",
   400: "#4ade80",
   500: "#22c55e",
   600: "#16a34a",
   700: "#15803d",
   800: "#166534",
   900: "#14532d",
   },
   warning: {
   50: "#fffbeb",
   100: "#fef3c7",
   200: "#fde68a",
   300: "#fcd34d",
   400: "#fbbf24",
   500: "#f59e0b",
   600: "#d97706",
   700: "#b45309",
   800: "#92400e",
   900: "#78350f",
   },
   },
   fontFamily: {
   sans: ["Inter", "system-ui", "sans-serif"],
   },
   animation: {
   "fade-in": "fadeIn 0.5s ease-in-out",
   "slide-up": "slideUp 0.3s ease-out",
   "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
   },
   keyframes: {
   fadeIn: {
   "0%": { opacity: "0" },
   "100%": { opacity: "1" },
   },
   slideUp: {
   "0%": { transform: "translateY(10px)", opacity: "0" },
   "100%": { transform: "translateY(0)", opacity: "1" },
   },
   },
   },
   },
   plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
   };

2. `frontend/src/index.css` - 全局样式和组件类
   @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
body {
@apply bg-gray-50 text-gray-900 font-sans;
font-feature-settings: "rlig" 1, "calt" 1;
}
}

@layer components {
.btn {
@apply inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none;
}

.btn-primary {
@apply btn bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 px-4 py-2;
}

.btn-secondary {
@apply btn bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 px-4 py-2;
}

.btn-emergency {
@apply btn bg-emergency-600 text-white hover:bg-emergency-700 active:bg-emergency-800 px-4 py-2;
}

.btn-success {
@apply btn bg-success-600 text-white hover:bg-success-700 active:bg-success-800 px-4 py-2;
}

.card {
@apply bg-white rounded-lg border border-gray-200 shadow-sm;
}

.card-header {
@apply px-6 py-4 border-b border-gray-200;
}

.card-content {
@apply px-6 py-4;
}

.card-footer {
@apply px-6 py-4 border-t border-gray-200 bg-gray-50;
}

.input {
@apply flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50;
}

.label {
@apply text-sm font-medium leading-none;
}

.badge {
@apply inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium;
}

.badge-success {
@apply badge bg-success-100 text-success-800;
}

.badge-warning {
@apply badge bg-warning-100 text-warning-800;
}

.badge-emergency {
@apply badge bg-emergency-100 text-emergency-800;
}

.badge-gray {
@apply badge bg-gray-100 text-gray-800;
}
}

### 类型定义

1. `frontend/src/types/index.ts` - TypeScript 类型定义
   /\*\*

- 通用类型定义
  \*/

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

2. `frontend/src/store/index.ts` - 状态管理
   /\*\*

- Zustand Store - 应用状态管理
  \*/

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {
User,
UserRole,
Guardian,
Emergency,
WalletState,
Notification,
DashboardStats,
GuardianDashboardStats,
ActivityLog,
} from "../types";

// 应用状态接口
interface AppState {
// 用户状态
user: User | null;
setUser: (user: User | null) => void;

// 角色切换
currentRole: UserRole;
setCurrentRole: (role: UserRole) => void;
switchRole: () => void;

// 钱包状态
wallet: WalletState;
setWallet: (wallet: Partial<WalletState>) => void;

// 监护人状态
guardians: Guardian[];
setGuardians: (guardians: Guardian[]) => void;
addGuardian: (guardian: Guardian) => void;
updateGuardian: (id: string, updates: Partial<Guardian>) => void;
removeGuardian: (id: string) => void;

// 紧急情况状态
emergencies: Emergency[];
setEmergencies: (emergencies: Emergency[]) => void;
addEmergency: (emergency: Emergency) => void;
updateEmergency: (id: string, updates: Partial<Emergency>) => void;

// 通知状态
notifications: Notification[];
setNotifications: (notifications: Notification[]) => void;
addNotification: (notification: Notification) => void;
markNotificationAsRead: (id: string) => void;
clearNotifications: () => void;

// 仪表板统计
stats: DashboardStats | null;
setStats: (stats: DashboardStats) => void;

// 监护人仪表板统计
guardianStats: GuardianDashboardStats | null;
setGuardianStats: (stats: GuardianDashboardStats) => void;

// 活动日志
activities: ActivityLog[];
setActivities: (activities: ActivityLog[]) => void;
addActivity: (activity: ActivityLog) => void;

// UI 状态
sidebarOpen: boolean;
setSidebarOpen: (open: boolean) => void;

// 加载状态
loading: {
guardians: boolean;
emergencies: boolean;
stats: boolean;
};
setLoading: (key: keyof AppState["loading"], value: boolean) => void;
}

// 创建 store
export const useAppStore = create<AppState>()(
devtools(
persist(
(set, get) => ({
// 初始状态
user: null,
currentRole: "protected_user" as UserRole,
wallet: {
isConnected: false,
},
guardians: [],
emergencies: [],
notifications: [],
stats: null,
guardianStats: null,
activities: [],
sidebarOpen: true,
loading: {
guardians: false,
emergencies: false,
stats: false,
},

        // 用户操作
        setUser: (user) => set({ user }),

        // 角色切换操作
        setCurrentRole: (role) => set({ currentRole: role }),

        switchRole: () => {
          const { currentRole } = get();
          const newRole =
            currentRole === "protected_user" ? "guardian" : "protected_user";
          set({ currentRole: newRole });
        },

        // 钱包操作
        setWallet: (wallet) =>
          set((state) => ({
            wallet: { ...state.wallet, ...wallet },
          })),

        // 监护人操作
        setGuardians: (guardians) => set({ guardians }),

        addGuardian: (guardian) =>
          set((state) => ({
            guardians: [...state.guardians, guardian],
          })),

        updateGuardian: (id, updates) =>
          set((state) => ({
            guardians: state.guardians.map((guardian) =>
              guardian.id === id ? { ...guardian, ...updates } : guardian
            ),
          })),

        removeGuardian: (id) =>
          set((state) => ({
            guardians: state.guardians.filter((guardian) => guardian.id !== id),
          })),

        // 紧急情况操作
        setEmergencies: (emergencies) => set({ emergencies }),

        addEmergency: (emergency) =>
          set((state) => ({
            emergencies: [emergency, ...state.emergencies],
          })),

        updateEmergency: (id, updates) =>
          set((state) => ({
            emergencies: state.emergencies.map((emergency) =>
              emergency.id === id ? { ...emergency, ...updates } : emergency
            ),
          })),

        // 通知操作
        setNotifications: (notifications) => set({ notifications }),

        addNotification: (notification) =>
          set((state) => ({
            notifications: [notification, ...state.notifications],
          })),

        markNotificationAsRead: (id) =>
          set((state) => ({
            notifications: state.notifications.map((notification) =>
              notification.id === id
                ? { ...notification, isRead: true }
                : notification
            ),
          })),

        clearNotifications: () => set({ notifications: [] }),

        // 统计操作
        setStats: (stats) => set({ stats }),
        setGuardianStats: (guardianStats) => set({ guardianStats }),

        // 活动日志操作
        setActivities: (activities) => set({ activities }),

        addActivity: (activity) =>
          set((state) => ({
            activities: [activity, ...state.activities.slice(0, 99)], // 保持最新100条
          })),

        // UI 操作
        setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

        // 加载状态操作
        setLoading: (key, value) =>
          set((state) => ({
            loading: { ...state.loading, [key]: value },
          })),
      }),
      {
        name: "emergency-guardian-store",
        partialize: (state) => ({
          user: state.user,
          currentRole: state.currentRole,
          wallet: state.wallet,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    ),
    {
      name: "emergency-guardian-store",
    }

)
);

// 选择器 hooks
export const useUser = () => useAppStore((state) => state.user);
export const useCurrentRole = () => useAppStore((state) => state.currentRole);
export const useWallet = () => useAppStore((state) => state.wallet);
export const useGuardians = () => useAppStore((state) => state.guardians);
export const useEmergencies = () => useAppStore((state) => state.emergencies);
export const useNotifications = () =>
useAppStore((state) => state.notifications);
export const useStats = () => useAppStore((state) => state.stats);
export const useGuardianStats = () =>
useAppStore((state) => state.guardianStats);
export const useActivities = () => useAppStore((state) => state.activities);
export const useLoading = () => useAppStore((state) => state.loading);
export const useSidebarOpen = () => useAppStore((state) => state.sidebarOpen);

## 🚀 下一步设计重点

### 1. 视觉设计优化

- 重新设计统计卡片的视觉层次
- 优化色彩搭配和对比度
- 设计更直观的图标系统
- 改进整体布局的空间感

### 2. 交互体验提升

- 设计流畅的页面过渡动画
- 增加微交互反馈
- 优化表单填写体验
- 改进移动端交互

### 3. 品牌视觉强化

- 设计专属的品牌色彩
- 创建独特的图标语言
- 建立一致的视觉规范
- 增强品牌识别度

### 4. 用户体验优化

- 简化复杂操作流程
- 增加操作引导和帮助
- 优化错误状态处理
- 提升整体易用性

---

**联系方式**: 如需更多技术细节或设计讨论，请随时联系开发团队。

**项目状态**: 功能开发完成，等待 UI/UX 设计优化。
