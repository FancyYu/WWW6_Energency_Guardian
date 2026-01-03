/**
 * PageLoadingAnimations - 页面加载动画组件
 * 提供优雅的页面加载和骨架屏动画
 */

import React, { useEffect, useState } from "react";
import { cn } from "../utils/cn";
import { useEnterAnimation, useStaggerAnimation } from "./hooks";

// 页面加载器组件
export interface PageLoaderProps {
  isLoading: boolean;
  variant?: "spinner" | "pulse" | "wave" | "dots";
  size?: "sm" | "md" | "lg";
  color?: string;
  message?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  isLoading,
  variant = "spinner",
  size = "md",
  color = "rgba(59, 130, 246, 0.8)",
  message = "Loading...",
}) => {
  if (!isLoading) return null;

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const renderLoader = () => {
    switch (variant) {
      case "spinner":
        return (
          <div
            className={cn(
              "animate-spin rounded-full border-2 border-transparent border-t-current",
              sizeClasses[size]
            )}
            style={{ color }}
          />
        );

      case "pulse":
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn("rounded-full animate-pulse", sizeClasses[size])}
                style={{
                  backgroundColor: color,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        );

      case "wave":
        return (
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-1 h-8 rounded-full animate-bounce"
                style={{
                  backgroundColor: color,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        );

      case "dots":
        return (
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full animate-bounce"
                style={{
                  backgroundColor: color,
                  animationDelay: `${i * 0.16}s`,
                }}
              />
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4 p-8 bg-glass-medium backdrop-blur-lg rounded-xl border border-glass-border shadow-glass-medium">
        {renderLoader()}
        {message && (
          <p className="text-sm text-gray-300 animate-pulse">{message}</p>
        )}
      </div>
    </div>
  );
};

// 骨架屏组件
export interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = "text",
  width,
  height,
  animation = "pulse",
}) => {
  const baseClasses = ["bg-glass-light", "animate-pulse"];

  const variantClasses = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-none",
    rounded: "rounded-lg",
  };

  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-wave",
    none: "",
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height)
    style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
    />
  );
};

// 骨架屏卡片组件
export interface SkeletonCardProps {
  showAvatar?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showActions?: boolean;
  lines?: number;
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  showAvatar = true,
  showTitle = true,
  showDescription = true,
  showActions = true,
  lines = 3,
  className,
}) => {
  return (
    <div
      className={cn(
        "p-6 bg-glass-medium backdrop-blur-md rounded-lg border border-glass-border",
        className
      )}
    >
      <div className="flex items-start space-x-4">
        {showAvatar && <Skeleton variant="circular" width={48} height={48} />}

        <div className="flex-1 space-y-3">
          {showTitle && <Skeleton variant="text" width="60%" height={20} />}

          {showDescription && (
            <div className="space-y-2">
              {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="text"
                  width={i === lines - 1 ? "40%" : "100%"}
                  height={16}
                />
              ))}
            </div>
          )}

          {showActions && (
            <div className="flex space-x-2 pt-2">
              <Skeleton variant="rounded" width={80} height={32} />
              <Skeleton variant="rounded" width={80} height={32} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 骨架屏列表组件
export interface SkeletonListProps {
  items?: number;
  itemHeight?: number;
  showDividers?: boolean;
  className?: string;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  items = 5,
  itemHeight: _itemHeight = 60,
  showDividers = true,
  className,
}) => {
  return (
    <div className={cn("space-y-0", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i}>
          <div className="flex items-center space-x-4 p-4">
            <Skeleton variant="circular" width={40} height={40} />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" width="70%" height={16} />
              <Skeleton variant="text" width="40%" height={14} />
            </div>
            <Skeleton variant="rectangular" width={24} height={24} />
          </div>
          {showDividers && i < items - 1 && (
            <div className="border-b border-glass-border/30" />
          )}
        </div>
      ))}
    </div>
  );
};

// 页面过渡包装器
export interface PageTransitionWrapperProps {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingComponent?: React.ReactNode;
  animationDelay?: number;
  staggerChildren?: boolean;
  staggerDelay?: number;
}

export const PageTransitionWrapper: React.FC<PageTransitionWrapperProps> = ({
  children,
  isLoading = false,
  loadingComponent,
  animationDelay = 0,
  staggerChildren = false,
  staggerDelay = 100,
}) => {
  const [childElements, setChildElements] = useState<HTMLElement[]>([]);
  const { elementRef, isVisible } = useEnterAnimation({
    enabled: !isLoading,
    delay: animationDelay,
    from: "bottom",
    distance: 30,
    opacity: 0,
    duration: 600,
  });

  // 交错动画
  useStaggerAnimation(childElements, {
    enabled: staggerChildren && isVisible,
    delay: staggerDelay,
    duration: 400,
    from: "bottom",
  });

  useEffect(() => {
    if (staggerChildren && elementRef.current) {
      const elements = Array.from(elementRef.current.children) as HTMLElement[];
      setChildElements(elements);
    }
  }, [staggerChildren, elementRef, isVisible]);

  if (isLoading) {
    return loadingComponent || <PageLoader isLoading={true} />;
  }

  return (
    <div ref={elementRef} className={!isVisible ? "opacity-0" : ""}>
      {children}
    </div>
  );
};

// 智能加载状态管理器
export interface SmartLoaderProps {
  isLoading: boolean;
  hasError?: boolean;
  isEmpty?: boolean;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  minLoadingTime?: number;
}

export const SmartLoader: React.FC<SmartLoaderProps> = ({
  isLoading,
  hasError = false,
  isEmpty = false,
  children,
  loadingComponent,
  errorComponent,
  emptyComponent,
  minLoadingTime = 500,
}) => {
  const [showLoading, setShowLoading] = useState(isLoading);

  useEffect(() => {
    if (isLoading) {
      setShowLoading(true);
    } else {
      // 确保最小加载时间
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, minLoadingTime);

      return () => clearTimeout(timer);
    }
  }, [isLoading, minLoadingTime]);

  if (showLoading) {
    return (
      <>
        {loadingComponent || (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}
      </>
    );
  }

  if (hasError) {
    return (
      <>
        {errorComponent || (
          <div className="text-center py-12">
            <div className="text-emergency-400 text-lg font-medium">
              Something went wrong
            </div>
            <p className="text-gray-400 mt-2">Please try again later</p>
          </div>
        )}
      </>
    );
  }

  if (isEmpty) {
    return (
      <>
        {emptyComponent || (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg font-medium">
              No data available
            </div>
            <p className="text-gray-500 mt-2">
              There's nothing to show here yet
            </p>
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
};

// 渐进式图片加载组件
export interface ProgressiveImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  blurAmount?: number;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  alt,
  placeholder,
  className,
  blurAmount = 10,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* 占位符 */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-glass-light animate-pulse" />
      )}

      {/* 模糊占位图 */}
      {placeholder && !isLoaded && !hasError && (
        <img
          src={placeholder}
          alt=""
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
            `blur-[${blurAmount}px]`
          )}
        />
      )}

      {/* 主图片 */}
      <img
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-500",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
      />

      {/* 错误状态 */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-glass-light">
          <div className="text-gray-400 text-sm">Failed to load image</div>
        </div>
      )}
    </div>
  );
};
