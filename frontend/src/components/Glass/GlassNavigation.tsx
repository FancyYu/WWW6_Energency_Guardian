/**
 * GlassNavigation 组件 - 透明导航栏
 * 支持自适应透明度和滚动效果
 */

import React, {
  forwardRef,
  type HTMLAttributes,
  useEffect,
  useState,
} from "react";
import { cn } from "../../utils/cn";

export interface GlassNavigationProps extends HTMLAttributes<HTMLElement> {
  variant?: "light" | "medium" | "heavy";
  position?: "fixed" | "sticky" | "static";

  // 滚动效果
  scrollEffect?: boolean;
  scrollThreshold?: number;

  // 布局属性
  fullWidth?: boolean;
  centered?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";

  children: React.ReactNode;
}

export interface GlassNavigationBrandProps
  extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface GlassNavigationMenuProps
  extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface GlassNavigationItemProps
  extends HTMLAttributes<HTMLDivElement> {
  active?: boolean;
  children: React.ReactNode;
}

// 玻璃效果变体
const glassVariants = {
  light: "bg-glass-light backdrop-blur-sm",
  medium: "bg-glass-medium backdrop-blur-md",
  heavy: "bg-glass-heavy backdrop-blur-lg",
};

// 最大宽度变体
const maxWidthVariants = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  full: "max-w-full",
};

const GlassNavigation = forwardRef<HTMLElement, GlassNavigationProps>(
  (
    {
      variant = "medium",
      position = "fixed",
      scrollEffect = true,
      scrollThreshold = 50,
      fullWidth = true,
      centered = true,
      maxWidth = "full",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [isScrolled, setIsScrolled] = useState(false);

    // 处理滚动效果
    useEffect(() => {
      if (!scrollEffect || position === "static") return;

      const handleScroll = () => {
        const scrollY = window.scrollY;
        setIsScrolled(scrollY > scrollThreshold);
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }, [scrollEffect, scrollThreshold, position]);

    // 构建基础类名
    const baseClasses = [
      // 基础样式
      "w-full",
      "border-b",
      "border-glass-border/50",
      "transition-all",
      "duration-300",
      "z-sticky",

      // 位置
      position === "fixed" ? "fixed top-0 left-0 right-0" : "",
      position === "sticky" ? "sticky top-0" : "",

      // 玻璃效果
      glassVariants[variant],

      // 滚动效果增强
      scrollEffect && isScrolled ? "shadow-medium bg-glass-heavy/80" : "",
    ];

    return (
      <nav ref={ref} className={cn(baseClasses, className)} {...props}>
        {/* 玻璃纹理叠加层 */}
        <div className="absolute inset-0 bg-glass-texture opacity-20 pointer-events-none" />

        {/* 内容容器 */}
        <div
          className={cn(
            "relative z-10 mx-auto px-4 sm:px-6 lg:px-8",
            fullWidth ? "w-full" : "",
            centered ? "flex justify-center" : "",
            maxWidthVariants[maxWidth]
          )}
        >
          <div className="flex items-center justify-between h-16 w-full">
            {children}
          </div>
        </div>
      </nav>
    );
  }
);

GlassNavigation.displayName = "GlassNavigation";

// 子组件：Brand
const GlassNavigationBrand = forwardRef<
  HTMLDivElement,
  GlassNavigationBrandProps
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex items-center flex-shrink-0", className)}
      {...props}
    >
      {children}
    </div>
  );
});

GlassNavigationBrand.displayName = "GlassNavigationBrand";

// 子组件：Menu
const GlassNavigationMenu = forwardRef<
  HTMLDivElement,
  GlassNavigationMenuProps
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex items-center space-x-4", className)}
      {...props}
    >
      {children}
    </div>
  );
});

GlassNavigationMenu.displayName = "GlassNavigationMenu";

// 子组件：Item
const GlassNavigationItem = forwardRef<
  HTMLDivElement,
  GlassNavigationItemProps
>(({ active = false, className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
        "hover:bg-glass-light hover:text-white",
        "focus:outline-none focus:ring-2 focus:ring-primary-500/50",
        active
          ? "bg-primary-500/20 text-primary-100 shadow-glow-blue"
          : "text-gray-300",
        className
      )}
      {...props}
    >
      {children}

      {/* 活跃状态指示器 */}
      {active && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-400 rounded-full" />
      )}
    </div>
  );
});

GlassNavigationItem.displayName = "GlassNavigationItem";

// 组合导出
export interface GlassNavigationComponent
  extends React.ForwardRefExoticComponent<
    GlassNavigationProps & React.RefAttributes<HTMLElement>
  > {
  Brand: typeof GlassNavigationBrand;
  Menu: typeof GlassNavigationMenu;
  Item: typeof GlassNavigationItem;
}

const GlassNavigationWithSubComponents =
  GlassNavigation as GlassNavigationComponent;
GlassNavigationWithSubComponents.Brand = GlassNavigationBrand;
GlassNavigationWithSubComponents.Menu = GlassNavigationMenu;
GlassNavigationWithSubComponents.Item = GlassNavigationItem;

export default GlassNavigationWithSubComponents;
