"use client";

import { useRouter } from "next/navigation";
import {
  BookmarkIcon,
  FileText,
  Network,
  Plus,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/* ============================================
   Mock Data
   ============================================ */

const MOCK_STATS = {
  bookmarks: 12,
  notes: 5,
  connections: 23,
};

const MOCK_RECENT_BOOKMARKS = [
  { id: "eth-quickstart", title: "Ethereum Quickstart", service: "NODIT" },
  { id: "hardhat-setup", title: "Hardhat Environment Setup", service: "Hardhat" },
  { id: "smart-contract", title: "Smart Contract Deployment", service: "NODIT" },
];

const MOCK_RECENT_NOTES = [
  { id: "note-1", title: "Nodit + Hardhat 배포 가이드", updatedAt: "2024-12-09" },
  { id: "note-2", title: "Web3 개발 환경 설정", updatedAt: "2024-12-08" },
];

/* ============================================
   Component
   ============================================ */

export default function MySpacePage() {
  const router = useRouter();

  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            My Space
          </h1>
          <p className="text-gray-600">
            즐겨찾기한 문서와 개인 노트를 관리하고, AI와 함께 새로운 지식을 만들어보세요.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push("/my-space/bookmarks")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">즐겨찾기</p>
                  <p className="text-3xl font-semibold text-gray-900">
                    {MOCK_STATS.bookmarks}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <BookmarkIcon size={24} className="text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push("/my-space/notes")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">개인 노트</p>
                  <p className="text-3xl font-semibold text-gray-900">
                    {MOCK_STATS.notes}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileText size={24} className="text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push("/my-space/graph")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">연결</p>
                  <p className="text-3xl font-semibold text-gray-900">
                    {MOCK_STATS.connections}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Network size={24} className="text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Recent Bookmarks */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">
                최근 즐겨찾기
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/my-space/bookmarks")}
                className="text-gray-500 hover:text-gray-900"
              >
                전체 보기
                <ArrowRight size={14} className="ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_RECENT_BOOKMARKS.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/docs/${bookmark.id}`)}
                  >
                    <div className="w-8 h-8 rounded bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <BookmarkIcon size={16} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {bookmark.title}
                      </p>
                      <p className="text-xs text-gray-500">{bookmark.service}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Notes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">최근 노트</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/my-space/notes")}
                className="text-gray-500 hover:text-gray-900"
              >
                전체 보기
                <ArrowRight size={14} className="ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_RECENT_NOTES.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/my-space/notes/${note.id}`)}
                  >
                    <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <FileText size={16} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {note.title}
                      </p>
                      <p className="text-xs text-gray-500">{note.updatedAt}</p>
                    </div>
                  </div>
                ))}

                {/* Create Note Button */}
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 mt-2"
                  onClick={() => router.push("/my-space/notes/new")}
                >
                  <Plus size={16} />
                  새 노트 작성
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Assistant Card */}
        <Card className="mt-6 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-1">AI와 함께 학습하기</h3>
                  <p className="text-emerald-100 text-sm">
                    즐겨찾기 문서와 노트를 기반으로 맞춤형 가이드를 생성해보세요.
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                className="bg-white text-emerald-600 hover:bg-emerald-50"
              >
                Ask AI
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

