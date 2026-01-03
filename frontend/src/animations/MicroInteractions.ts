/**
 * MicroInteractions - 微交互动画集合
 * 提供常用的微交互动画效果
 */

import {
  animationEngine,
  type HoverConfig,
  type ClickConfig,
  type FocusConfig,
} from "./AnimationEngine";

export interface MicroInteractionConfig {
  element: HTMLElement;
  type: "hover" | "click" | "focus" | "loading" | "success" | "error";
  intensity?: "subtle" | "medium" | "strong";
  color?: string;
  duration?: number;
}

export class MicroInteractions {
  private activeInteractions: Map<HTMLElement, Animation[]> = new Map();

  /**
   * 应用悬停微交互
   */
  applyHoverEffect(
    element: HTMLElement,
    config: Partial<HoverConfig> = {}
  ): void {
    const defaultConfig: HoverConfig = {
      scale: 1.02,
      translateY: -2,
      glow: true,
      glowColor: "rgba(59, 130, 246, 0.15)",
      duration: 300,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    };

    const finalConfig = { ...defaultConfig, ...config };

    let hoverAnimation: Animation | null = null;
    let isHovered = false;

    const handleMouseEnter = () => {
      if (isHovered) return;
      isHovered = true;

      // 取消之前的动画
      if (hoverAnimation) {
        hoverAnimation.cancel();
      }

      hoverAnimation = animationEngine.createHoverAnimation(
        element,
        finalConfig
      );
      this.addInteraction(element, hoverAnimation);
    };

    const handleMouseLeave = () => {
      if (!isHovered) return;
      isHovered = false;

      // 创建反向动画
      const reverseConfig: HoverConfig = {
        ...finalConfig,
        scale: 1,
        translateY: 0,
        glow: false,
      };

      if (hoverAnimation) {
        hoverAnimation.cancel();
      }

      hoverAnimation = animationEngine.createHoverAnimation(
        element,
        reverseConfig
      );
      this.addInteraction(element, hoverAnimation);
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);

    // 存储清理函数
    this.storeCleanup(element, () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
    });
  }

  /**
   * 应用点击微交互
   */
  applyClickEffect(
    element: HTMLElement,
    config: Partial<ClickConfig> = {}
  ): void {
    const defaultConfig: ClickConfig = {
      ripple: true,
      rippleColor: "rgba(255, 255, 255, 0.3)",
      scale: 0.98,
      feedback: "medium",
      duration: 150,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    };

    const finalConfig = { ...defaultConfig, ...config };

    const handleClick = (_event: MouseEvent) => {
      const animation = animationEngine.createClickAnimation(
        element,
        finalConfig
      );
      this.addInteraction(element, animation);

      // 添加触觉反馈（如果支持）
      if ("vibrate" in navigator && finalConfig.feedback !== "subtle") {
        const vibrationPattern = {
          subtle: [10],
          medium: [20],
          strong: [30],
        };
        navigator.vibrate(vibrationPattern[finalConfig.feedback || "medium"]);
      }
    };

    element.addEventListener("click", handleClick);

    this.storeCleanup(element, () => {
      element.removeEventListener("click", handleClick);
    });
  }

  /**
   * 应用焦点微交互
   */
  applyFocusEffect(
    element: HTMLElement,
    config: Partial<FocusConfig> = {}
  ): void {
    const defaultConfig: FocusConfig = {
      ringColor: "rgba(59, 130, 246, 0.5)",
      ringWidth: 2,
      ringOffset: 2,
      glow: true,
      duration: 200,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    };

    const finalConfig = { ...defaultConfig, ...config };

    let focusAnimation: Animation | null = null;

    const handleFocus = () => {
      focusAnimation = animationEngine.createFocusAnimation(
        element,
        finalConfig
      );
      this.addInteraction(element, focusAnimation);
    };

    const handleBlur = () => {
      if (focusAnimation) {
        focusAnimation.reverse();
      }
    };

    element.addEventListener("focus", handleFocus);
    element.addEventListener("blur", handleBlur);

    this.storeCleanup(element, () => {
      element.removeEventListener("focus", handleFocus);
      element.removeEventListener("blur", handleBlur);
    });
  }

  /**
   * 应用加载动画
   */
  applyLoadingEffect(
    element: HTMLElement,
    config: { color?: string; size?: "sm" | "md" | "lg" } = {}
  ): Animation {
    const { color = "rgba(59, 130, 246, 0.8)", size = "md" } = config;

    // 创建加载指示器
    const loader = document.createElement("div");
    const sizeMap = { sm: "16px", md: "24px", lg: "32px" };

    loader.style.cssText = `
      width: ${sizeMap[size]};
      height: ${sizeMap[size]};
      border: 2px solid transparent;
      border-top: 2px solid ${color};
      border-radius: 50%;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation: spin 1s linear infinite;
      pointer-events: none;
    `;

    element.style.position = element.style.position || "relative";
    element.appendChild(loader);

    const animation = loader.animate(
      [
        { transform: "translate(-50%, -50%) rotate(0deg)" },
        { transform: "translate(-50%, -50%) rotate(360deg)" },
      ],
      {
        duration: 1000,
        iterations: Infinity,
        easing: "linear",
      }
    );

    this.addInteraction(element, animation);

    // 返回动画以便外部控制
    return animation;
  }

  /**
   * 应用成功动画
   */
  applySuccessEffect(
    element: HTMLElement,
    config: { color?: string; duration?: number } = {}
  ): Animation {
    const { color = "rgba(34, 197, 94, 0.8)", duration = 600 } = config;

    // 创建成功指示器
    const checkmark = document.createElement("div");
    checkmark.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="3">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
    `;

    checkmark.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0);
      pointer-events: none;
      z-index: 10;
    `;

    element.style.position = element.style.position || "relative";
    element.appendChild(checkmark);

    const animation = checkmark.animate(
      [
        {
          transform: "translate(-50%, -50%) scale(0) rotate(-180deg)",
          opacity: "0",
        },
        {
          transform: "translate(-50%, -50%) scale(1.2) rotate(0deg)",
          opacity: "1",
          offset: 0.6,
        },
        {
          transform: "translate(-50%, -50%) scale(1) rotate(0deg)",
          opacity: "1",
        },
      ],
      {
        duration,
        easing: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        fill: "forwards",
      }
    );

    // 自动清理
    setTimeout(() => {
      if (checkmark.parentNode) {
        checkmark.parentNode.removeChild(checkmark);
      }
    }, duration + 1000);

    this.addInteraction(element, animation);
    return animation;
  }

  /**
   * 应用错误动画
   */
  applyErrorEffect(
    element: HTMLElement,
    config: { color?: string; duration?: number } = {}
  ): Animation {
    const { color = "rgba(239, 68, 68, 0.8)", duration = 500 } = config;

    // 创建摇摆动画
    const animation = element.animate(
      [
        { transform: "translateX(0)" },
        { transform: "translateX(-10px)" },
        { transform: "translateX(10px)" },
        { transform: "translateX(-10px)" },
        { transform: "translateX(10px)" },
        { transform: "translateX(-5px)" },
        { transform: "translateX(5px)" },
        { transform: "translateX(0)" },
      ],
      {
        duration,
        easing: "cubic-bezier(0.36, 0.07, 0.19, 0.97)",
      }
    );

    // 添加错误颜色效果
    const originalBoxShadow = element.style.boxShadow;
    element.style.boxShadow = `0 0 0 2px ${color}`;

    setTimeout(() => {
      element.style.boxShadow = originalBoxShadow;
    }, duration);

    this.addInteraction(element, animation);
    return animation;
  }

  /**
   * 应用脉冲动画
   */
  applyPulseEffect(
    element: HTMLElement,
    config: { color?: string; duration?: number; intensity?: number } = {}
  ): Animation {
    const {
      color = "rgba(59, 130, 246, 0.3)",
      duration = 2000,
      intensity = 1.05,
    } = config;

    const animation = element.animate(
      [
        {
          transform: "scale(1)",
          boxShadow: `0 0 0 0 ${color}`,
        },
        {
          transform: `scale(${intensity})`,
          boxShadow: `0 0 0 10px transparent`,
        },
      ],
      {
        duration,
        iterations: Infinity,
        easing: "cubic-bezier(0.4, 0, 0.6, 1)",
      }
    );

    this.addInteraction(element, animation);
    return animation;
  }

  /**
   * 应用浮动动画
   */
  applyFloatEffect(
    element: HTMLElement,
    config: { distance?: number; duration?: number } = {}
  ): Animation {
    const { distance = 4, duration = 3000 } = config;

    const animation = element.animate(
      [
        { transform: "translateY(0px)" },
        { transform: `translateY(-${distance}px)` },
        { transform: "translateY(0px)" },
      ],
      {
        duration,
        iterations: Infinity,
        easing: "cubic-bezier(0.4, 0, 0.6, 1)",
      }
    );

    this.addInteraction(element, animation);
    return animation;
  }

  /**
   * 移除元素的所有微交互
   */
  removeInteractions(element: HTMLElement): void {
    const interactions = this.activeInteractions.get(element);
    if (interactions) {
      interactions.forEach((animation) => animation.cancel());
      this.activeInteractions.delete(element);
    }

    // 执行清理函数
    const cleanup = (element as any).__microInteractionCleanup;
    if (cleanup) {
      cleanup.forEach((fn: () => void) => fn());
      delete (element as any).__microInteractionCleanup;
    }
  }

  /**
   * 暂停元素的所有动画
   */
  pauseInteractions(element: HTMLElement): void {
    const interactions = this.activeInteractions.get(element);
    if (interactions) {
      interactions.forEach((animation) => animation.pause());
    }
  }

  /**
   * 恢复元素的所有动画
   */
  resumeInteractions(element: HTMLElement): void {
    const interactions = this.activeInteractions.get(element);
    if (interactions) {
      interactions.forEach((animation) => animation.play());
    }
  }

  /**
   * 添加交互动画到管理列表
   */
  private addInteraction(element: HTMLElement, animation: Animation): void {
    const interactions = this.activeInteractions.get(element) || [];
    interactions.push(animation);
    this.activeInteractions.set(element, interactions);

    // 动画完成后自动清理
    animation.addEventListener("finish", () => {
      const currentInteractions = this.activeInteractions.get(element) || [];
      const index = currentInteractions.indexOf(animation);
      if (index > -1) {
        currentInteractions.splice(index, 1);
        if (currentInteractions.length === 0) {
          this.activeInteractions.delete(element);
        } else {
          this.activeInteractions.set(element, currentInteractions);
        }
      }
    });
  }

  /**
   * 存储清理函数
   */
  private storeCleanup(element: HTMLElement, cleanup: () => void): void {
    if (!(element as any).__microInteractionCleanup) {
      (element as any).__microInteractionCleanup = [];
    }
    (element as any).__microInteractionCleanup.push(cleanup);
  }

  /**
   * 清理所有微交互
   */
  cleanup(): void {
    this.activeInteractions.forEach((_interactions, element) => {
      this.removeInteractions(element);
    });
    this.activeInteractions.clear();
  }
}

// 单例实例
export const microInteractions = new MicroInteractions();
