"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookmarkIcon,
  MoreVertical,
  Search,
  Grid,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { cn } from "@/lib/utils";

/* ============================================
   Mock Data
   ============================================ */

const MOCK_BOOKMARKS = [
  {
    id: "eth-quickstart",
    title: "Ethereum Quickstart",
    description: "Take your first steps with the Ethereum API on NODIT.",
    service: "NODIT",
    tags: ["Ethereum", "Quickstart"],
    bookmarkedAt: "2024-12-09",
  },
  {
    id: "hardhat-setup",
    title: "Hardhat Environment Setup",
    description: "Set up a complete Hardhat development environment.",
    service: "Hardhat",
    tags: ["Hardhat", "Development"],
    bookmarkedAt: "2024-12-08",
  },
  {
    id: "smart-contract",
    title: "Smart Contract Deployment",
    description: "Learn how to deploy smart contracts to Ethereum.",
    service: "NODIT",
    tags: ["Smart Contract", "Deployment"],
    bookmarkedAt: "2024-12-07",
  },
  {
    id: "web3-integration",
    title: "Web3 Integration Guide",
    description: "Integrate Web3 functionality into your application.",
    service: "NODIT",
    tags: ["Web3", "Integration"],
    bookmarkedAt: "2024-12-06",
  },
];

/* ============================================
   Component
   ============================================ */

export default function BookmarksPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-8 py-10">
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
              즐겨찾기
            </h1>
            <p className="text-gray-600 text-sm">
              총 {MOCK_BOOKMARKS.length}개의 문서
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded transition-colors",
                viewMode === "grid"
                  ? "bg-emerald-500 text-white"
                  : "text-gray-500 hover:bg-gray-100"
              )}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded transition-colors",
                viewMode === "list"
                  ? "bg-emerald-500 text-white"
                  : "text-gray-500 hover:bg-gray-100"
              )}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input placeholder="즐겨찾기 검색..." className="pl-9 bg-white" />
        </div>

        {/* Bookmarks */}
        {viewMode === "list" ? (
          <div className="space-y-3">
            {MOCK_BOOKMARKS.map((bookmark) => (
              <Card
                key={bookmark.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/docs/${bookmark.id}`)}
              >
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <BookmarkIcon size={20} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-medium text-gray-900 mb-1">
                            {bookmark.title}
                          </h3>
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {bookmark.description}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="p-1 rounded hover:bg-gray-100 text-gray-400"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <Badge variant="secondary" className="text-xs">
                          {bookmark.service}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {bookmark.bookmarkedAt}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_BOOKMARKS.map((bookmark) => (
              <Card
                key={bookmark.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/docs/${bookmark.id}`)}
              >
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <BookmarkIcon size={20} className="text-emerald-600" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {bookmark.service}
                    </Badge>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    {bookmark.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                    {bookmark.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {bookmark.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

