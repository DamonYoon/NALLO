"use client";

/**
 * 개인 지식 그래프 페이지
 * 
 * 사용자의 즐겨찾기 문서와 개인 노트를 그래프로 시각화합니다.
 * TODO: 실제 그래프 뷰 구현 (현재는 placeholder)
 */

import { useRouter } from "next/navigation";
import { ArrowLeft, Network, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";

export default function MySpaceGraphPage() {
  const router = useRouter();

  return (
    <div className="flex-1 bg-[#0a0a0a] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/my-space")}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft size={16} className="mr-2" />
            My Space
          </Button>
          <div className="w-px h-6 bg-[#333333]" />
          <div className="flex items-center gap-2">
            <Network size={20} className="text-emerald-500" />
            <h1 className="text-white font-medium">My Knowledge Graph</h1>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#1e1e1e] border border-[#333333] rounded-lg px-3 py-1.5">
            <IconButton variant="dark" size="sm">
              <ZoomOut size={16} />
            </IconButton>
            <span className="text-white text-sm w-12 text-center">100%</span>
            <IconButton variant="dark" size="sm">
              <ZoomIn size={16} />
            </IconButton>
            <div className="w-px h-5 bg-[#333333] mx-1" />
            <IconButton variant="dark" size="sm">
              <Maximize2 size={16} />
            </IconButton>
          </div>
        </div>
      </div>

      {/* Graph Canvas Placeholder */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-[#1e1e1e] border border-[#333333] flex items-center justify-center mx-auto mb-6">
            <Network size={48} className="text-emerald-500" />
          </div>
          <h2 className="text-xl font-medium text-white mb-2">
            개인 지식 그래프
          </h2>
          <p className="text-gray-400 max-w-md">
            즐겨찾기한 문서와 개인 노트들의 연결 관계를 시각화합니다.
            <br />
            문서를 즐겨찾기하거나 노트를 작성하면 여기에 표시됩니다.
          </p>
          <Button
            variant="brand"
            className="mt-6"
            onClick={() => router.push("/docs")}
          >
            문서 탐색하기
          </Button>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="px-6 py-3 border-t border-[#2a2a2a]">
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <span>
            <span className="text-white">12</span> 즐겨찾기
          </span>
          <span>•</span>
          <span>
            <span className="text-white">5</span> 노트
          </span>
          <span>•</span>
          <span>
            <span className="text-white">23</span> 연결
          </span>
        </div>
      </div>
    </div>
  );
}

