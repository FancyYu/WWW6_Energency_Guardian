/**
 * 设计令牌 - 视觉效果系统
 * 阴影、模糊、渐变等视觉效果令牌
 */

export interface ShadowTokens {
  // 基础阴影
  soft: string;
  medium: string;
  large: string;

  // 发光效果阴影
  "glow-blue": string;
  "glow-red": string;
  "glow-green": string;
  "glow-purple": string;
  "glow-yellow": string;

  // 玻璃效果阴影
  "glass-light": string;
  "glass-medium": string;
  "glass-heavy": string;
}

export interface BlurTokens {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
  "3xl": string;
}

export interface GradientTokens {
  // 玻璃渐变
  "glass-light": string;
  "glass-dark": string;

  // 发光渐变
  "primary-glow": string;
  "emergency-glow": string;
  "success-glow": string;
  "warning-glow": string;

  // 纹理渐变
  "glass-texture": string;
  shimmer: string;
}

export interface BorderTokens {
  glass: string;
  glow: string;
  highlight: string;
  subtle: string;
}

export interface EffectTokens {
  shadows: ShadowTokens;
  blur: BlurTokens;
  gradients: GradientTokens;
  borders: BorderTokens;
}

// 阴影效果定义
export const shadowTokens: ShadowTokens = {
  // 基础阴影系统
  soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  medium:
    "0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  large: "0 10px 50px -12px rgba(0, 0, 0, 0.25)",

  // 发光效果阴影
  "glow-blue":
    "0 0 20px rgba(59, 130, 246, 0.15), 0 0 40px rgba(59, 130, 246, 0.1)",
  "glow-red":
    "0 0 20px rgba(239, 68, 68, 0.15), 0 0 40px rgba(239, 68, 68, 0.1)",
  "glow-green":
    "0 0 20px rgba(34, 197, 94, 0.15), 0 0 40px rgba(34, 197, 94, 0.1)",
  "glow-purple":
    "0 0 20px rgba(147, 51, 234, 0.15), 0 0 40px rgba(147, 51, 234, 0.1)",
  "glow-yellow":
    "0 0 20px rgba(245, 158, 11, 0.15), 0 0 40px rgba(245, 158, 11, 0.1)",

  // 玻璃效果阴影
  "glass-light": "0 8px 32px rgba(0, 0, 0, 0.1)",
  "glass-medium": "0 8px 32px rgba(0, 0, 0, 0.15)",
  "glass-heavy": "0 8px 32px rgba(0, 0, 0, 0.2)",
};

// 模糊效果定义
export const blurTokens: BlurTokens = {
  xs: "2px",
  sm: "4px",
  md: "8px",
  lg: "16px",
  xl: "24px",
  "2xl": "40px",
  "3xl": "64px",
};

// 渐变效果定义
export const gradientTokens: GradientTokens = {
  // 玻璃渐变背景
  "glass-light":
    "linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%)",
  "glass-dark":
    "linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 100%)",

  // 发光渐变
  "primary-glow":
    "linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.1) 100%)",
  "emergency-glow":
    "linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(239, 68, 68, 0.1) 100%)",
  "success-glow":
    "linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(34, 197, 94, 0.1) 100%)",
  "warning-glow":
    "linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(245, 158, 11, 0.1) 100%)",

  // 纹理渐变
  "glass-texture":
    "linear-gradient(45deg, rgba(255, 255, 255, 0.1) 25%, transparent 25%, transparent 75%, rgba(255, 255, 255, 0.1) 75%)",
  shimmer:
    "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)",
};

// 边框效果定义
export const borderTokens: BorderTokens = {
  glass: "1px solid rgba(255, 255, 255, 0.2)",
  glow: "1px solid rgba(59, 130, 246, 0.3)",
  highlight: "1px solid rgba(255, 255, 255, 0.4)",
  subtle: "1px solid rgba(0, 0, 0, 0.1)",
};

// 完整的效果令牌导出
export const effectTokens: EffectTokens = {
  shadows: shadowTokens,
  blur: blurTokens,
  gradients: gradientTokens,
  borders: borderTokens,
};

// 工具函数：生成自定义发光效果
export const createGlowShadow = (
  color: string,
  intensity: number = 0.15
): string => {
  const baseGlow = `0 0 20px ${color.replace(")", `, ${intensity})`)}`;
  const extendedGlow = `0 0 40px ${color.replace(
    ")",
    `, ${intensity * 0.6})`
  )}`;
  return `${baseGlow}, ${extendedGlow}`;
};

// 工具函数：生成玻璃效果 CSS
export const createGlassEffect = (
  intensity: "light" | "medium" | "heavy" = "medium",
  isDark: boolean = false
): Record<string, string> => {
  const blurMap = {
    light: blurTokens.sm,
    medium: blurTokens.md,
    heavy: blurTokens.lg,
  };

  const backgroundMap = {
    light: isDark ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)",
    medium: isDark ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.2)",
    heavy: isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(255, 255, 255, 0.3)",
  };

  return {
    background: backgroundMap[intensity],
    backdropFilter: `blur(${blurMap[intensity]})`,
    border: isDark
      ? borderTokens.glass.replace("255, 255, 255", "255, 255, 255")
      : borderTokens.glass,
    boxShadow: shadowTokens[`glass-${intensity}`],
  };
};

// 工具函数：检查浏览器支持
export const supportsBackdropFilter = (): boolean => {
  if (typeof window === "undefined") return false;

  const testElement = document.createElement("div");
  testElement.style.backdropFilter = "blur(1px)";
  return testElement.style.backdropFilter !== "";
};

// 工具函数：获取降级样式
export const getFallbackGlassEffect = (
  intensity: "light" | "medium" | "heavy" = "medium",
  isDark: boolean = false
): Record<string, string> => {
  const opacityMap = {
    light: isDark ? 0.8 : 0.9,
    medium: isDark ? 0.7 : 0.8,
    heavy: isDark ? 0.6 : 0.7,
  };

  return {
    background: isDark
      ? `rgba(0, 0, 0, ${opacityMap[intensity]})`
      : `rgba(255, 255, 255, ${opacityMap[intensity]})`,
    border: borderTokens.subtle,
    boxShadow: shadowTokens.soft,
  };
};
