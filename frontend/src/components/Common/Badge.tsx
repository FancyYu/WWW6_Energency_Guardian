/**
 * Badge Component - 徽章组件
 */

import React from "react";
import { clsx } from "clsx";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "emergency" | "gray" | "primary";
  size?: "sm" | "md";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "gray",
  size = "md",
  className,
}) => {
  const baseClasses = "inline-flex items-center rounded-full font-medium";

  const variantClasses = {
    success: "bg-success-100 text-success-800",
    warning: "bg-warning-100 text-warning-800",
    emergency: "bg-emergency-100 text-emergency-800",
    gray: "bg-gray-100 text-gray-800",
    primary: "bg-primary-100 text-primary-800",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-sm",
  };

  return (
    <span
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
};
