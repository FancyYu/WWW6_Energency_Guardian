/**
 * GlassModal 组件 - 玻璃拟态模态框
 * 支持层叠玻璃效果和焦点管理
 */

import React, {
  forwardRef,
  type HTMLAttributes,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../../utils/cn";

export interface GlassModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;

  // 玻璃效果属性
  variant?: "light" | "medium" | "heavy";
  blur?: "sm" | "md" | "lg" | "xl";

  // 布局属性
  size?: "sm" | "md" | "lg" | "xl" | "full";
  centered?: boolean;

  // 行为属性
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  preventScroll?: boolean;

  // 动画属性
  animationDuration?: number;

  children: React.ReactNode;
}

export interface GlassModalHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  showCloseButton?: boolean;
  onClose?: () => void;
}

export interface GlassModalBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface GlassModalFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

// 玻璃效果变体
const glassVariants = {
  light: "bg-glass-light backdrop-blur-sm",
  medium: "bg-glass-medium backdrop-blur-md",
  heavy: "bg-glass-heavy backdrop-blur-lg",
};

// 模糊强度变体
const blurVariants = {
  sm: "backdrop-blur-sm",
  md: "backdrop-blur-md",
  lg: "backdrop-blur-lg",
  xl: "backdrop-blur-xl",
};

// 尺寸变体
const sizeVariants = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-full mx-4",
};

const GlassModal = forwardRef<HTMLDivElement, GlassModalProps>(
  (
    {
      isOpen,
      onClose,
      variant = "medium",
      blur,
      size = "md",
      centered = true,
      closeOnOverlayClick = true,
      closeOnEscape = true,
      preventScroll = true,
      animationDuration = 300,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);

    // 处理模态框打开/关闭
    useEffect(() => {
      if (isOpen) {
        // 保存当前焦点元素
        previousActiveElement.current = document.activeElement as HTMLElement;

        // 显示模态框
        setIsVisible(true);
        setIsAnimating(true);

        // 防止背景滚动
        if (preventScroll) {
          document.body.style.overflow = "hidden";
        }

        // 设置焦点到模态框
        setTimeout(() => {
          modalRef.current?.focus();
          setIsAnimating(false);
        }, 50);
      } else {
        setIsAnimating(true);

        // 延迟隐藏以播放退出动画
        setTimeout(() => {
          setIsVisible(false);
          setIsAnimating(false);

          // 恢复背景滚动
          if (preventScroll) {
            document.body.style.overflow = "";
          }

          // 恢复之前的焦点
          previousActiveElement.current?.focus();
        }, animationDuration);
      }
    }, [isOpen, preventScroll, animationDuration]);

    // 处理 ESC 键关闭
    useEffect(() => {
      if (!closeOnEscape || !isOpen) return;

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          onClose();
        }
      };

      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }, [closeOnEscape, isOpen, onClose]);

    // 焦点陷阱
    useEffect(() => {
      if (!isOpen) return;

      const modal = modalRef.current;
      if (!modal) return;

      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      const handleTabKey = (event: KeyboardEvent) => {
        if (event.key !== "Tab") return;

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      };

      modal.addEventListener("keydown", handleTabKey);
      return () => modal.removeEventListener("keydown", handleTabKey);
    }, [isOpen]);

    // 处理覆盖层点击
    const handleOverlayClick = (event: React.MouseEvent) => {
      if (closeOnOverlayClick && event.target === event.currentTarget) {
        onClose();
      }
    };

    if (!isVisible) return null;

    const modalContent = (
      <div
        className={cn(
          "fixed inset-0 z-modal flex items-center justify-center p-4",
          centered ? "items-center" : "items-start pt-16"
        )}
        onClick={handleOverlayClick}
      >
        {/* 背景覆盖层 */}
        <div
          className={cn(
            "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity",
            isOpen && !isAnimating ? "opacity-100" : "opacity-0"
          )}
        />

        {/* 模态框容器 */}
        <div
          ref={ref || modalRef}
          className={cn(
            "relative w-full rounded-xl border border-glass-border overflow-hidden",
            "transform transition-all duration-300",
            // 玻璃效果
            glassVariants[variant],
            blur ? blurVariants[blur] : "",
            // 尺寸
            sizeVariants[size],
            // 动画状态
            isOpen && !isAnimating
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-4",
            className
          )}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          {...props}
        >
          {/* 玻璃纹理叠加层 */}
          <div className="absolute inset-0 bg-glass-texture opacity-30 pointer-events-none" />

          {/* 内容容器 */}
          <div className="relative z-10">{children}</div>
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  }
);

GlassModal.displayName = "GlassModal";

// 子组件：Header
const GlassModalHeader = forwardRef<HTMLDivElement, GlassModalHeaderProps>(
  ({ className, children, showCloseButton = true, onClose, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-between px-6 py-4 border-b border-glass-border/50",
          className
        )}
        {...props}
      >
        <div className="flex-1">{children}</div>

        {showCloseButton && onClose && (
          <button
            onClick={onClose}
            className={cn(
              "ml-4 p-2 rounded-lg text-gray-400 hover:text-gray-200",
              "hover:bg-glass-light transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            )}
            aria-label="关闭模态框"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

GlassModalHeader.displayName = "GlassModalHeader";

// 子组件：Body
const GlassModalBody = forwardRef<HTMLDivElement, GlassModalBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("px-6 py-4", className)} {...props}>
        {children}
      </div>
    );
  }
);

GlassModalBody.displayName = "GlassModalBody";

// 子组件：Footer
const GlassModalFooter = forwardRef<HTMLDivElement, GlassModalFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-end gap-3 px-6 py-4 border-t border-glass-border/50",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassModalFooter.displayName = "GlassModalFooter";

// 组合导出
export interface GlassModalComponent
  extends React.ForwardRefExoticComponent<
    GlassModalProps & React.RefAttributes<HTMLDivElement>
  > {
  Header: typeof GlassModalHeader;
  Body: typeof GlassModalBody;
  Footer: typeof GlassModalFooter;
}

const GlassModalWithSubComponents = GlassModal as GlassModalComponent;
GlassModalWithSubComponents.Header = GlassModalHeader;
GlassModalWithSubComponents.Body = GlassModalBody;
GlassModalWithSubComponents.Footer = GlassModalFooter;

export default GlassModalWithSubComponents;
