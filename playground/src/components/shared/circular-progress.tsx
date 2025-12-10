"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface CircularProgressProps {
  /** 현재 값 (0-100 또는 max까지) */
  value: number;
  /** 최대값 (기본: 100) */
  max?: number;
  /** 원의 크기 (px) */
  size?: number;
  /** 선 두께 (px) */
  strokeWidth?: number;
  /** 진행률 색상 */
  progressColor?: string;
  /** 배경 트랙 색상 */
  trackColor?: string;
  /** 중앙에 표시할 내용 */
  children?: React.ReactNode;
  /** 값 표시 여부 (children이 없을 때) */
  showValue?: boolean;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 원형 진행률 차트 컴포넌트
 *
 * Figma 디자인 기준:
 * - 82/100 스타일의 도넛 차트
 * - 중앙에 현재 점수와 최대값 표시
 * - NALLO primary color (#fc8658) 사용
 *
 * @example
 * // 기본 사용
 * <CircularProgress value={82} />
 *
 * @example
 * // 커스텀 크기 및 색상
 * <CircularProgress
 *   value={75}
 *   size={160}
 *   progressColor="#10B981"
 * />
 *
 * @example
 * // 커스텀 중앙 콘텐츠
 * <CircularProgress value={82}>
 *   <div className="text-center">
 *     <span className="text-3xl font-bold">82</span>
 *     <span className="text-sm text-muted-foreground">/ 100</span>
 *   </div>
 * </CircularProgress>
 */
export function CircularProgress({
  value,
  max = 100,
  size = 140,
  strokeWidth = 10,
  progressColor = "#fc8658",
  trackColor = "#f3f4f6",
  children,
  showValue = true,
  className,
}: CircularProgressProps) {
  // 값 정규화 (0-100%)
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  // SVG 원 계산
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // 중앙점
  const center = size / 2;

  // 원 크기에 비례하는 폰트 크기 계산
  const valueFontSize = Math.max(size * 0.22, 12); // 최소 12px
  const maxFontSize = Math.max(size * 0.1, 8); // 최소 8px

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      {/* SVG 원형 차트 */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* 배경 트랙 */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* 진행률 */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500 ease-out"
        />
      </svg>

      {/* 중앙 콘텐츠 */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children ? (
          children
        ) : showValue ? (
          <div className="text-center flex items-baseline justify-center">
            <span
              className="font-bold text-foreground"
              style={{ fontSize: valueFontSize }}
            >
              {value}
            </span>
            <span
              className="text-muted-foreground ml-0.5"
              style={{ fontSize: maxFontSize }}
            >
              / {max}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * 점수와 함께 원형 진행률을 표시하는 컴포넌트
 */
export interface ScoreCircleProps extends Omit<CircularProgressProps, "children" | "showValue"> {
  /** 점수 라벨 */
  label?: string;
}

export function ScoreCircle({
  value,
  max = 100,
  label,
  ...props
}: ScoreCircleProps) {
  // 점수에 따른 색상 결정
  const getColorByScore = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "#10B981"; // 초록
    if (percentage >= 60) return "#fc8658"; // 주황 (NALLO primary)
    if (percentage >= 40) return "#F59E0B"; // 노랑
    return "#EF4444"; // 빨강
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <CircularProgress
        value={value}
        max={max}
        progressColor={getColorByScore(value, max)}
        {...props}
      />
      {label && (
        <span className="text-sm text-muted-foreground">{label}</span>
      )}
    </div>
  );
}

