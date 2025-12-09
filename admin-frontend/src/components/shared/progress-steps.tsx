"use client";

import * as React from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

export type StepStatus = "pending" | "processing" | "complete" | "error";

export interface Step {
  /** 단계 ID */
  id: string;
  /** 단계 라벨 */
  label: string;
  /** 단계 상태 */
  status: StepStatus;
  /** 추가 정보 (예: "3/5") */
  info?: string;
}

export interface ProgressStepsProps {
  /** 단계 목록 */
  steps: Step[];
  /** 추가 클래스 */
  className?: string;
  /** 방향 */
  direction?: "vertical" | "horizontal";
}

const statusConfig: Record<
  StepStatus,
  {
    icon: React.ComponentType<{ className?: string }>;
    iconClass: string;
    labelClass: string;
  }
> = {
  complete: {
    icon: CheckCircle2,
    iconClass: "text-emerald-500",
    labelClass: "text-emerald-500",
  },
  processing: {
    icon: Loader2,
    iconClass: "text-primary animate-spin",
    labelClass: "text-foreground",
  },
  pending: {
    icon: Circle,
    iconClass: "text-muted-foreground/40",
    labelClass: "text-muted-foreground",
  },
  error: {
    icon: Circle,
    iconClass: "text-destructive",
    labelClass: "text-destructive",
  },
};

/**
 * 진행 단계 표시 컴포넌트
 *
 * Figma 디자인 기준:
 * - 저장 진행 모달에서 사용
 * - 체크(완료) / 로딩(진행중) / 빈 원(대기) 아이콘
 * - 상태에 따른 색상 변화
 *
 * @example
 * // 기본 사용
 * <ProgressSteps
 *   steps={[
 *     { id: '1', label: '문서 저장', status: 'complete' },
 *     { id: '2', label: '키워드 추출', status: 'processing', info: '3/5' },
 *     { id: '3', label: '노드 생성', status: 'pending' },
 *     { id: '4', label: '관계 연결', status: 'pending' },
 *   ]}
 * />
 */
export function ProgressSteps({
  steps,
  className,
  direction = "vertical",
}: ProgressStepsProps) {
  if (direction === "horizontal") {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        {steps.map((step, index) => {
          const config = statusConfig[step.status];
          const Icon = config.icon;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <div className="flex items-center gap-2">
                <Icon className={cn("h-5 w-5", config.iconClass)} />
                <span className={cn("text-sm", config.labelClass)}>
                  {step.label}
                  {step.info && (
                    <span className="ml-1 text-muted-foreground">
                      ({step.info})
                    </span>
                  )}
                </span>
              </div>
              {!isLast && (
                <div className="flex-1 h-px bg-border min-w-[20px]" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {steps.map((step) => {
        const config = statusConfig[step.status];
        const Icon = config.icon;

        return (
          <div key={step.id} className="flex items-center gap-3">
            <Icon className={cn("h-5 w-5 shrink-0", config.iconClass)} />
            <span className={cn("text-sm", config.labelClass)}>
              {step.label}
              {step.info && (
                <span className="ml-1 text-muted-foreground">({step.info})</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * 간단한 진행 상태 표시 (텍스트 + 아이콘)
 */
export interface ProgressIndicatorProps {
  /** 현재 상태 */
  status: StepStatus;
  /** 라벨 */
  label: string;
  /** 추가 정보 */
  info?: string;
  /** 추가 클래스 */
  className?: string;
}

export function ProgressIndicator({
  status,
  label,
  info,
  className,
}: ProgressIndicatorProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Icon className={cn("h-4 w-4", config.iconClass)} />
      <span className={cn("text-sm", config.labelClass)}>
        {label}
        {info && <span className="ml-1 text-muted-foreground">({info})</span>}
      </span>
    </div>
  );
}

