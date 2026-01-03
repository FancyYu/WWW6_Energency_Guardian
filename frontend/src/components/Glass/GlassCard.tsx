/**
 * GlassCard 组件 - 玻璃拟态卡片
 * 支持不同强度的玻璃效果和发光变体
 * 集成微交互动画引擎
 */

import React, { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";
import {
  useMicroInteractions,
  useEnterAnimation,
} from "../../animations/hooks";

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "light" | "medium" | "heavy";
  glow?: "blue" | "red" | "green" | "purple" | "yellow" | "none";
  blur?: "sm" | "md" | "lg" | "xl";
  border?: boolean;
  shadow?: "soft" | "medium" | "large";

  // 交互属性
  hoverable?: boolean;
  clickable?: boolean;

  // 动画属性
  animateOnMount?: boolean;
  animationDelay?: number;
  animationIntensity?: "subtle" | "medium" | "strong";
  enableAnimations?: boolean;

  children: React.ReactNode;
}

export interface GlassCardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface GlassCardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface GlassCardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

// 玻璃效果变体映射
const glassVariants = {
  light: "bg-glass-light backdrop-blur-sm",
  medium: "bg-glass-medium backdrop-blur-md",
  heavy: "bg-glass-heavy backdrop-blur-lg",
};

// 发光效果映射
const glowVariants = {
  blue: "shadow-glow-blue",
  red: "shadow-glow-red",
  green: "shadow-glow-green",
  purple: "shadow-glow-purple",
  yellow: "shadow-glow-yellow",
  none: "",
};

// 模糊强度映射
const blurVariants = {
  sm: "backdrop-blur-sm",
  md: "backdrop-blur-md",
  lg: "backdrop-blur-lg",
  xl: "backdrop-blur-xl",
};

// 阴影变体映射
const shadowVariants = {
  soft: "shadow-soft",
  medium: "shadow-medium",
  large: "shadow-large",
};

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      variant = "medium",
      glow = "none",
      blur,
      border = true,
      shadow = "soft",
      hoverable = false,
      clickable = false,
      animateOnMount = false,
      animationDelay = 0,
      animationIntensity = "medium",
      enableAnimations = true,
      className,
      children,
      ...props
    },
    ref
  ) => {
    // 集成微交互动画
    const animationRef = useMicroInteractions({
      hover: enableAnimations &&
        hoverable && {
          glow: glow !== "none",
          glowColor: getGlowColor(glow),
        },
      click: enableAnimations && clickable,
      intensity: animationIntensity,
    });

    // 集成入场动画
    const { elementRef: enterRef, isVisible } = useEnterAnimation({
      enabled: enableAnimations && animateOnMount,
      delay: animationDelay,
      from: "bottom",
      distance: 20,
      opacity: 0,
      duration: 500,
    });

    // 获取发光颜色
    function getGlowColor(glowType: string): string {
      const colors = {
        blue: "rgba(59, 130, 246, 0.15)",
        red: "rgba(239, 68, 68, 0.15)",
        green: "rgba(34, 197, 94, 0.15)",
        purple: "rgba(147, 51, 234, 0.15)",
        yellow: "rgba(245, 158, 11, 0.15)",
        none: "rgba(255, 255, 255, 0.1)",
      };
      return colors[glowType as keyof typeof colors] || colors.none;
    }
    // 构建基础类名
    const baseClasses = [
      "relative",
      "rounded-lg",
      "overflow-hidden",
      // 玻璃效果
      glassVariants[variant],
      // 自定义模糊或使用变体默认值
      blur ? blurVariants[blur] : "",
      // 边框
      border ? "border border-glass-border" : "",
      // 阴影
      shadowVariants[shadow],
      // 发光效果
      glowVariants[glow],
      // 交互效果 - 由动画引擎处理
      hoverable && !enableAnimations
        ? "transition-all duration-300 hover:scale-[1.02] hover:shadow-medium"
        : "",
      clickable && !enableAnimations
        ? "cursor-pointer active:scale-[0.98]"
        : "",
      clickable ? "cursor-pointer" : "",
      // 入场动画的初始状态
      animateOnMount && !isVisible ? "opacity-0" : "",
    ];

    return (
      <div
        ref={
          ref ||
          (animationRef as React.RefObject<HTMLDivElement>) ||
          (enterRef as React.RefObject<HTMLDivElement>)
        }
        className={cn(baseClasses, className)}
        {...props}
      >
        {/* 玻璃纹理叠加层 */}
        <div className="absolute inset-0 bg-glass-texture opacity-30 pointer-events-none" />

        {/* 内容容器 */}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

// 子组件：Header
const GlassCardHeader = forwardRef<HTMLDivElement, GlassCardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("px-6 py-4 border-b border-glass-border/50", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCardHeader.displayName = "GlassCardHeader";

// 子组件：Body
const GlassCardBody = forwardRef<HTMLDivElement, GlassCardBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("px-6 py-4", className)} {...props}>
        {children}
      </div>
    );
  }
);

GlassCardBody.displayName = "GlassCardBody";

// 子组件：Footer
const GlassCardFooter = forwardRef<HTMLDivElement, GlassCardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("px-6 py-4 border-t border-glass-border/50", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCardFooter.displayName = "GlassCardFooter";

// 组合导出
export interface GlassCardComponent
  extends React.ForwardRefExoticComponent<
    GlassCardProps & React.RefAttributes<HTMLDivElement>
  > {
  Header: typeof GlassCardHeader;
  Body: typeof GlassCardBody;
  Footer: typeof GlassCardFooter;
}

const GlassCardWithSubComponents = GlassCard as GlassCardComponent;
GlassCardWithSubComponents.Header = GlassCardHeader;
GlassCardWithSubComponents.Body = GlassCardBody;
GlassCardWithSubComponents.Footer = GlassCardFooter;

export default GlassCardWithSubComponents;
