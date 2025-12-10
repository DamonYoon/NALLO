"use client";

/**
 * Graph View Playground
 *
 * Neo4j NVL 기반 그래프 시각화 테스트 페이지
 */

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// NVL은 SSR을 지원하지 않으므로 동적 임포트
const GraphView = dynamic(
  () => import("@/components/graph").then((mod) => mod.GraphView),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-[#0d0d0d]">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full mx-auto bg-[#2a2a2a]" />
          <p className="text-sm text-[#9ca3af]">그래프 로딩 중...</p>
        </div>
      </div>
    ),
  }
);

export default function GraphViewPlayground() {
  return (
    <div className="h-screen w-full flex flex-col bg-[#0d0d0d]">
      {/* 헤더 */}
      <header className="h-14 bg-[#1e1e1e] border-b border-[#2a2a2a] flex items-center px-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-[#e5e5e5]">
            🔗 그래프
          </span>
          <span className="text-sm text-[#9ca3af]">Neo4j NVL 시각화</span>
        </div>
      </header>

      {/* 그래프 뷰 */}
      <GraphView className="flex-1" />
    </div>
  );
}
