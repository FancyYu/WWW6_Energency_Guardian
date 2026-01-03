/**
 * Animation Hooks - React集成钩子
 * 为React组件提供动画功能的自定义钩子
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { microInteractions } from "./MicroInteractions";
import { animationEngine } from "./AnimationEngine";
import { transitionEngine } from "./TransitionEngine";
import { animationPresets, animationUtils } from "./index";
import type {
  HoverConfig,
  ClickConfig,
  FocusConfig,
  EnterConfig,
  ExitConfig,
  PageTransitionConfig,
  ComponentTransitionConfig,
} from "./index";

/**
 * 微交互钩子 - 为元素添加悬停、点击、焦点效果
 */
export const useMicroInteractions = (
  config: {
    hover?: boolean | Partial<HoverConfig>;
    click?: boolean | Partial<ClickConfig>;
    focus?: boolean | Partial<FocusConfig>;
    intensity?: "subtle" | "medium" | "strong";
  } = {}
) => {
  const elementRef = useRef<HTMLElement>(null);
  const {
    hover = false,
    click = false,
    focus = false,
    intensity = "medium",
  } = config;

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !animationUtils.supportsAnimations()) return;

    // 应用悬停效果
    if (hover) {
      const hoverConfig =
        typeof hover === "boolean"
          ? animationPresets.hover[intensity]
          : { ...animationPresets.hover[intensity], ...hover };

      microInteractions.applyHoverEffect(element, hoverConfig);
    }

    // 应用点击效果
    if (click) {
      const clickConfig =
        typeof click === "boolean"
          ? animationPresets.click[intensity]
          : { ...animationPresets.click[intensity], ...click };

      microInteractions.applyClickEffect(element, clickConfig);
    }

    // 应用焦点效果
    if (focus) {
      const focusConfig = typeof focus === "boolean" ? {} : focus;

      microInteractions.applyFocusEffect(element, focusConfig);
    }

    // 清理函数
    return () => {
      if (element) {
        microInteractions.removeInteractions(element);
      }
    };
  }, [hover, click, focus, intensity]);

  return elementRef;
};

/**
 * 入场动画钩子 - 组件挂载时的动画效果
 */
export const useEnterAnimation = (
  config: Partial<EnterConfig> & {
    enabled?: boolean;
    delay?: number;
  } = {}
) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { enabled = true, delay = 0, ...animationConfig } = config;

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled || !animationUtils.supportsAnimations()) {
      setIsVisible(true);
      return;
    }

    const runAnimation = () => {
      const enterConfig: EnterConfig = {
        from: "bottom",
        distance: 20,
        opacity: 0,
        duration: animationUtils.getOptimalDuration(300),
        ...animationConfig,
      };

      const animation = animationEngine.createEnterAnimation(
        element,
        enterConfig
      );
      animation.addEventListener("finish", () => setIsVisible(true));
    };

    if (delay > 0) {
      const timer = setTimeout(runAnimation, delay);
      return () => clearTimeout(timer);
    } else {
      runAnimation();
    }
  }, [enabled, delay, animationConfig]);

  return { elementRef, isVisible };
};

/**
 * 退场动画钩子 - 组件卸载时的动画效果
 */
export const useExitAnimation = (
  config: Partial<ExitConfig> & {
    enabled?: boolean;
    onComplete?: () => void;
  } = {}
) => {
  const elementRef = useRef<HTMLElement>(null);
  const [isExiting, setIsExiting] = useState(false);
  const { enabled = true, onComplete, ...animationConfig } = config;

  const triggerExit = useCallback(() => {
    const element = elementRef.current;
    if (!element || !enabled || !animationUtils.supportsAnimations()) {
      onComplete?.();
      return;
    }

    setIsExiting(true);

    const exitConfig: ExitConfig = {
      to: "top",
      distance: 20,
      opacity: 0,
      duration: animationUtils.getOptimalDuration(200),
      ...animationConfig,
    };

    const animation = animationEngine.createExitAnimation(element, exitConfig);
    animation.addEventListener("finish", () => {
      setIsExiting(false);
      onComplete?.();
    });
  }, [enabled, onComplete, animationConfig]);

  return { elementRef, isExiting, triggerExit };
};

/**
 * 页面过渡钩子 - 页面切换动画
 */
export const usePageTransition = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const transitionTo = useCallback(
    async (
      fromElement: HTMLElement,
      toElement: HTMLElement,
      config: PageTransitionConfig = animationPresets.pageTransition.slide
    ) => {
      if (!animationUtils.supportsAnimations()) return;

      setIsTransitioning(true);
      try {
        await transitionEngine.transitionPage(fromElement, toElement, config);
      } finally {
        setIsTransitioning(false);
      }
    },
    []
  );

  return { isTransitioning, transitionTo };
};

/**
 * 加载动画钩子 - 加载状态动画
 */
export const useLoadingAnimation = (
  isLoading: boolean,
  config: {
    color?: string;
    size?: "sm" | "md" | "lg";
  } = {}
) => {
  const elementRef = useRef<HTMLElement>(null);
  const animationRef = useRef<Animation | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (isLoading && animationUtils.supportsAnimations()) {
      animationRef.current = microInteractions.applyLoadingEffect(
        element,
        config
      );
    } else if (animationRef.current) {
      animationRef.current.cancel();
      animationRef.current = null;

      // 清理加载指示器
      const loader = element.querySelector('[style*="animation: spin"]');
      if (loader && loader.parentNode) {
        loader.parentNode.removeChild(loader);
      }
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.cancel();
      }
    };
  }, [isLoading, config]);

  return elementRef;
};

/**
 * 成功动画钩子 - 成功状态动画
 */
export const useSuccessAnimation = (
  config: {
    color?: string;
    duration?: number;
  } = {}
) => {
  const elementRef = useRef<HTMLElement>(null);

  const triggerSuccess = useCallback(() => {
    const element = elementRef.current;
    if (!element || !animationUtils.supportsAnimations()) return;

    return microInteractions.applySuccessEffect(element, config);
  }, [config]);

  return { elementRef, triggerSuccess };
};

/**
 * 错误动画钩子 - 错误状态动画
 */
export const useErrorAnimation = (
  config: {
    color?: string;
    duration?: number;
  } = {}
) => {
  const elementRef = useRef<HTMLElement>(null);

  const triggerError = useCallback(() => {
    const element = elementRef.current;
    if (!element || !animationUtils.supportsAnimations()) return;

    return microInteractions.applyErrorEffect(element, config);
  }, [config]);

  return { elementRef, triggerError };
};

/**
 * 脉冲动画钩子 - 持续脉冲效果
 */
export const usePulseAnimation = (
  enabled: boolean,
  config: {
    color?: string;
    duration?: number;
    intensity?: number;
  } = {}
) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (enabled && animationUtils.supportsAnimations()) {
      animationRef.current = microInteractions.applyPulseEffect(
        element,
        config
      );
    } else if (animationRef.current) {
      animationRef.current.cancel();
      animationRef.current = null;
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.cancel();
      }
    };
  }, [enabled, config]);

  return elementRef;
};

/**
 * 浮动动画钩子 - 持续浮动效果
 */
export const useFloatAnimation = (
  enabled: boolean,
  config: {
    distance?: number;
    duration?: number;
  } = {}
) => {
  const elementRef = useRef<HTMLElement>(null);
  const animationRef = useRef<Animation | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (enabled && animationUtils.supportsAnimations()) {
      animationRef.current = microInteractions.applyFloatEffect(
        element,
        config
      );
    } else if (animationRef.current) {
      animationRef.current.cancel();
      animationRef.current = null;
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.cancel();
      }
    };
  }, [enabled, config]);

  return elementRef;
};

/**
 * 交错动画钩子 - 列表项交错动画
 */
export const useStaggerAnimation = (
  items: HTMLElement[],
  config: {
    delay?: number;
    duration?: number;
    from?: "top" | "bottom" | "left" | "right";
    enabled?: boolean;
  } = {}
) => {
  const { enabled = true, ...staggerConfig } = config;

  useEffect(() => {
    if (!enabled || items.length === 0 || !animationUtils.supportsAnimations())
      return;

    transitionEngine.staggerListItems(items, staggerConfig);
  }, [items, enabled, staggerConfig]);
};

/**
 * 组件过渡钩子 - 组件状态变化动画
 */
export const useComponentTransition = (
  config: ComponentTransitionConfig = animationPresets.componentTransition
    .fadeIn
) => {
  const elementRef = useRef<HTMLElement>(null);

  const triggerTransition = useCallback(async () => {
    const element = elementRef.current;
    if (!element || !animationUtils.supportsAnimations()) return;

    await transitionEngine.transitionComponent(element, config);
  }, [config]);

  return { elementRef, triggerTransition };
};

/**
 * 性能优化钩子 - 动画性能监控和优化
 */
export const useAnimationPerformance = () => {
  const [performanceMode, setPerformanceMode] = useState<
    "high" | "medium" | "low"
  >("high");
  const [metrics, setMetrics] = useState({
    fps: 60,
    frameDrops: 0,
    memoryUsage: 0,
    activeAnimations: 0,
  });

  useEffect(() => {
    const updateMetrics = () => {
      const engineMetrics = animationEngine.getPerformanceMetrics();
      setMetrics(engineMetrics);

      // 根据性能自动调整模式
      if (engineMetrics.performanceScore < 50) {
        setPerformanceMode("low");
      } else if (engineMetrics.performanceScore < 75) {
        setPerformanceMode("medium");
      } else {
        setPerformanceMode("high");
      }
    };

    const interval = setInterval(updateMetrics, 2000);
    return () => clearInterval(interval);
  }, []);

  const optimizeAnimations = useCallback(() => {
    animationEngine.optimizeAnimations();
  }, []);

  return {
    performanceMode,
    metrics,
    optimizeAnimations,
    setPerformanceMode,
  };
};
