/**
 * 类名合并工具函数
 * 基于 clsx 和 tailwind-merge 的类名处理
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合并和去重 Tailwind CSS 类名
 * @param inputs - 类名输入（字符串、对象、数组等）
 * @returns 合并后的类名字符串
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * 条件性类名应用
 * @param condition - 条件
 * @param trueClasses - 条件为真时的类名
 * @param falseClasses - 条件为假时的类名
 * @returns 合并后的类名字符串
 */
export function conditionalClass(
  condition: boolean,
  trueClasses: ClassValue,
  falseClasses?: ClassValue
): string {
  return cn(condition ? trueClasses : falseClasses);
}

/**
 * 变体类名映射
 * @param variant - 变体键
 * @param variants - 变体映射对象
 * @param defaultVariant - 默认变体
 * @returns 对应的类名字符串
 */
export function variantClass<T extends string>(
  variant: T,
  variants: Record<T, ClassValue>,
  defaultVariant?: T
): string {
  const selectedVariant = variant in variants ? variant : defaultVariant;
  return selectedVariant ? cn(variants[selectedVariant]) : "";
}

/**
 * 响应式类名生成器
 * @param base - 基础类名
 * @param responsive - 响应式类名映射
 * @returns 合并后的响应式类名
 */
export function responsiveClass(
  base: ClassValue,
  responsive: {
    sm?: ClassValue;
    md?: ClassValue;
    lg?: ClassValue;
    xl?: ClassValue;
    "2xl"?: ClassValue;
  } = {}
): string {
  return cn(
    base,
    responsive.sm && `sm:${responsive.sm}`,
    responsive.md && `md:${responsive.md}`,
    responsive.lg && `lg:${responsive.lg}`,
    responsive.xl && `xl:${responsive.xl}`,
    responsive["2xl"] && `2xl:${responsive["2xl"]}`
  );
}

export default cn;
