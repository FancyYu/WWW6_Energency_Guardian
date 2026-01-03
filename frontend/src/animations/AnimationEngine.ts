/**
 * AnimationEngine - 核心动画管理器
 * 提供高性能的动画管理和性能监控
 */

export interface AnimationConfig {
  duration?: number;
  easing?: string;
  delay?: number;
  iterations?: number | "infinite";
  direction?: "normal" | "reverse" | "alternate" | "alternate-reverse";
  fillMode?: "none" | "forwards" | "backwards" | "both";
}

export interface HoverConfig extends AnimationConfig {
  scale?: number;
  glow?: boolean;
  glowColor?: string;
  translateY?: number;
  opacity?: number;
}

export interface ClickConfig extends AnimationConfig {
  ripple?: boolean;
  rippleColor?: string;
  scale?: number;
  feedback?: "subtle" | "medium" | "strong";
}

export interface FocusConfig extends AnimationConfig {
  ringColor?: string;
  ringWidth?: number;
  ringOffset?: number;
  glow?: boolean;
}

export interface EnterConfig extends AnimationConfig {
  from?: "top" | "bottom" | "left" | "right" | "center";
  distance?: number;
  scale?: number;
  opacity?: number;
  blur?: number;
}

export interface ExitConfig extends AnimationConfig {
  to?: "top" | "bottom" | "left" | "right" | "center";
  distance?: number;
  scale?: number;
  opacity?: number;
  blur?: number;
}

export interface MorphConfig extends AnimationConfig {
  morphType?: "position" | "size" | "shape" | "all";
  smoothing?: number;
}

export interface AnimationMetrics {
  fps: number;
  frameDrops: number;
  memoryUsage: number;
  activeAnimations: number;
  performanceScore: number;
}

export type AnimationPreference = "full" | "reduced" | "none";

export class AnimationEngine {
  private animations: Map<string, Animation> = new Map();
  private performanceObserver: PerformanceObserver | null = null;
  private frameRate: number = 60;
  private frameDrops: number = 0;
  private lastFrameTime: number = 0;
  private animationPreference: AnimationPreference = "full";

  constructor() {
    this.initializePerformanceMonitoring();
    this.detectUserPreferences();
    this.setupReducedMotionListener();
  }

  /**
   * 初始化性能监控
   */
  private initializePerformanceMonitoring(): void {
    if (typeof window === "undefined") return;

    // 监控帧率
    this.monitorFrameRate();

    // 监控长任务
    if ("PerformanceObserver" in window) {
      try {
        this.performanceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === "longtask") {
              this.frameDrops++;
            }
          });
        });
        this.performanceObserver.observe({ entryTypes: ["longtask"] });
      } catch (e) {
        console.warn("Performance monitoring not available:", e);
      }
    }
  }

  /**
   * 监控帧率
   */
  private monitorFrameRate(): void {
    const measureFrameRate = (timestamp: number) => {
      if (this.lastFrameTime) {
        const delta = timestamp - this.lastFrameTime;
        this.frameRate = Math.round(1000 / delta);
      }
      this.lastFrameTime = timestamp;
      requestAnimationFrame(measureFrameRate);
    };
    requestAnimationFrame(measureFrameRate);
  }

  /**
   * 检测用户动画偏好
   */
  private detectUserPreferences(): void {
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    this.animationPreference = prefersReducedMotion ? "reduced" : "full";
  }

  /**
   * 监听用户偏好变化
   */
  private setupReducedMotionListener(): void {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    mediaQuery.addEventListener("change", (e) => {
      this.animationPreference = e.matches ? "reduced" : "full";
    });
  }

  /**
   * 创建悬停动画
   */
  createHoverAnimation(element: HTMLElement, config: HoverConfig): Animation {
    if (!this.shouldAnimate()) return this.createNoOpAnimation();

    const {
      scale = 1.02,
      glow = false,
      glowColor = "rgba(59, 130, 246, 0.2)",
      translateY = -2,
      opacity = 1,
      duration = 300,
      easing = "cubic-bezier(0.4, 0, 0.2, 1)",
    } = config;

    const keyframes: Keyframe[] = [
      {
        transform: "scale(1) translateY(0px)",
        opacity: element.style.opacity || "1",
        boxShadow: element.style.boxShadow || "none",
      },
      {
        transform: `scale(${scale}) translateY(${translateY}px)`,
        opacity: opacity.toString(),
        boxShadow: glow
          ? `0 0 20px ${glowColor}`
          : element.style.boxShadow || "none",
      },
    ];

    const animation = element.animate(keyframes, {
      duration,
      easing,
      fill: "forwards",
    });

    this.registerAnimation(`hover-${element.id || Date.now()}`, animation);
    return animation;
  }

  /**
   * 创建点击动画
   */
  createClickAnimation(element: HTMLElement, config: ClickConfig): Animation {
    if (!this.shouldAnimate()) return this.createNoOpAnimation();

    const {
      ripple = true,
      rippleColor = "rgba(255, 255, 255, 0.3)",
      scale = 0.98,
      feedback = "medium",
      duration = 150,
      easing = "cubic-bezier(0.4, 0, 0.2, 1)",
    } = config;

    // 创建按压效果
    const pressKeyframes: Keyframe[] = [
      { transform: "scale(1)" },
      { transform: `scale(${scale})` },
      { transform: "scale(1)" },
    ];

    const pressAnimation = element.animate(pressKeyframes, {
      duration,
      easing,
    });

    // 创建涟漪效果
    if (ripple) {
      this.createRippleEffect(element, rippleColor, feedback);
    }

    this.registerAnimation(`click-${element.id || Date.now()}`, pressAnimation);
    return pressAnimation;
  }

  /**
   * 创建涟漪效果
   */
  private createRippleEffect(
    element: HTMLElement,
    color: string,
    _intensity: string
  ): void {
    const ripple = document.createElement("span");
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: ${color};
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
      left: 50%;
      top: 50%;
      width: ${size}px;
      height: ${size}px;
      margin-left: -${size / 2}px;
      margin-top: -${size / 2}px;
    `;

    element.style.position = element.style.position || "relative";
    element.style.overflow = "hidden";
    element.appendChild(ripple);

    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);
  }

  /**
   * 创建焦点动画
   */
  createFocusAnimation(element: HTMLElement, config: FocusConfig): Animation {
    if (!this.shouldAnimate()) return this.createNoOpAnimation();

    const {
      ringColor = "rgba(59, 130, 246, 0.5)",
      ringWidth = 2,
      ringOffset = 2,
      glow = true,
      duration = 200,
      easing = "cubic-bezier(0.4, 0, 0.2, 1)",
    } = config;

    const keyframes: Keyframe[] = [
      {
        outline: "none",
        boxShadow: "none",
      },
      {
        outline: `${ringWidth}px solid ${ringColor}`,
        outlineOffset: `${ringOffset}px`,
        boxShadow: glow
          ? `0 0 0 ${ringWidth + ringOffset}px ${ringColor}`
          : "none",
      },
    ];

    const animation = element.animate(keyframes, {
      duration,
      easing,
      fill: "forwards",
    });

    this.registerAnimation(`focus-${element.id || Date.now()}`, animation);
    return animation;
  }

  /**
   * 创建入场动画
   */
  createEnterAnimation(element: HTMLElement, config: EnterConfig): Animation {
    if (!this.shouldAnimate()) return this.createNoOpAnimation();

    const {
      from = "bottom",
      distance = 20,
      scale = 0.95,
      opacity = 0,
      blur = 0,
      duration = 500,
      easing = "cubic-bezier(0.4, 0, 0.2, 1)",
    } = config;

    const getTransform = (direction: string, dist: number, sc: number) => {
      const transforms = {
        top: `translateY(-${dist}px) scale(${sc})`,
        bottom: `translateY(${dist}px) scale(${sc})`,
        left: `translateX(-${dist}px) scale(${sc})`,
        right: `translateX(${dist}px) scale(${sc})`,
        center: `scale(${sc})`,
      };
      return (
        transforms[direction as keyof typeof transforms] || transforms.bottom
      );
    };

    const keyframes: Keyframe[] = [
      {
        transform: getTransform(from, distance, scale),
        opacity: opacity.toString(),
        filter: blur > 0 ? `blur(${blur}px)` : "none",
      },
      {
        transform: "translateY(0px) translateX(0px) scale(1)",
        opacity: "1",
        filter: "none",
      },
    ];

    const animation = element.animate(keyframes, {
      duration,
      easing,
      fill: "forwards",
    });

    this.registerAnimation(`enter-${element.id || Date.now()}`, animation);
    return animation;
  }

  /**
   * 创建退场动画
   */
  createExitAnimation(element: HTMLElement, config: ExitConfig): Animation {
    if (!this.shouldAnimate()) return this.createNoOpAnimation();

    const {
      to = "top",
      distance = 20,
      scale = 0.95,
      opacity = 0,
      blur = 4,
      duration = 300,
      easing = "cubic-bezier(0.4, 0, 0.2, 1)",
    } = config;

    const getTransform = (direction: string, dist: number, sc: number) => {
      const transforms = {
        top: `translateY(-${dist}px) scale(${sc})`,
        bottom: `translateY(${dist}px) scale(${sc})`,
        left: `translateX(-${dist}px) scale(${sc})`,
        right: `translateX(${dist}px) scale(${sc})`,
        center: `scale(${sc})`,
      };
      return transforms[direction as keyof typeof transforms] || transforms.top;
    };

    const keyframes: Keyframe[] = [
      {
        transform: "translateY(0px) translateX(0px) scale(1)",
        opacity: "1",
        filter: "none",
      },
      {
        transform: getTransform(to, distance, scale),
        opacity: opacity.toString(),
        filter: blur > 0 ? `blur(${blur}px)` : "none",
      },
    ];

    const animation = element.animate(keyframes, {
      duration,
      easing,
      fill: "forwards",
    });

    this.registerAnimation(`exit-${element.id || Date.now()}`, animation);
    return animation;
  }

  /**
   * 创建变形动画
   */
  createMorphAnimation(
    from: HTMLElement,
    to: HTMLElement,
    config: MorphConfig
  ): Animation {
    if (!this.shouldAnimate()) return this.createNoOpAnimation();

    const {
      morphType: _morphType = "all",
      duration = 400,
      easing = "cubic-bezier(0.4, 0, 0.2, 1)",
    } = config;

    const fromRect = from.getBoundingClientRect();
    const toRect = to.getBoundingClientRect();

    const keyframes: Keyframe[] = [
      {
        transform: `translate(${fromRect.left}px, ${fromRect.top}px) scale(${
          fromRect.width / toRect.width
        }, ${fromRect.height / toRect.height})`,
        opacity: "1",
      },
      {
        transform: `translate(${toRect.left}px, ${toRect.top}px) scale(1, 1)`,
        opacity: "1",
      },
    ];

    const animation = to.animate(keyframes, {
      duration,
      easing,
      fill: "forwards",
    });

    this.registerAnimation(`morph-${Date.now()}`, animation);
    return animation;
  }

  /**
   * 获取性能指标
   */
  getPerformanceMetrics(): AnimationMetrics {
    const memoryInfo = (performance as any).memory;

    return {
      fps: this.frameRate,
      frameDrops: this.frameDrops,
      memoryUsage: memoryInfo ? memoryInfo.usedJSHeapSize / 1024 / 1024 : 0,
      activeAnimations: this.animations.size,
      performanceScore: this.calculatePerformanceScore(),
    };
  }

  /**
   * 计算性能评分
   */
  private calculatePerformanceScore(): number {
    const fpsScore = Math.min(this.frameRate / 60, 1) * 40;
    const memoryScore =
      this.animations.size < 10 ? 30 : Math.max(0, 30 - this.animations.size);
    const dropScore = Math.max(0, 30 - this.frameDrops);

    return Math.round(fpsScore + memoryScore + dropScore);
  }

  /**
   * 优化动画性能
   */
  optimizeAnimations(): void {
    // 清理已完成的动画
    this.animations.forEach((animation, key) => {
      if (animation.playState === "finished") {
        this.animations.delete(key);
      }
    });

    // 根据性能调整动画质量
    const metrics = this.getPerformanceMetrics();
    if (metrics.performanceScore < 50) {
      this.animationPreference = "reduced";
    } else if (metrics.performanceScore > 80) {
      this.animationPreference = "full";
    }
  }

  /**
   * 检查是否应该执行动画
   */
  respectsReducedMotion(): boolean {
    return (
      this.animationPreference === "reduced" ||
      this.animationPreference === "none"
    );
  }

  /**
   * 设置动画偏好
   */
  setAnimationPreference(preference: AnimationPreference): void {
    this.animationPreference = preference;
  }

  /**
   * 判断是否应该播放动画
   */
  private shouldAnimate(): boolean {
    return this.animationPreference !== "none";
  }

  /**
   * 注册动画
   */
  private registerAnimation(key: string, animation: Animation): void {
    this.animations.set(key, animation);

    // 动画完成后自动清理
    animation.addEventListener("finish", () => {
      this.animations.delete(key);
    });
  }

  /**
   * 创建空操作动画（用于禁用动画时）
   */
  private createNoOpAnimation(): Animation {
    const dummyElement = document.createElement("div");
    return dummyElement.animate([], { duration: 0 });
  }

  /**
   * 销毁动画引擎
   */
  destroy(): void {
    // 停止所有动画
    this.animations.forEach((animation) => {
      animation.cancel();
    });
    this.animations.clear();

    // 清理性能监控
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }
}

// 单例实例
export const animationEngine = new AnimationEngine();
