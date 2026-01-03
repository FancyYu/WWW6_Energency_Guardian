/**
 * Card Component - 通用卡片组件
 */

import React from "react";
import { clsx } from "clsx";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div
      className={clsx(
        "bg-white rounded-lg border border-gray-200 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className,
}) => {
  return (
    <div className={clsx("px-6 py-4 border-b border-gray-200", className)}>
      {children}
    </div>
  );
};

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className,
}) => {
  return <div className={clsx("px-6 py-4", className)}>{children}</div>;
};

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={clsx(
        "px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg",
        className
      )}
    >
      {children}
    </div>
  );
};
