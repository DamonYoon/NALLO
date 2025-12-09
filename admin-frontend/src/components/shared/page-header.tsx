"use client";

import * as React from "react";
import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface PageHeaderProps {
  /** 페이지 제목 */
  title: string;
  /** 페이지 설명 (선택) */
  description?: string;
  /** 우측에 표시할 액션 버튼들 */
  actions?: React.ReactNode;
  /** 뒤로가기 버튼 클릭 핸들러 (설정시 뒤로가기 버튼 표시) */
  onBack?: () => void;
  /** 뒤로가기 버튼 라벨 */
  backLabel?: string;
  /** Breadcrumb 영역 (타이틀 위에 표시) */
  breadcrumb?: React.ReactNode;
  /** 추가 클래스 */
  className?: string;
  /** 타이틀 왼쪽에 표시할 아이콘 */
  icon?: React.ReactNode;
}

/**
 * 페이지 헤더 컴포넌트
 *
 * Figma 디자인 기준:
 * - 좌측: 타이틀 + 설명
 * - 우측: 액션 버튼(들)
 *
 * @example
 * // 기본 사용
 * <PageHeader
 *   title="문서 대시보드"
 *   description="문서 작업 현황을 한눈에 확인하세요"
 *   actions={
 *     <Button>
 *       <Plus className="h-4 w-4 mr-2" />
 *       문서 생성
 *     </Button>
 *   }
 * />
 *
 * @example
 * // 뒤로가기 버튼 포함
 * <PageHeader
 *   title="문서 편집"
 *   onBack={() => router.back()}
 * />
 */
export function PageHeader({
  title,
  description,
  actions,
  onBack,
  backLabel,
  breadcrumb,
  className,
  icon,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {/* Breadcrumb */}
      {breadcrumb && <div className="mb-2">{breadcrumb}</div>}

      {/* Back Button */}
      {onBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-2 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {backLabel || "뒤로"}
        </Button>
      )}

      {/* Header Content */}
      <div className="flex items-start justify-between gap-4">
        {/* Left: Title & Description */}
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {icon && (
              <div className="shrink-0 text-muted-foreground">{icon}</div>
            )}
            <h1 className="text-xl font-semibold text-foreground truncate">
              {title}
            </h1>
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Right: Actions */}
        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>
    </div>
  );
}

/**
 * 페이지 헤더 + 콘텐츠를 감싸는 컨테이너
 */
export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn("px-6 py-5 space-y-6", className)}>{children}</div>
  );
}

