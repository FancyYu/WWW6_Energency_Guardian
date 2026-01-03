/**
 * 设计令牌系统 - 统一导出接口
 * 所有设计令牌的中央导出点
 */

// 导入所有令牌模块
export * from "./colors";
export * from "./effects";
export * from "./animations";
export * from "./spacing";

// 重新导出主要接口
export type {
  ColorTokens,
  ColorScale,
  ColorScaleWithAlpha,
  GlassColors,
  GlowColors,
} from "./colors";

export type {
  EffectTokens,
  ShadowTokens,
  BlurTokens,
  GradientTokens,
  BorderTokens,
} from "./effects";

export type {
  AnimationTokens,
  AnimationDurations,
  EasingFunctions,
} from "./animations";

export type {
  SpacingTokens,
  SpacingScale,
  BorderRadiusTokens,
  BreakpointTokens,
  ZIndexTokens,
} from "./spacing";

// 导入所有令牌实例
import { colorTokens } from "./colors";
import { effectTokens } from "./effects";
import { animationTokens } from "./animations";
import { spacingTokens } from "./spacing";

// 完整的设计系统令牌
export interface DesignTokens {
  colors: typeof colorTokens;
  effects: typeof effectTokens;
  animations: typeof animationTokens;
  spacing: typeof spacingTokens;
}

// 统一的设计令牌导出
export const designTokens: DesignTokens = {
  colors: colorTokens,
  effects: effectTokens,
  animations: animationTokens,
  spacing: spacingTokens,
};

// 默认导出
export default designTokens;

// 工具函数：获取令牌值
export const getToken = (path: string): string => {
  const keys = path.split(".");
  let value: any = designTokens;

  for (const key of keys) {
    if (value && typeof value === "object" && key in value) {
      value = value[key];
    } else {
      console.warn(`Design token not found: ${path}`);
      return "";
    }
  }

  return typeof value === "string" ? value : "";
};

// 工具函数：验证令牌路径
export const validateTokenPath = (path: string): boolean => {
  const keys = path.split(".");
  let value: any = designTokens;

  for (const key of keys) {
    if (value && typeof value === "object" && key in value) {
      value = value[key];
    } else {
      return false;
    }
  }

  return typeof value === "string";
};

// 常用令牌快捷访问
export const tokens = {
  // 颜色快捷访问
  color: {
    primary: colorTokens.primary[500],
    emergency: colorTokens.emergency[500],
    success: colorTokens.success[500],
    warning: colorTokens.warning[500],
  },

  // 间距快捷访问
  space: {
    xs: spacingTokens.spacing[2],
    sm: spacingTokens.spacing[4],
    md: spacingTokens.spacing[6],
    lg: spacingTokens.spacing[8],
    xl: spacingTokens.spacing[12],
  },

  // 圆角快捷访问
  radius: {
    sm: spacingTokens.borderRadius.sm,
    md: spacingTokens.borderRadius.md,
    lg: spacingTokens.borderRadius.lg,
    xl: spacingTokens.borderRadius.xl,
  },

  // 阴影快捷访问
  shadow: {
    soft: effectTokens.shadows.soft,
    medium: effectTokens.shadows.medium,
    large: effectTokens.shadows.large,
  },

  // 动画快捷访问
  duration: {
    fast: animationTokens.durations.fast,
    normal: animationTokens.durations.normal,
    slow: animationTokens.durations.slow,
  },
};

// 类型安全的令牌访问器
export const createTokenAccessor = <T extends keyof DesignTokens>(
  category: T
) => {
  return (path: string): string => {
    return getToken(`${category}.${path}`);
  };
};

// 预定义的访问器
export const getColorToken = createTokenAccessor("colors");
export const getEffectToken = createTokenAccessor("effects");
export const getAnimationToken = createTokenAccessor("animations");
export const getSpacingToken = createTokenAccessor("spacing");
