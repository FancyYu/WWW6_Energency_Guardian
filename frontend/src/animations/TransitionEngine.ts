/**
 * TransitionEngine - 页面过渡动画引擎
 * 处理页面切换、路由过渡和组件转换动画
 */

import {
  animationEngine,
  type EnterConfig,
  type ExitConfig,
} from "./AnimationEngine";

export interface PageTransitionConfig {
  type: "slide" | "fade" | "scale" | "flip" | "cube" | "push";
  direction?: "left" | "right" | "up" | "down";
  duration?: number;
  easing?: string;
  stagger?: number;
}

export interface ComponentTransitionConfig {
  enter?: EnterConfig;
  exit?: ExitConfig;
  mode?: "parallel" | "sequential";
  stagger?: number;
}

export interface ModalTransitionConfig {
  backdrop?: boolean;
  backdropColor?: string;
  scale?: boolean;
  blur?: boolean;
  duration?: number;
}

export class TransitionEngine {
  private activeTransitions: Map<string, Animation[]> = new Map();
  private transitionQueue: Array<() => Promise<void>> = [];
  private isTransitioning = false;

  /**
   * 页面切换动画
   */
  async transitionPage(
    fromElement: HTMLElement,
    toElement: HTMLElement,
    config: PageTransitionConfig
  ): Promise<void> {
    const {
      type = "slide",
      direction = "right",
      duration = 500,
      easing = "cubic-bezier(0.4, 0, 0.2, 1)",
      stagger: _stagger = 0,
    } = config;

    this.isTransitioning = true;

    try {
      switch (type) {
        case "slide":
          await this.slideTransition(
            fromElement,
            toElement,
            direction,
            duration,
            easing
          );
          break;
        case "fade":
          await this.fadeTransition(fromElement, toElement, duration, easing);
          break;
        case "scale":
          await this.scaleTransition(fromElement, toElement, duration, easing);
          break;
        case "flip":
          await this.flipTransition(
            fromElement,
            toElement,
            direction,
            duration,
            easing
          );
          break;
        case "cube":
          await this.cubeTransition(
            fromElement,
            toElement,
            direction,
            duration,
            easing
          );
          break;
        case "push":
          await this.pushTransition(
            fromElement,
            toElement,
            direction,
            duration,
            easing
          );
          break;
        default:
          await this.fadeTransition(fromElement, toElement, duration, easing);
      }
    } finally {
      this.isTransitioning = false;
    }
  }

  /**
   * 滑动过渡
   */
  private async slideTransition(
    fromElement: HTMLElement,
    toElement: HTMLElement,
    direction: string,
    duration: number,
    easing: string
  ): Promise<void> {
    const getTransform = (dir: string, isExit: boolean) => {
      const multiplier = isExit ? 1 : -1;
      switch (dir) {
        case "left":
          return `translateX(${multiplier * 100}%)`;
        case "right":
          return `translateX(${multiplier * -100}%)`;
        case "up":
          return `translateY(${multiplier * 100}%)`;
        case "down":
          return `translateY(${multiplier * -100}%)`;
        default:
          return `translateX(${multiplier * -100}%)`;
      }
    };

    // 设置初始状态
    toElement.style.transform = getTransform(direction, false);
    toElement.style.opacity = "1";

    // 创建动画
    fromElement.animate(
      [
        { transform: "translateX(0)", opacity: "1" },
        { transform: getTransform(direction, true), opacity: "0" },
      ],
      { duration, easing, fill: "forwards" }
    );

    const enterAnimation = toElement.animate(
      [
        { transform: getTransform(direction, false), opacity: "1" },
        { transform: "translateX(0)", opacity: "1" },
      ],
      { duration, easing, fill: "forwards" }
    );

    // 等待动画完成
    await Promise.all([
      new Promise<void>((resolve) =>
        enterAnimation.addEventListener("finish", () => resolve())
      ),
    ]);
  }

  /**
   * 淡入淡出过渡
   */
  private async fadeTransition(
    fromElement: HTMLElement,
    toElement: HTMLElement,
    duration: number,
    easing: string
  ): Promise<void> {
    // 设置初始状态
    toElement.style.opacity = "0";

    // 创建动画
    fromElement.animate([{ opacity: "1" }, { opacity: "0" }], {
      duration: duration / 2,
      easing,
      fill: "forwards",
    });

    // 等待退出动画完成一半后开始进入动画
    setTimeout(() => {
      toElement.animate([{ opacity: "0" }, { opacity: "1" }], {
        duration: duration / 2,
        easing,
        fill: "forwards",
      });
    }, duration / 4);

    await new Promise((resolve) => setTimeout(resolve, duration));
  }

  /**
   * 缩放过渡
   */
  private async scaleTransition(
    fromElement: HTMLElement,
    toElement: HTMLElement,
    duration: number,
    easing: string
  ): Promise<void> {
    // 设置初始状态
    toElement.style.transform = "scale(0.8)";
    toElement.style.opacity = "0";

    // 创建动画
    fromElement.animate(
      [
        { transform: "scale(1)", opacity: "1" },
        { transform: "scale(1.1)", opacity: "0" },
      ],
      { duration: duration / 2, easing, fill: "forwards" }
    );

    setTimeout(() => {
      toElement.animate(
        [
          { transform: "scale(0.8)", opacity: "0" },
          { transform: "scale(1)", opacity: "1" },
        ],
        { duration: duration / 2, easing, fill: "forwards" }
      );
    }, duration / 4);

    await new Promise((resolve) => setTimeout(resolve, duration));
  }

  /**
   * 翻转过渡
   */
  private async flipTransition(
    fromElement: HTMLElement,
    toElement: HTMLElement,
    direction: string,
    duration: number,
    easing: string
  ): Promise<void> {
    const axis = direction === "left" || direction === "right" ? "Y" : "X";
    const angle = direction === "left" || direction === "up" ? -180 : 180;

    // 设置3D变换上下文
    const container = fromElement.parentElement;
    if (container) {
      container.style.perspective = "1000px";
    }

    // 创建动画
    fromElement.animate(
      [
        { transform: `rotate${axis}(0deg)` },
        { transform: `rotate${axis}(${angle / 2}deg)` },
      ],
      { duration: duration / 2, easing, fill: "forwards" }
    );

    setTimeout(() => {
      toElement.style.transform = `rotate${axis}(${-angle / 2}deg)`;
      toElement.animate(
        [
          { transform: `rotate${axis}(${-angle / 2}deg)` },
          { transform: `rotate${axis}(0deg)` },
        ],
        { duration: duration / 2, easing, fill: "forwards" }
      );
    }, duration / 2);

    await new Promise((resolve) => setTimeout(resolve, duration));
  }

  /**
   * 立方体过渡
   */
  private async cubeTransition(
    fromElement: HTMLElement,
    toElement: HTMLElement,
    direction: string,
    duration: number,
    easing: string
  ): Promise<void> {
    const container = fromElement.parentElement;
    if (!container) return;

    // 设置3D变换上下文
    container.style.perspective = "1000px";
    container.style.transformStyle = "preserve-3d";

    const getTransform = (dir: string, isExit: boolean) => {
      const angle = isExit ? -90 : 90;
      switch (dir) {
        case "left":
          return `rotateY(${angle}deg)`;
        case "right":
          return `rotateY(${-angle}deg)`;
        case "up":
          return `rotateX(${-angle}deg)`;
        case "down":
          return `rotateX(${angle}deg)`;
        default:
          return `rotateY(${-angle}deg)`;
      }
    };

    // 设置初始状态
    toElement.style.transform = getTransform(direction, false);

    // 创建动画
    fromElement.animate(
      [
        { transform: "rotateY(0deg)" },
        { transform: getTransform(direction, true) },
      ],
      { duration, easing, fill: "forwards" }
    );

    const enterAnimation = toElement.animate(
      [
        { transform: getTransform(direction, false) },
        { transform: "rotateY(0deg)" },
      ],
      { duration, easing, fill: "forwards" }
    );

    await Promise.all([
      new Promise<void>((resolve) =>
        enterAnimation.addEventListener("finish", () => resolve())
      ),
    ]);
  }

  /**
   * 推送过渡
   */
  private async pushTransition(
    fromElement: HTMLElement,
    toElement: HTMLElement,
    direction: string,
    duration: number,
    easing: string
  ): Promise<void> {
    const getTransform = (dir: string) => {
      switch (dir) {
        case "left":
          return "translateX(-100%)";
        case "right":
          return "translateX(100%)";
        case "up":
          return "translateY(-100%)";
        case "down":
          return "translateY(100%)";
        default:
          return "translateX(100%)";
      }
    };

    // 设置初始状态
    toElement.style.transform = getTransform(direction);

    // 创建同步动画
    fromElement.animate(
      [
        { transform: "translateX(0)" },
        { transform: getTransform(direction === "left" ? "right" : "left") },
      ],
      { duration, easing, fill: "forwards" }
    );

    const enterAnimation = toElement.animate(
      [{ transform: getTransform(direction) }, { transform: "translateX(0)" }],
      { duration, easing, fill: "forwards" }
    );

    await Promise.all([
      new Promise<void>((resolve) =>
        enterAnimation.addEventListener("finish", () => resolve())
      ),
    ]);
  }

  /**
   * 组件过渡动画
   */
  async transitionComponent(
    element: HTMLElement,
    config: ComponentTransitionConfig
  ): Promise<void> {
    const {
      enter = { from: "bottom", distance: 20, duration: 300 },
      exit = { to: "top", distance: 20, duration: 200 },
      mode = "sequential",
      stagger: _stagger2 = 0,
    } = config;

    if (mode === "parallel") {
      // 并行执行进入和退出动画
      const enterAnimation = animationEngine.createEnterAnimation(
        element,
        enter
      );
      await new Promise((resolve) =>
        enterAnimation.addEventListener("finish", resolve)
      );
    } else {
      // 顺序执行
      const exitAnimation = animationEngine.createExitAnimation(element, exit);
      await new Promise((resolve) =>
        exitAnimation.addEventListener("finish", resolve)
      );

      if (_stagger2 > 0) {
        await new Promise((resolve) => setTimeout(resolve, _stagger2));
      }

      const enterAnimation = animationEngine.createEnterAnimation(
        element,
        enter
      );
      await new Promise((resolve) =>
        enterAnimation.addEventListener("finish", resolve)
      );
    }
  }

  /**
   * 模态框过渡动画
   */
  async transitionModal(
    modalElement: HTMLElement,
    backdropElement: HTMLElement | null,
    isOpening: boolean,
    config: ModalTransitionConfig = {}
  ): Promise<void> {
    const {
      backdrop = true,
      backdropColor = "rgba(0, 0, 0, 0.5)",
      scale = true,
      blur = true,
      duration = 300,
    } = config;

    if (isOpening) {
      // 打开模态框
      if (backdropElement && backdrop) {
        backdropElement.style.backgroundColor = "transparent";
        backdropElement.animate(
          [
            { backgroundColor: "transparent" },
            { backgroundColor: backdropColor },
          ],
          { duration, fill: "forwards" }
        );
      }

      // 模态框动画
      const modalKeyframes: Keyframe[] = [
        {
          transform: scale ? "scale(0.9)" : "scale(1)",
          opacity: "0",
          filter: blur ? "blur(4px)" : "none",
        },
        {
          transform: "scale(1)",
          opacity: "1",
          filter: "none",
        },
      ];

      const modalAnimation = modalElement.animate(modalKeyframes, {
        duration,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        fill: "forwards",
      });

      await new Promise<void>((resolve) =>
        modalAnimation.addEventListener("finish", () => resolve())
      );
    } else {
      // 关闭模态框
      const modalKeyframes: Keyframe[] = [
        {
          transform: "scale(1)",
          opacity: "1",
          filter: "none",
        },
        {
          transform: scale ? "scale(0.9)" : "scale(1)",
          opacity: "0",
          filter: blur ? "blur(4px)" : "none",
        },
      ];

      const animations: Promise<void>[] = [];

      // 模态框动画
      const modalAnimation = modalElement.animate(modalKeyframes, {
        duration,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        fill: "forwards",
      });
      animations.push(
        new Promise<void>((resolve) =>
          modalAnimation.addEventListener("finish", () => resolve())
        )
      );

      // 背景动画
      if (backdropElement && backdrop) {
        const backdropAnimation = backdropElement.animate(
          [
            { backgroundColor: backdropColor },
            { backgroundColor: "transparent" },
          ],
          { duration, fill: "forwards" }
        );
        animations.push(
          new Promise<void>((resolve) =>
            backdropAnimation.addEventListener("finish", () => resolve())
          )
        );
      }

      await Promise.all(animations);
    }
  }

  /**
   * 列表项交错动画
   */
  async staggerListItems(
    items: HTMLElement[],
    config: {
      delay?: number;
      duration?: number;
      from?: "top" | "bottom" | "left" | "right";
    } = {}
  ): Promise<void> {
    const { delay = 100, duration = 300, from = "bottom" } = config;

    const animations = items.map((item, index) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const enterConfig: EnterConfig = {
            from,
            distance: 20,
            duration,
            opacity: 0,
          };

          const animation = animationEngine.createEnterAnimation(
            item,
            enterConfig
          );
          animation.addEventListener("finish", () => resolve());
        }, index * delay);
      });
    });

    await Promise.all(animations);
  }

  /**
   * 检查是否正在过渡
   */
  isTransitionActive(): boolean {
    return this.isTransitioning;
  }

  /**
   * 取消所有活动的过渡
   */
  cancelAllTransitions(): void {
    this.activeTransitions.forEach((animations) => {
      animations.forEach((animation) => animation.cancel());
    });
    this.activeTransitions.clear();
    this.isTransitioning = false;
  }

  /**
   * 清理过渡引擎
   */
  cleanup(): void {
    this.cancelAllTransitions();
    this.transitionQueue.length = 0;
  }
}

// 单例实例
export const transitionEngine = new TransitionEngine();
