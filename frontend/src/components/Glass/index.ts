/**
 * Glass 组件库 - 统一导出
 * 玻璃拟态组件的中央导出点
 */

// 导出所有玻璃组件
export { default as GlassCard } from "./GlassCard";
export { default as GlassButton } from "./GlassButton";
export { default as GlassModal } from "./GlassModal";
export { default as GlassNavigation } from "./GlassNavigation";

// 导出类型定义
export type {
  GlassCardProps,
  GlassCardHeaderProps,
  GlassCardBodyProps,
  GlassCardFooterProps,
} from "./GlassCard";

export type { GlassButtonProps } from "./GlassButton";

export type {
  GlassModalProps,
  GlassModalHeaderProps,
  GlassModalBodyProps,
  GlassModalFooterProps,
} from "./GlassModal";

export type {
  GlassNavigationProps,
  GlassNavigationBrandProps,
  GlassNavigationMenuProps,
  GlassNavigationItemProps,
} from "./GlassNavigation";

// 玻璃效果工具函数
export const glassEffects = {
  // 预定义的玻璃效果类名
  light:
    "bg-glass-light backdrop-blur-sm border border-glass-border shadow-glass-light",
  medium:
    "bg-glass-medium backdrop-blur-md border border-glass-border shadow-glass-medium",
  heavy:
    "bg-glass-heavy backdrop-blur-lg border border-glass-border shadow-glass-heavy",

  // 发光效果类名
  glowBlue: "shadow-glow-blue",
  glowRed: "shadow-glow-red",
  glowGreen: "shadow-glow-green",
  glowPurple: "shadow-glow-purple",
  glowYellow: "shadow-glow-yellow",
};

// 玻璃组件的通用属性
export interface BaseGlassProps {
  variant?: "light" | "medium" | "heavy";
  glow?: "blue" | "red" | "green" | "purple" | "yellow" | "none";
  blur?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

// 工具函数：生成玻璃效果类名
export const createGlassClasses = ({
  variant = "medium",
  glow = "none",
  blur,
  className = "",
}: BaseGlassProps = {}): string => {
  const classes = [
    glassEffects[variant],
    glow !== "none"
      ? glassEffects[
          `glow${
            glow.charAt(0).toUpperCase() + glow.slice(1)
          }` as keyof typeof glassEffects
        ]
      : "",
    blur ? `backdrop-blur-${blur}` : "",
    className,
  ];

  return classes.filter(Boolean).join(" ");
};
