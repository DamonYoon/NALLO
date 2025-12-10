"use client";

import * as React from "react";
import { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface ActionListItemProps {
  /** 아이콘 */
  icon?: LucideIcon;
  /** 제목 */
  title: string;
  /** 설명 */
  description?: string;
  /** 액션 버튼 텍스트 */
  actionLabel?: string;
  /** 액션 클릭 핸들러 */
  onAction?: () => void;
  /** 커스텀 액션 버튼 */
  action?: React.ReactNode;
  /** 항목 전체 클릭 핸들러 */
  onClick?: () => void;
  /** 추가 클래스 */
  className?: string;
  /** 비활성화 여부 */
  disabled?: boolean;
}

/**
 * 액션 리스트 아이템 컴포넌트
 *
 * Figma 디자인 기준:
 * - 좌측: 아이콘 + 제목 + 설명
 * - 우측: 액션 버튼 (예: "검토하기")
 *
 * @example
 * // 기본 사용
 * <ActionListItem
 *   icon={Link2}
 *   title="용어 연결 필요"
 *   description="'Elastic Node' 문서에 용어 연결이 필요할 수 있습니다"
 *   actionLabel="검토하기"
 *   onAction={() => handleReview()}
 * />
 *
 * @example
 * // 커스텀 액션
 * <ActionListItem
 *   icon={AlertTriangle}
 *   title="중복 가능성 감지"
 *   description="'시작하기'와 '개요' 문서 간 유사한 내용 발견"
 *   action={<Button variant="outline" size="sm">무시</Button>}
 * />
 */
export function ActionListItem({
  icon: Icon,
  title,
  description,
  actionLabel = "검토하기",
  onAction,
  action,
  onClick,
  className,
  disabled = false,
}: ActionListItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 rounded-lg bg-accent/30 border border-border",
        "hover:bg-accent/50 transition-colors",
        onClick && "cursor-pointer",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Icon + Content */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {Icon && (
            <div className="shrink-0 mt-0.5">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">{title}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Right: Action */}
        {action ? (
          <div className="shrink-0">{action}</div>
        ) : (
          onAction && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAction();
              }}
              className="shrink-0 text-xs hover:bg-primary hover:text-primary-foreground hover:border-primary"
            >
              {actionLabel}
            </Button>
          )
        )}
      </div>
    </div>
  );
}

/**
 * 액션 리스트 컨테이너
 */
export interface ActionListProps {
  children: React.ReactNode;
  className?: string;
}

export function ActionList({ children, className }: ActionListProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {children}
    </div>
  );
}

