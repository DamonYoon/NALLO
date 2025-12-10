"use client";

import * as React from "react";
import { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type MetricStatus = "default" | "success" | "warning" | "error";

export interface MetricCardProps {
  /** 지표 라벨 */
  label: string;
  /** 지표 값 */
  value: string | number;
  /** 아이콘 */
  icon?: LucideIcon;
  /** 상태 (색상 결정) */
  status?: MetricStatus;
  /** 클릭 핸들러 */
  onClick?: () => void;
  /** 추가 클래스 */
  className?: string;
  /** 값 크기 */
  valueSize?: "sm" | "default" | "lg";
}

const statusColors: Record<MetricStatus, { icon: string; value: string }> = {
  default: {
    icon: "text-muted-foreground",
    value: "text-foreground",
  },
  success: {
    icon: "text-emerald-500",
    value: "text-emerald-500",
  },
  warning: {
    icon: "text-amber-500",
    value: "text-amber-500",
  },
  error: {
    icon: "text-red-500",
    value: "text-red-500",
  },
};

const valueSizeClasses = {
  sm: "text-xl",
  default: "text-2xl",
  lg: "text-3xl",
};

/**
 * 지표 카드 컴포넌트
 *
 * Figma 디자인 기준:
 * - 아이콘 + 라벨 (상단)
 * - 큰 숫자 값 (하단)
 * - 상태에 따른 색상 변화
 *
 * @example
 * // 기본 사용
 * <MetricCard
 *   label="고립된 문서"
 *   value={3}
 *   icon={FileText}
 *   status="warning"
 * />
 *
 * @example
 * // 클릭 가능
 * <MetricCard
 *   label="깨진 링크"
 *   value={5}
 *   icon={Link2}
 *   status="error"
 *   onClick={() => navigateToLinks()}
 * />
 */
export function MetricCard({
  label,
  value,
  icon: Icon,
  status = "default",
  onClick,
  className,
  valueSize = "default",
}: MetricCardProps) {
  const colors = statusColors[status];
  const Component = onClick ? "button" : "div";

  return (
    <Component
      onClick={onClick}
      className={cn(
        "p-4 rounded-lg border border-border bg-card text-left",
        onClick && "cursor-pointer hover:bg-accent/50 transition-colors",
        className
      )}
    >
      {/* Header: Icon + Label */}
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className={cn("h-4 w-4", colors.icon)} />}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>

      {/* Value */}
      <div className={cn("font-bold", valueSizeClasses[valueSize], colors.value)}>
        {value}
      </div>
    </Component>
  );
}

/**
 * 지표 카드 그리드 컴포넌트
 */
export interface MetricCardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function MetricCardGrid({
  children,
  columns = 2,
  className,
}: MetricCardGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {children}
    </div>
  );
}

/**
 * 간단한 통계 항목 (인라인 스타일)
 */
export interface StatItemProps {
  label: string;
  value: string | number;
  className?: string;
}

export function StatItem({ label, value, className }: StatItemProps) {
  return (
    <div className={cn("text-center", className)}>
      <div className="text-lg font-semibold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

/**
 * 통계 항목 가로 나열
 */
export interface StatRowProps {
  children: React.ReactNode;
  className?: string;
  divider?: boolean;
}

export function StatRow({ children, className, divider = true }: StatRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-around",
        divider && "[&>*:not(:last-child)]:border-r [&>*:not(:last-child)]:border-border [&>*]:px-4",
        className
      )}
    >
      {children}
    </div>
  );
}

