/**
 * Animation System - 统一导出
 * 微交互动画引擎的中央导出点
 */

// 导出核心动画引擎
export { AnimationEngine, animationEngine } from "./AnimationEngine";
export { MicroInteractions, microInteractions } from "./MicroInteractions";
export { TransitionEngine, transitionEngine } from "./TransitionEngine";

// 导出类型定义
export type {
  AnimationConfig,
  HoverConfig,
  ClickConfig,
  FocusConfig,
  EnterConfig,
  ExitConfig,
  MorphConfig,
  AnimationMetrics,
  AnimationPreference,
} from "./AnimationEngine";

export type {
  PageTransitionConfig,
  ComponentTransitionConfig,
  ModalTransitionConfig,
} from "./TransitionEngine";

export type { MicroInteractionConfig } from "./MicroInteractions";

// 动画工具函数
export const animationUtils = {
  // 检查是否支持动画
  supportsAnimations: (): boolean => {
    return typeof window !== "undefined" && "animate" in HTMLElement.prototype;
  },

  // 检查是否支持硬件加速
  supportsHardwareAcceleration: (): boolean => {
    if (typeof window === "undefined") return false;

    const testElement = document.createElement("div");
    testElement.style.transform = "translateZ(0)";
    return testElement.style.transform !== "";
  },

  // 检查用户是否偏好减少动画
  prefersReducedMotion: (): boolean => {
    if (typeof window === "undefined") return false;

    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  },

  // 获取最佳动画持续时间
  getOptimalDuration: (baseMs: number): number => {
    if (animationUtils.prefersReducedMotion()) {
      return Math.min(baseMs * 0.5, 150); // 减少动画时间
    }
    return baseMs;
  },

  // 创建硬件加速的样式
  createHardwareAcceleratedStyle: (): Partial<CSSStyleDeclaration> => ({
    transform: "translateZ(0)",
    willChange: "transform, opacity",
    backfaceVisibility: "hidden",
    perspective: "1000px",
  }),

  // 应用硬件加速
  applyHardwareAcceleration: (element: HTMLElement): void => {
    const styles = animationUtils.createHardwareAcceleratedStyle();
    Object.assign(element.style, styles);
  },

  // 移除硬件加速
  removeHardwareAcceleration: (element: HTMLElement): void => {
    element.style.transform = "";
    element.style.willChange = "";
    element.style.backfaceVisibility = "";
    element.style.perspective = "";
  },
};

// 预设动画配置
export const animationPresets = {
  // 微交互预设
  hover: {
    subtle: {
      scale: 1.01,
      translateY: -1,
      duration: 200,
      glow: false,
    },

    medium: {
      scale: 1.02,
      translateY: -2,
      duration: 300,
      glow: true,
      glowColor: "rgba(59, 130, 246, 0.15)",
    },

    strong: {
      scale: 1.05,
      translateY: -4,
      duration: 400,
      glow: true,
      glowColor: "rgba(59, 130, 246, 0.25)",
    },
  },

  click: {
    subtle: {
      scale: 0.99,
      duration: 100,
      ripple: false,
      feedback: "subtle" as const,
    },

    medium: {
      scale: 0.98,
      duration: 150,
      ripple: true,
      rippleColor: "rgba(255, 255, 255, 0.3)",
      feedback: "medium" as const,
    },

    strong: {
      scale: 0.95,
      duration: 200,
      ripple: true,
      rippleColor: "rgba(255, 255, 255, 0.5)",
      feedback: "strong" as const,
    },
  },

  // 页面过渡预设
  pageTransition: {
    slide: {
      type: "slide" as const,
      direction: "right" as const,
      duration: 500,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    },

    fade: {
      type: "fade" as const,
      duration: 400,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    },

    scale: {
      type: "scale" as const,
      duration: 600,
      easing: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    },
  },

  // 组件过渡预设
  componentTransition: {
    fadeIn: {
      enter: {
        from: "center" as const,
        opacity: 0,
        scale: 0.95,
        duration: 300,
      },
      mode: "sequential" as const,
    },

    slideUp: {
      enter: {
        from: "bottom" as const,
        distance: 20,
        opacity: 0,
        duration: 400,
      },
      mode: "sequential" as const,
    },

    staggered: {
      enter: {
        from: "bottom" as const,
        distance: 15,
        opacity: 0,
        duration: 300,
      },
      mode: "sequential" as const,
      stagger: 100,
    },
  },
};

// 动画性能监控
export class AnimationPerformanceMonitor {
  private metrics: {
    frameDrops: number;
    averageFPS: number;
    memoryUsage: number;
    activeAnimations: number;
  } = {
    frameDrops: 0,
    averageFPS: 60,
    memoryUsage: 0,
    activeAnimations: 0,
  };

  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeMonitoring();
  }

  private initializeMonitoring(): void {
    if (typeof window === "undefined") return;

    // 监控长任务
    if ("PerformanceObserver" in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          this.metrics.frameDrops += entries.length;
        });
        longTaskObserver.observe({ entryTypes: ["longtask"] });
        this.observers.push(longTaskObserver);
      } catch (e) {
        console.warn("Long task monitoring not available:", e);
      }
    }

    // 监控内存使用
    this.monitorMemoryUsage();
  }

  private monitorMemoryUsage(): void {
    const updateMemory = () => {
      const memoryInfo = (performance as any).memory;
      if (memoryInfo) {
        this.metrics.memoryUsage = memoryInfo.usedJSHeapSize / 1024 / 1024;
      }
      setTimeout(updateMemory, 5000); // 每5秒更新一次
    };
    updateMemory();
  }

  getMetrics() {
    return { ...this.metrics };
  }

  updateActiveAnimations(count: number): void {
    this.metrics.activeAnimations = count;
  }

  updateFPS(fps: number): void {
    this.metrics.averageFPS = fps;
  }

  getPerformanceScore(): number {
    const fpsScore = Math.min(this.metrics.averageFPS / 60, 1) * 40;
    const memoryScore =
      this.metrics.memoryUsage < 50
        ? 30
        : Math.max(0, 30 - (this.metrics.memoryUsage - 50));
    const animationScore =
      this.metrics.activeAnimations < 10
        ? 20
        : Math.max(0, 20 - (this.metrics.activeAnimations - 10));
    const dropScore = Math.max(0, 10 - this.metrics.frameDrops);

    return Math.round(fpsScore + memoryScore + animationScore + dropScore);
  }

  cleanup(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}

// 全局性能监控实例
export const performanceMonitor = new AnimationPerformanceMonitor();

// 动画系统初始化
export const initializeAnimationSystem = (): void => {
  // 添加必要的CSS动画关键帧
  if (typeof document !== "undefined") {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes ripple {
        0% { transform: scale(0); opacity: 1; }
        100% { transform: scale(4); opacity: 0; }
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .animation-hardware-accelerated {
        transform: translateZ(0);
        will-change: transform, opacity;
        backface-visibility: hidden;
      }
      
      .animation-reduced-motion {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
      
      @media (prefers-reduced-motion: reduce) {
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // 初始化性能监控
  performanceMonitor;

  console.log("🎬 Animation System initialized");
};

// 自动初始化（如果在浏览器环境中）
if (typeof window !== "undefined") {
  // 等待DOM加载完成后初始化
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeAnimationSystem);
  } else {
    initializeAnimationSystem();
  }
}
