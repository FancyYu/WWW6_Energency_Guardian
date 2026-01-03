/**
 * 设计令牌 - 间距和尺寸系统
 * 统一的间距、尺寸和布局令牌
 */

export interface SpacingScale {
  0: string;
  px: string;
  0.5: string;
  1: string;
  1.5: string;
  2: string;
  2.5: string;
  3: string;
  3.5: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  10: string;
  11: string;
  12: string;
  14: string;
  16: string;
  20: string;
  24: string;
  28: string;
  32: string;
  36: string;
  40: string;
  44: string;
  48: string;
  52: string;
  56: string;
  60: string;
  64: string;
  72: string;
  80: string;
  96: string;
}

export interface BorderRadiusTokens {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
  "3xl": string;
  full: string;
}

export interface BreakpointTokens {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
}

export interface ZIndexTokens {
  auto: string;
  0: string;
  10: string;
  20: string;
  30: string;
  40: string;
  50: string;
  // 语义化层级
  dropdown: string;
  sticky: string;
  fixed: string;
  modal: string;
  popover: string;
  tooltip: string;
  toast: string;
}

export interface SpacingTokens {
  spacing: SpacingScale;
  borderRadius: BorderRadiusTokens;
  breakpoints: BreakpointTokens;
  zIndex: ZIndexTokens;
}

// 间距系统定义 (基于 4px 网格)
export const spacingScale: SpacingScale = {
  0: "0px",
  px: "1px",
  0.5: "2px",
  1: "4px",
  1.5: "6px",
  2: "8px",
  2.5: "10px",
  3: "12px",
  3.5: "14px",
  4: "16px",
  5: "20px",
  6: "24px",
  7: "28px",
  8: "32px",
  9: "36px",
  10: "40px",
  11: "44px",
  12: "48px",
  14: "56px",
  16: "64px",
  20: "80px",
  24: "96px",
  28: "112px",
  32: "128px",
  36: "144px",
  40: "160px",
  44: "176px",
  48: "192px",
  52: "208px",
  56: "224px",
  60: "240px",
  64: "256px",
  72: "288px",
  80: "320px",
  96: "384px",
};

// 圆角系统定义
export const borderRadiusTokens: BorderRadiusTokens = {
  none: "0px",
  sm: "2px",
  md: "6px",
  lg: "8px",
  xl: "12px",
  "2xl": "16px",
  "3xl": "24px",
  full: "9999px",
};

// 响应式断点定义
export const breakpointTokens: BreakpointTokens = {
  sm: "640px", // 移动端
  md: "768px", // 平板端
  lg: "1024px", // 桌面端
  xl: "1280px", // 大屏幕
  "2xl": "1536px", // 超大屏幕
};

// Z-index 层级定义
export const zIndexTokens: ZIndexTokens = {
  auto: "auto",
  0: "0",
  10: "10",
  20: "20",
  30: "30",
  40: "40",
  50: "50",
  // 语义化层级
  dropdown: "1000",
  sticky: "1020",
  fixed: "1030",
  modal: "1040",
  popover: "1050",
  tooltip: "1060",
  toast: "1070",
};

// 完整的间距令牌导出
export const spacingTokens: SpacingTokens = {
  spacing: spacingScale,
  borderRadius: borderRadiusTokens,
  breakpoints: breakpointTokens,
  zIndex: zIndexTokens,
};

// 语义化间距定义
export const semanticSpacing = {
  // 组件内部间距
  component: {
    xs: spacingScale[1], // 4px
    sm: spacingScale[2], // 8px
    md: spacingScale[4], // 16px
    lg: spacingScale[6], // 24px
    xl: spacingScale[8], // 32px
  },

  // 布局间距
  layout: {
    xs: spacingScale[4], // 16px
    sm: spacingScale[6], // 24px
    md: spacingScale[8], // 32px
    lg: spacingScale[12], // 48px
    xl: spacingScale[16], // 64px
    "2xl": spacingScale[24], // 96px
  },

  // 容器间距
  container: {
    sm: spacingScale[4], // 16px
    md: spacingScale[6], // 24px
    lg: spacingScale[8], // 32px
    xl: spacingScale[12], // 48px
  },
};

// 触摸友好的尺寸定义
export const touchTargets = {
  minimum: spacingScale[11], // 44px - iOS 最小触摸目标
  comfortable: spacingScale[12], // 48px - Android 推荐尺寸
  large: spacingScale[14], // 56px - 大尺寸触摸目标
};

// 工具函数：获取响应式间距
export const getResponsiveSpacing = (
  mobile: keyof SpacingScale,
  tablet?: keyof SpacingScale,
  desktop?: keyof SpacingScale
): Record<string, string> => {
  const result: Record<string, string> = {
    default: spacingScale[mobile],
  };

  if (tablet) {
    result[`@media (min-width: ${breakpointTokens.md})`] = spacingScale[tablet];
  }

  if (desktop) {
    result[`@media (min-width: ${breakpointTokens.lg})`] =
      spacingScale[desktop];
  }

  return result;
};

// 工具函数：检查是否为触摸设备
export const isTouchDevice = (): boolean => {
  if (typeof window === "undefined") return false;

  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};

// 工具函数：获取适配的触摸目标尺寸
export const getTouchTargetSize = (baseSize: string): string => {
  if (!isTouchDevice()) return baseSize;

  const baseSizeNum = parseInt(baseSize);
  const minTouchSize = parseInt(touchTargets.minimum);

  return baseSizeNum < minTouchSize ? touchTargets.minimum : baseSize;
};

// 工具函数：生成网格系统
export const createGrid = (
  columns: number = 12,
  gap: keyof SpacingScale = 6
): Record<string, string> => {
  const gridGap = spacingScale[gap];

  return {
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: gridGap,
  };
};

// 工具函数：生成 Flexbox 布局
export const createFlex = (
  direction: "row" | "column" = "row",
  justify:
    | "start"
    | "center"
    | "end"
    | "between"
    | "around"
    | "evenly" = "start",
  align: "start" | "center" | "end" | "stretch" = "start",
  gap: keyof SpacingScale = 4
): Record<string, string> => {
  const justifyMap = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    between: "space-between",
    around: "space-around",
    evenly: "space-evenly",
  };

  const alignMap = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    stretch: "stretch",
  };

  return {
    display: "flex",
    flexDirection: direction,
    justifyContent: justifyMap[justify],
    alignItems: alignMap[align],
    gap: spacingScale[gap],
  };
};
