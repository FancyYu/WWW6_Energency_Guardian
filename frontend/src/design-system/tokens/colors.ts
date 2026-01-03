/**
 * 设计令牌 - 色彩系统
 * 扩展的色彩令牌定义，支持玻璃拟态和发光效果
 */

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950?: string;
}

export interface ColorScaleWithAlpha extends ColorScale {
  "500/5": string;
  "500/10": string;
  "500/20": string;
  "500/40": string;
  "500/60": string;
  "500/80": string;
}

export interface GlassColors {
  light: string;
  medium: string;
  heavy: string;
  border: string;
  "dark-light": string;
  "dark-medium": string;
  "dark-heavy": string;
  "dark-border": string;
}

export interface GlowColors {
  blue: string;
  red: string;
  green: string;
  purple: string;
  yellow: string;
}

export interface ColorTokens {
  primary: ColorScaleWithAlpha;
  emergency: ColorScaleWithAlpha;
  success: ColorScaleWithAlpha;
  warning: ColorScaleWithAlpha;
  glass: GlassColors;
  glow: GlowColors;
}

// 基础色彩定义
export const primaryColors: ColorScaleWithAlpha = {
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
  950: "#1e3a8a",
  // 透明度变体
  "500/5": "rgba(59, 130, 246, 0.05)",
  "500/10": "rgba(59, 130, 246, 0.1)",
  "500/20": "rgba(59, 130, 246, 0.2)",
  "500/40": "rgba(59, 130, 246, 0.4)",
  "500/60": "rgba(59, 130, 246, 0.6)",
  "500/80": "rgba(59, 130, 246, 0.8)",
};

export const emergencyColors: ColorScaleWithAlpha = {
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
  950: "#7f1d1d",
  // 透明度变体
  "500/5": "rgba(239, 68, 68, 0.05)",
  "500/10": "rgba(239, 68, 68, 0.1)",
  "500/20": "rgba(239, 68, 68, 0.2)",
  "500/40": "rgba(239, 68, 68, 0.4)",
  "500/60": "rgba(239, 68, 68, 0.6)",
  "500/80": "rgba(239, 68, 68, 0.8)",
};

export const successColors: ColorScaleWithAlpha = {
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
  950: "#14532d",
  // 透明度变体
  "500/5": "rgba(34, 197, 94, 0.05)",
  "500/10": "rgba(34, 197, 94, 0.1)",
  "500/20": "rgba(34, 197, 94, 0.2)",
  "500/40": "rgba(34, 197, 94, 0.4)",
  "500/60": "rgba(34, 197, 94, 0.6)",
  "500/80": "rgba(34, 197, 94, 0.8)",
};

export const warningColors: ColorScaleWithAlpha = {
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
  950: "#78350f",
  // 透明度变体
  "500/5": "rgba(245, 158, 11, 0.05)",
  "500/10": "rgba(245, 158, 11, 0.1)",
  "500/20": "rgba(245, 158, 11, 0.2)",
  "500/40": "rgba(245, 158, 11, 0.4)",
  "500/60": "rgba(245, 158, 11, 0.6)",
  "500/80": "rgba(245, 158, 11, 0.8)",
};

// 玻璃拟态专用色彩
export const glassColors: GlassColors = {
  light: "rgba(255, 255, 255, 0.1)",
  medium: "rgba(255, 255, 255, 0.2)",
  heavy: "rgba(255, 255, 255, 0.3)",
  border: "rgba(255, 255, 255, 0.2)",
  "dark-light": "rgba(0, 0, 0, 0.1)",
  "dark-medium": "rgba(0, 0, 0, 0.2)",
  "dark-heavy": "rgba(0, 0, 0, 0.3)",
  "dark-border": "rgba(255, 255, 255, 0.1)",
};

// 发光效果色彩
export const glowColors: GlowColors = {
  blue: "rgba(59, 130, 246, 0.15)",
  red: "rgba(239, 68, 68, 0.15)",
  green: "rgba(34, 197, 94, 0.15)",
  purple: "rgba(147, 51, 234, 0.15)",
  yellow: "rgba(245, 158, 11, 0.15)",
};

// 完整的色彩令牌导出
export const colorTokens: ColorTokens = {
  primary: primaryColors,
  emergency: emergencyColors,
  success: successColors,
  warning: warningColors,
  glass: glassColors,
  glow: glowColors,
};

// 工具函数：获取色彩的透明度变体
export const getColorWithAlpha = (color: string, alpha: number): string => {
  // 简单的 hex 转 rgba 转换
  const hex = color.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// 工具函数：检查颜色对比度
export const getContrastRatio = (_color1: string, _color2: string): number => {
  // 简化的对比度计算，实际项目中应使用更精确的算法
  // 这里返回一个模拟值，实际实现需要完整的颜色对比度算法
  return 4.5; // WCAG AA 标准的最小对比度
};

// 工具函数：获取可访问的文本颜色
export const getAccessibleTextColor = (backgroundColor: string): string => {
  // 简化实现，实际应根据背景色亮度计算
  return backgroundColor.includes("rgba(0, 0, 0") ? "#ffffff" : "#000000";
};
