"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, FileText, MoreVertical, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

/* ============================================
   Mock Data
   ============================================ */

const MOCK_NOTES = [
  {
    id: "note-1",
    title: "Nodit + Hardhat 배포 가이드",
    excerpt: "Nodit API와 Hardhat을 사용하여 스마트 컨트랙트를 배포하는 방법...",
    updatedAt: "2024-12-09",
    tags: ["Ethereum", "Hardhat", "배포"],
  },
  {
    id: "note-2",
    title: "Web3 개발 환경 설정",
    excerpt: "로컬 개발 환경에서 Web3 프로젝트를 시작하기 위한 설정 가이드...",
    updatedAt: "2024-12-08",
    tags: ["Web3", "개발환경"],
  },
  {
    id: "note-3",
    title: "NFT 민팅 프로세스 정리",
    excerpt: "ERC-721 토큰을 활용한 NFT 민팅 과정 요약...",
    updatedAt: "2024-12-07",
    tags: ["NFT", "ERC-721"],
  },
];

/* ============================================
   Component
   ============================================ */

export default function NotesListPage() {
  const router = useRouter();

  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-8 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/my-space")}
            className="text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft size={16} className="mr-2" />
            My Space
          </Button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
              개인 노트
            </h1>
            <p className="text-gray-600 text-sm">
              총 {MOCK_NOTES.length}개의 노트
            </p>
          </div>
          <Button
            variant="brand"
            onClick={() => router.push("/my-space/notes/new")}
          >
            <Plus size={16} className="mr-2" />
            새 노트 작성
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            placeholder="노트 검색..."
            className="pl-9 bg-white"
          />
        </div>

        {/* Notes List */}
        <div className="space-y-3">
          {MOCK_NOTES.map((note) => (
            <Card
              key={note.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/my-space/notes/${note.id}`)}
            >
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <FileText size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">
                          {note.title}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {note.excerpt}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: 드롭다운 메뉴
                        }}
                        className="p-1 rounded hover:bg-gray-100 text-gray-400"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-xs text-gray-400">
                        {note.updatedAt}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {note.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

