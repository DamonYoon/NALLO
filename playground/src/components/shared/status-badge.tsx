"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * NALLO 디자인 시스템 - 문서 상태 배지
 *
 * Figma 디자인 기준 상태 색상:
 * - draft: 회색 (아직 작성 중)
 * - in-review: 노랑 (검토 중)
 * - publish: 파랑 (배포됨)
 * - done: 초록 (완료)
 * - error: 빨강 (오류)
 * - warning: 주황 (주의)
 * - new: 노랑 (새로 생성)
 * - existing: 보라 (기존 노드)
 */
const statusBadgeVariants = cva(
  "inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors",
  {
    variants: {
      status: {
        draft: "bg-neutral-100 text-neutral-500",
        "in-review": "bg-amber-100 text-amber-700",
        publish: "bg-blue-100 text-blue-600",
        done: "bg-emerald-100 text-emerald-600",
        error: "bg-red-100 text-red-600",
        warning: "bg-orange-100 text-orange-600",
        new: "bg-amber-100 text-amber-800",
        existing: "bg-indigo-100 text-indigo-700",
        success: "bg-emerald-100 text-emerald-600",
        pending: "bg-neutral-100 text-neutral-500",
        archived: "bg-neutral-100 text-neutral-400",
      },
      size: {
        sm: "text-[10px] px-1.5 py-0.5",
        default: "text-xs px-2 py-0.5",
        lg: "text-sm px-2.5 py-1",
      },
    },
    defaultVariants: {
      status: "draft",
      size: "default",
    },
  }
);

export type StatusBadgeStatus = NonNullable<
  VariantProps<typeof statusBadgeVariants>["status"]
>;

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  /** 배지에 표시할 텍스트 (미지정시 status 기본값 사용) */
  label?: string;
}

/**
 * 문서/작업 상태를 표시하는 배지 컴포넌트
 *
 * @example
 * // 기본 사용
 * <StatusBadge status="draft" />
 *
 * @example
 * // 커스텀 라벨
 * <StatusBadge status="in-review" label="검토 중" />
 *
 * @example
 * // 크기 변경
 * <StatusBadge status="publish" size="sm" />
 */
export function StatusBadge({
  className,
  status,
  size,
  label,
  ...props
}: StatusBadgeProps) {
  // 기본 라벨 매핑
  const defaultLabels: Record<StatusBadgeStatus, string> = {
    draft: "Draft",
    "in-review": "In Review",
    publish: "Publish",
    done: "Done",
    error: "Error",
    warning: "Warning",
    new: "새로 생성",
    existing: "기존 노드",
    success: "Success",
    pending: "Pending",
    archived: "Archived",
  };

  const displayLabel = label ?? (status ? defaultLabels[status] : "");

  return (
    <span
      className={cn(statusBadgeVariants({ status, size }), className)}
      {...props}
    >
      {displayLabel}
    </span>
  );
}

/**
 * 상태값을 StatusBadge의 status prop으로 변환하는 유틸리티
 */
export function getStatusFromString(
  value: string
): StatusBadgeStatus | undefined {
  const normalizedValue = value.toLowerCase().replace(/\s+/g, "-");
  const validStatuses: StatusBadgeStatus[] = [
    "draft",
    "in-review",
    "publish",
    "done",
    "error",
    "warning",
    "new",
    "existing",
    "success",
    "pending",
    "archived",
  ];

  if (validStatuses.includes(normalizedValue as StatusBadgeStatus)) {
    return normalizedValue as StatusBadgeStatus;
  }

  // 일반적인 매핑
  const mappings: Record<string, StatusBadgeStatus> = {
    review: "in-review",
    reviewing: "in-review",
    published: "publish",
    complete: "done",
    completed: "done",
    failed: "error",
    warn: "warning",
    active: "success",
  };

  return mappings[normalizedValue];
}

export { statusBadgeVariants };

