/**
 * GlassButton 组件 - 玻璃拟态按钮
 * 支持发光效果、涟漪动画和多种变体
 * 集成微交互动画引擎
 */

import React, {
  forwardRef,
  type ButtonHTMLAttributes,
  useState,
  useRef,
  useEffect,
} from "react";
import { cn } from "../../utils/cn";
import {
  useMicroInteractions,
  useLoadingAnimation,
} from "../../animations/hooks";

export interface GlassButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "emergency" | "success" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  glow?: boolean;
  ripple?: boolean;
  loading?: boolean;

  // 玻璃效果属性
  glassIntensity?: "light" | "medium" | "heavy";

  // 动画属性
  animationIntensity?: "subtle" | "medium" | "strong";
  enableAnimations?: boolean;

  // 事件处理
  onHover?: (isHovered: boolean) => void;

  // 内容
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// 按钮变体映射
const buttonVariants = {
  primary: {
    base: "bg-primary-500/20 border-primary-500/40 text-primary-100 hover:bg-primary-500/30",
    glow: "shadow-glow-blue hover:shadow-glow-blue",
  },
  secondary: {
    base: "bg-glass-medium border-glass-border text-gray-100 hover:bg-glass-heavy",
    glow: "shadow-soft hover:shadow-medium",
  },
  emergency: {
    base: "bg-emergency-500/20 border-emergency-500/40 text-emergency-100 hover:bg-emergency-500/30",
    glow: "shadow-glow-red hover:shadow-glow-red",
  },
  success: {
    base: "bg-success-500/20 border-success-500/40 text-success-100 hover:bg-success-500/30",
    glow: "shadow-glow-green hover:shadow-glow-green",
  },
  ghost: {
    base: "bg-transparent border-glass-border/50 text-gray-300 hover:bg-glass-light",
    glow: "hover:shadow-soft",
  },
};

// 尺寸映射
const sizeVariants = {
  sm: "px-3 py-1.5 text-sm min-h-[32px]",
  md: "px-4 py-2 text-base min-h-[40px]",
  lg: "px-6 py-3 text-lg min-h-[48px]",
  xl: "px-8 py-4 text-xl min-h-[56px]",
};

// 玻璃强度映射
const glassIntensityVariants = {
  light: "backdrop-blur-sm",
  medium: "backdrop-blur-md",
  heavy: "backdrop-blur-lg",
};

const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      glow = false,
      ripple = true,
      loading = false,
      glassIntensity = "medium",
      animationIntensity = "medium",
      enableAnimations = true,
      onHover,
      leftIcon,
      rightIcon,
      className,
      children,
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // 集成微交互动画
    const animationRef = useMicroInteractions({
      hover: enableAnimations && {
        glow: glow,
        glowColor: getGlowColor(variant),
      },
      click: enableAnimations && ripple,
      focus: enableAnimations,
      intensity: animationIntensity,
    });

    // 集成加载动画
    const loadingRef = useLoadingAnimation(loading, {
      color: getLoadingColor(variant),
      size: size === "sm" ? "sm" : size === "lg" || size === "xl" ? "lg" : "md",
    });

    // 合并refs
    useEffect(() => {
      const element = ref
        ? typeof ref === "function"
          ? null
          : ref.current
        : buttonRef.current;

      if (element) {
        if (animationRef.current !== element) {
          (animationRef as any).current = element;
        }
        if (loadingRef.current !== element) {
          (loadingRef as any).current = element;
        }
      }
    }, [ref, animationRef, loadingRef]);

    // 获取发光颜色
    function getGlowColor(variant: string): string {
      const colors = {
        primary: "rgba(59, 130, 246, 0.15)",
        emergency: "rgba(239, 68, 68, 0.15)",
        success: "rgba(34, 197, 94, 0.15)",
        secondary: "rgba(255, 255, 255, 0.1)",
        ghost: "rgba(255, 255, 255, 0.05)",
      };
      return colors[variant as keyof typeof colors] || colors.primary;
    }

    // 获取加载指示器颜色
    function getLoadingColor(variant: string): string {
      const colors = {
        primary: "rgba(59, 130, 246, 0.8)",
        emergency: "rgba(239, 68, 68, 0.8)",
        success: "rgba(34, 197, 94, 0.8)",
        secondary: "rgba(255, 255, 255, 0.8)",
        ghost: "rgba(255, 255, 255, 0.6)",
      };
      return colors[variant as keyof typeof colors] || colors.primary;
    }

    // 处理点击事件
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
    };

    // 处理悬停事件
    const handleMouseEnter = () => {
      setIsHovered(true);
      onHover?.(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      onHover?.(false);
    };

    // 构建类名
    const variantStyles = buttonVariants[variant];
    const baseClasses = [
      // 基础样式
      "relative",
      "inline-flex",
      "items-center",
      "justify-center",
      "gap-2",
      "font-medium",
      "rounded-lg",
      "border",
      "transition-all",
      "duration-300",
      "overflow-hidden",
      "focus:outline-none",
      "focus:ring-2",
      "focus:ring-primary-500/50",
      "focus:ring-offset-2",
      "focus:ring-offset-transparent",

      // 玻璃效果
      glassIntensityVariants[glassIntensity],

      // 尺寸
      sizeVariants[size],

      // 变体样式
      variantStyles.base,

      // 发光效果
      glow ? variantStyles.glow : "",

      // 禁用状态
      disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",

      // 加载状态
      loading ? "cursor-wait" : "",

      // 交互效果 - 由动画引擎处理
      !disabled && !loading && enableAnimations
        ? ""
        : "hover:scale-[1.02] active:scale-[0.98]",
    ];

    return (
      <button
        ref={ref || buttonRef}
        className={cn(baseClasses, className)}
        disabled={disabled || loading}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {/* 玻璃纹理叠加层 */}
        <div className="absolute inset-0 bg-glass-texture opacity-20 pointer-events-none" />

        {/* 内容容器 */}
        <div className="relative z-10 flex items-center justify-center gap-2">
          {/* 左侧图标 */}
          {leftIcon && !loading && (
            <span className="flex-shrink-0">{leftIcon}</span>
          )}

          {/* 按钮文本 */}
          <span className="flex-1 text-center">{children}</span>

          {/* 右侧图标 */}
          {rightIcon && !loading && (
            <span className="flex-shrink-0">{rightIcon}</span>
          )}
        </div>

        {/* 悬停发光效果 */}
        {glow && isHovered && enableAnimations && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-glass-shimmer pointer-events-none" />
        )}
      </button>
    );
  }
);

GlassButton.displayName = "GlassButton";

export default GlassButton;
