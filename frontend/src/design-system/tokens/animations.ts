/**
 * 设计令牌 - 动画系统
 * 动画时长、缓动函数和关键帧定义
 */

export interface AnimationDurations {
  instant: string;
  fast: string;
  normal: string;
  slow: string;
  slower: string;
}

export interface EasingFunctions {
  linear: string;
  easeIn: string;
  easeOut: string;
  easeInOut: string;
  // 自定义缓动函数
  bounce: string;
  elastic: string;
  smooth: string;
  sharp: string;
}

export interface AnimationTokens {
  durations: AnimationDurations;
  easings: EasingFunctions;
  keyframes: Record<string, Record<string, Record<string, string>>>;
}

// 动画时长定义
export const animationDurations: AnimationDurations = {
  instant: "0.1s",
  fast: "0.2s",
  normal: "0.3s",
  slow: "0.5s",
  slower: "0.8s",
};

// 缓动函数定义
export const easingFunctions: EasingFunctions = {
  linear: "linear",
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  easeOut: "cubic-bezier(0, 0, 0.2, 1)",
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  // 自定义缓动函数
  bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  elastic: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  smooth: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  sharp: "cubic-bezier(0.55, 0.085, 0.68, 0.53)",
};

// 关键帧动画定义
export const keyframes = {
  // 基础动画
  fadeIn: {
    "0%": { opacity: "0" },
    "100%": { opacity: "1" },
  },
  fadeOut: {
    "0%": { opacity: "1" },
    "100%": { opacity: "0" },
  },
  slideUp: {
    "0%": { transform: "translateY(10px)", opacity: "0" },
    "100%": { transform: "translateY(0)", opacity: "1" },
  },
  slideDown: {
    "0%": { transform: "translateY(-10px)", opacity: "0" },
    "100%": { transform: "translateY(0)", opacity: "1" },
  },
  slideLeft: {
    "0%": { transform: "translateX(10px)", opacity: "0" },
    "100%": { transform: "translateX(0)", opacity: "1" },
  },
  slideRight: {
    "0%": { transform: "translateX(-10px)", opacity: "0" },
    "100%": { transform: "translateX(0)", opacity: "1" },
  },
  scaleIn: {
    "0%": { transform: "scale(0.95)", opacity: "0" },
    "100%": { transform: "scale(1)", opacity: "1" },
  },
  scaleOut: {
    "0%": { transform: "scale(1)", opacity: "1" },
    "100%": { transform: "scale(0.95)", opacity: "0" },
  },

  // 玻璃拟态专用动画
  glowPulse: {
    "0%, 100%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.1)" },
    "50%": { boxShadow: "0 0 30px rgba(59, 130, 246, 0.2)" },
  },
  glassShimmer: {
    "0%": { backgroundPosition: "-200% 0" },
    "100%": { backgroundPosition: "200% 0" },
  },

  // 微交互动画
  ripple: {
    "0%": { transform: "scale(0)", opacity: "1" },
    "100%": { transform: "scale(4)", opacity: "0" },
  },
  bounceSubtle: {
    "0%, 100%": { transform: "translateY(0)" },
    "50%": { transform: "translateY(-2px)" },
  },
  float: {
    "0%, 100%": { transform: "translateY(0px)" },
    "50%": { transform: "translateY(-4px)" },
  },
  gradientShift: {
    "0%, 100%": { backgroundPosition: "0% 50%" },
    "50%": { backgroundPosition: "100% 50%" },
  },

  // 加载动画
  spin: {
    "0%": { transform: "rotate(0deg)" },
    "100%": { transform: "rotate(360deg)" },
  },
  pulse: {
    "0%, 100%": { opacity: "1" },
    "50%": { opacity: "0.5" },
  },

  // 高级动画
  morphIn: {
    "0%": {
      transform: "scale(0.8) rotate(-5deg)",
      opacity: "0",
      filter: "blur(4px)",
    },
    "100%": {
      transform: "scale(1) rotate(0deg)",
      opacity: "1",
      filter: "blur(0px)",
    },
  },
  elasticIn: {
    "0%": { transform: "scale(0)" },
    "50%": { transform: "scale(1.1)" },
    "100%": { transform: "scale(1)" },
  },
};

// 完整的动画令牌导出
export const animationTokens: AnimationTokens = {
  durations: animationDurations,
  easings: easingFunctions,
  keyframes,
};

// 预定义的动画组合
export const animationPresets = {
  // 入场动画
  enter: {
    fadeIn: `fadeIn ${animationDurations.normal} ${easingFunctions.easeOut}`,
    slideUp: `slideUp ${animationDurations.normal} ${easingFunctions.easeOut}`,
    scaleIn: `scaleIn ${animationDurations.fast} ${easingFunctions.easeOut}`,
    morphIn: `morphIn ${animationDurations.slow} ${easingFunctions.elastic}`,
  },

  // 退场动画
  exit: {
    fadeOut: `fadeOut ${animationDurations.fast} ${easingFunctions.easeIn}`,
    scaleOut: `scaleOut ${animationDurations.fast} ${easingFunctions.easeIn}`,
  },

  // 微交互动画
  interaction: {
    bounce: `bounceSubtle ${animationDurations.fast} ${easingFunctions.bounce}`,
    glow: `glowPulse 2s ${easingFunctions.easeInOut} infinite`,
    float: `float 3s ${easingFunctions.easeInOut} infinite`,
    ripple: `ripple 0.6s ${easingFunctions.linear}`,
  },

  // 加载动画
  loading: {
    spin: `spin 1s ${easingFunctions.linear} infinite`,
    pulse: `pulse 2s ${easingFunctions.easeInOut} infinite`,
    shimmer: `glassShimmer 3s ${easingFunctions.easeInOut} infinite`,
  },
};

// 工具函数：创建自定义动画
export const createAnimation = (
  keyframeName: string,
  duration: string = animationDurations.normal,
  easing: string = easingFunctions.easeOut,
  iterations: string | number = 1,
  delay: string = "0s"
): string => {
  return `${keyframeName} ${duration} ${easing} ${delay} ${iterations}`;
};

// 工具函数：检查用户动画偏好
export const respectsReducedMotion = (): boolean => {
  if (typeof window === "undefined") return false;

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

// 工具函数：获取适配的动画
export const getAccessibleAnimation = (
  normalAnimation: string,
  reducedAnimation?: string
): string => {
  if (respectsReducedMotion()) {
    return reducedAnimation || "none";
  }
  return normalAnimation;
};

// 工具函数：动画性能优化
export const optimizeAnimation = (element: HTMLElement): void => {
  // 启用硬件加速
  element.style.transform = "translateZ(0)";
  element.style.willChange = "transform, opacity";
};

// 工具函数：清理动画优化
export const cleanupAnimation = (element: HTMLElement): void => {
  element.style.willChange = "auto";
};
