"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface SectionHeaderProps {
  /** 섹션 제목 */
  title: string;
  /** 섹션 설명 (선택) */
  description?: string;
  /** 우측 액션 (링크 또는 버튼) */
  action?: React.ReactNode;
  /** 액션 클릭 핸들러 (action prop 없이 사용시 기본 "전체 보기" 링크 생성) */
  onActionClick?: () => void;
  /** 기본 액션 라벨 (onActionClick 사용시) */
  actionLabel?: string;
  /** 추가 클래스 */
  className?: string;
  /** 타이틀 크기 */
  size?: "sm" | "default" | "lg";
}

/**
 * 섹션 헤더 컴포넌트
 *
 * Figma 디자인 기준:
 * - 좌측: 타이틀 + 설명
 * - 우측: "전체 보기" 같은 액션 링크
 *
 * @example
 * // 기본 사용
 * <SectionHeader
 *   title="최근 활동"
 *   description="최근 수정되거나 생성된 문서"
 *   onActionClick={() => router.push('/activities')}
 * />
 *
 * @example
 * // 커스텀 액션
 * <SectionHeader
 *   title="AI 추천 작업"
 *   description="AI가 분석한 개선 제안 사항"
 *   action={<Button size="sm">새로고침</Button>}
 * />
 */
export function SectionHeader({
  title,
  description,
  action,
  onActionClick,
  actionLabel = "전체 보기",
  className,
  size = "default",
}: SectionHeaderProps) {
  const titleSizeClasses = {
    sm: "text-sm font-medium",
    default: "text-base font-medium",
    lg: "text-lg font-semibold",
  };

  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      {/* Left: Title & Description */}
      <div className="space-y-1 min-w-0">
        <h3 className={cn("text-foreground", titleSizeClasses[size])}>
          {title}
        </h3>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Right: Action */}
      {action ? (
        <div className="shrink-0">{action}</div>
      ) : (
        onActionClick && (
          <button
            onClick={onActionClick}
            className="shrink-0 text-xs text-primary hover:underline transition-colors"
          >
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
}

/**
 * 섹션 카드 컴포넌트 - 헤더와 콘텐츠를 포함하는 카드
 */
export interface SectionCardProps {
  /** 섹션 제목 */
  title: string;
  /** 섹션 설명 */
  description?: string;
  /** 우측 액션 */
  action?: React.ReactNode;
  /** 액션 클릭 핸들러 */
  onActionClick?: () => void;
  /** 액션 라벨 */
  actionLabel?: string;
  /** 카드 콘텐츠 */
  children: React.ReactNode;
  /** 추가 클래스 */
  className?: string;
  /** 콘텐츠 영역 클래스 */
  contentClassName?: string;
}

export function SectionCard({
  title,
  description,
  action,
  onActionClick,
  actionLabel,
  children,
  className,
  contentClassName,
}: SectionCardProps) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow",
        className
      )}
    >
      <SectionHeader
        title={title}
        description={description}
        action={action}
        onActionClick={onActionClick}
        actionLabel={actionLabel}
        className="mb-4"
      />
      <div className={cn("", contentClassName)}>{children}</div>
    </div>
  );
}

