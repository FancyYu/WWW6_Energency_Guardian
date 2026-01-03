/**
 * Zustand Store - 应用状态管理
 */

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
