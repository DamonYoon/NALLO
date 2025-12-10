"use client";

/**
 * GraphLoading - 그래프 로딩 스켈레톤 UI
 *
 * 그래프가 로드되는 동안 표시되는 시각적 피드백
 *
 * - GraphLoading: 전체 페이지용 (필터 패널 스켈레톤 포함)
 * - GraphLoadingInline: 그래프 캔버스 영역용 (dynamic import loading)
 */

import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { GRAPH_BG_COLOR } from "./types";

// 가상 노드 위치 (스켈레톤용)
const SKELETON_NODES = [
  { x: 50, y: 40, size: 48, delay: 0 },
  { x: 30, y: 55, size: 36, delay: 0.1 },
  { x: 70, y: 50, size: 40, delay: 0.15 },
  { x: 45, y: 65, size: 32, delay: 0.2 },
  { x: 60, y: 30, size: 28, delay: 0.25 },
  { x: 25, y: 35, size: 24, delay: 0.3 },
  { x: 75, y: 65, size: 30, delay: 0.35 },
  { x: 40, y: 25, size: 26, delay: 0.4 },
  { x: 55, y: 75, size: 34, delay: 0.45 },
  { x: 80, y: 40, size: 22, delay: 0.5 },
  { x: 20, y: 70, size: 28, delay: 0.55 },
  { x: 65, y: 80, size: 20, delay: 0.6 },
];

// 가상 엣지 연결
const SKELETON_EDGES = [
  { from: 0, to: 1 },
  { from: 0, to: 2 },
  { from: 0, to: 4 },
  { from: 1, to: 3 },
  { from: 2, to: 6 },
  { from: 3, to: 8 },
  { from: 4, to: 7 },
  { from: 5, to: 1 },
  { from: 6, to: 9 },
  { from: 7, to: 4 },
  { from: 8, to: 10 },
  { from: 9, to: 11 },
];

interface GraphLoadingProps {
  className?: string;
}

export function GraphLoading({ className }: GraphLoadingProps) {
  return (
    <div
      className={cn("flex-1 relative overflow-hidden", className)}
      style={{ backgroundColor: GRAPH_BG_COLOR }}
    >
      {/* 스켈레톤 엣지 */}
      <svg className="absolute inset-0 w-full h-full">
        {SKELETON_EDGES.map((edge, idx) => {
          const from = SKELETON_NODES[edge.from];
          const to = SKELETON_NODES[edge.to];
          return (
            <motion.line
              key={`edge-${idx}`}
              x1={`${from.x}%`}
              y1={`${from.y}%`}
              x2={`${to.x}%`}
              y2={`${to.y}%`}
              stroke="var(--border)"
              strokeWidth={1}
              strokeOpacity={0.3}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{
                duration: 0.8,
                delay: Math.max(from.delay, to.delay),
                ease: "easeOut",
              }}
            />
          );
        })}
      </svg>

      {/* 스켈레톤 노드 */}
      {SKELETON_NODES.map((node, idx) => (
        <motion.div
          key={`node-${idx}`}
          className="absolute"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            transform: "translate(-50%, -50%)",
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.4,
            delay: node.delay,
            ease: [0.34, 1.56, 0.64, 1], // spring-like
          }}
        >
          <Skeleton
            variant="circular"
            animation="pulse"
            className="bg-border/40"
            style={{
              width: node.size,
              height: node.size,
            }}
          />
        </motion.div>
      ))}

      {/* 중앙 로딩 인디케이터 */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {/* 펄스 링 애니메이션 */}
        <div className="relative">
          <motion.div
            className="w-16 h-16 rounded-full border-2 border-brand/30"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute inset-0 w-16 h-16 rounded-full border-2 border-brand/50"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.7, 0.2, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-3 h-3 rounded-full bg-brand"
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </div>

        {/* 로딩 텍스트 */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-sm text-text-secondary font-medium">
            그래프 로딩 중
          </p>
          <p className="text-xs text-text-tertiary mt-1">
            노드와 관계를 불러오고 있습니다...
          </p>
        </motion.div>
      </motion.div>

      {/* 스켈레톤 필터 패널 힌트 */}
      <div className="absolute left-0 top-0 bottom-0 w-filter border-r border-border/30 p-5 space-y-4">
        <Skeleton className="h-5 w-20 bg-border/30" />
        <Skeleton className="h-10 w-full bg-border/20" />
        <div className="pt-4 space-y-2">
          <Skeleton className="h-4 w-16 bg-border/30" />
          <Skeleton className="h-12 w-full bg-border/20" />
          <Skeleton className="h-12 w-full bg-border/20" />
          <Skeleton className="h-12 w-full bg-border/20" />
        </div>
      </div>
    </div>
  );
}

// ========================================
// Inline Loading (그래프 캔버스 영역용)
// ========================================

/**
 * GraphLoadingInline - 그래프 캔버스 내부 로딩 UI
 *
 * dynamic import의 loading 옵션에서 사용
 * 필터 패널은 이미 렌더링되어 있으므로 캔버스 영역만 표시
 */
export function GraphLoadingInline() {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-4"
      style={{ backgroundColor: GRAPH_BG_COLOR }}
    >
      {/* 펄스 링 애니메이션 */}
      <div className="relative">
        <motion.div
          className="w-16 h-16 rounded-full border-2 border-brand/30"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute inset-0 w-16 h-16 rounded-full border-2 border-brand/50"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.7, 0.2, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-3 h-3 rounded-full bg-brand"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </div>

      {/* 로딩 텍스트 */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-sm text-text-secondary font-medium">
          그래프 로딩 중
        </p>
        <p className="text-xs text-text-tertiary mt-1">
          노드와 관계를 불러오고 있습니다...
        </p>
      </motion.div>

      {/* 스켈레톤 노드들 (배경) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {SKELETON_NODES.slice(0, 8).map((node, idx) => (
          <motion.div
            key={`inline-node-${idx}`}
            className="absolute"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: "translate(-50%, -50%)",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.4 }}
            transition={{
              duration: 0.5,
              delay: node.delay * 0.5,
              ease: [0.34, 1.56, 0.64, 1],
            }}
          >
            <Skeleton
              variant="circular"
              animation="pulse"
              className="bg-border/30"
              style={{
                width: node.size * 0.7,
                height: node.size * 0.7,
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
