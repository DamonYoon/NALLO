"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  GlobalSearch,
  HeaderSearchBar,
  type SearchResult,
  type SearchResultType,
} from "@/components/search/global-search";
import { SearchResults } from "@/components/search/search-results";

// Mock search data
const mockSearchData: SearchResult[] = [
  {
    id: "d1",
    title: "REST API 인증 가이드",
    type: "document",
    description:
      "REST API를 사용하여 인증을 구현하는 방법에 대한 상세한 가이드입니다. OAuth 2.0, JWT 토큰 등을 다룹니다.",
    metadata: { lang: "ko", documentType: "guide", updatedAt: "2024-12-08" },
  },
  {
    id: "d2",
    title: "GraphQL Schema Reference",
    type: "document",
    description:
      "GraphQL 스키마의 전체 레퍼런스 문서입니다. 모든 타입, 쿼리, 뮤테이션을 포함합니다.",
    metadata: { lang: "en", documentType: "reference", updatedAt: "2024-12-05" },
  },
  {
    id: "d3",
    title: "시작하기 튜토리얼",
    type: "document",
    description:
      "처음 사용자를 위한 단계별 튜토리얼입니다. 설치부터 첫 번째 API 호출까지 안내합니다.",
    metadata: { lang: "ko", documentType: "guide", updatedAt: "2024-12-01" },
  },
  {
    id: "c1",
    title: "Access Token",
    type: "concept",
    description:
      "API 접근에 사용되는 인증 토큰. 제한된 시간 동안 유효하며 보호된 리소스에 접근할 수 있게 합니다.",
    metadata: { lang: "en" },
  },
  {
    id: "c2",
    title: "액세스 토큰",
    type: "concept",
    description:
      "API 접근에 사용되는 인증 토큰입니다. 제한된 시간 동안 유효하며 보호된 리소스에 접근할 수 있게 합니다.",
    metadata: { lang: "ko" },
  },
  {
    id: "c3",
    title: "OAuth 2.0",
    type: "concept",
    description:
      "산업 표준 인증 프로토콜. 써드파티 애플리케이션에 제한된 접근 권한을 부여합니다.",
    metadata: { lang: "en" },
  },
  {
    id: "p1",
    title: "Getting Started",
    type: "page",
    description: "문서 시작 페이지입니다.",
    metadata: { lang: "ko" },
  },
  {
    id: "p2",
    title: "API Reference",
    type: "page",
    description: "API 레퍼런스 페이지입니다.",
    metadata: { lang: "en" },
  },
  {
    id: "t1",
    title: "authentication",
    type: "tag",
    description: "인증 관련 문서에 사용되는 태그",
  },
  {
    id: "t2",
    title: "api",
    type: "tag",
    description: "API 관련 문서에 사용되는 태그",
  },
];

// Mock search function
async function mockSearch(query: string): Promise<SearchResult[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();
  return mockSearchData.filter(
    (item) =>
      item.title.toLowerCase().includes(lowerQuery) ||
      item.description?.toLowerCase().includes(lowerQuery)
  );
}

export default function SearchPlayground() {
  const [directQuery, setDirectQuery] = useState("");
  const [directResults, setDirectResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilter, setActiveFilter] = useState<SearchResultType | "all">(
    "all"
  );
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(
    null
  );

  const handleDirectSearch = async (query: string) => {
    setDirectQuery(query);
    if (!query.trim()) {
      setDirectResults([]);
      return;
    }
    setIsSearching(true);
    const results = await mockSearch(query);
    setDirectResults(results);
    setIsSearching(false);
  };

  const handleResultSelect = (result: SearchResult) => {
    setSelectedResult(result);
    alert(`선택: ${result.title} (${result.type})`);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Link href="/playground">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold">Search Components</h1>
            <p className="text-sm text-muted-foreground">
              통합 검색 컴포넌트 모음
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Header Search Bar Demo */}
          <HeaderSearchBar
            onSearch={mockSearch}
            onSelect={handleResultSelect}
          />
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto space-y-8">
        {/* GlobalSearch Demo */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">
            GlobalSearch (Command Palette)
          </h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">기본 사용법</CardTitle>
              <CardDescription>
                버튼을 클릭하거나 <kbd className="px-1 py-0.5 bg-muted rounded text-xs">⌘K</kbd>{" "}
                단축키로 검색 팔레트를 열 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <GlobalSearch
                  onSearch={mockSearch}
                  onSelect={handleResultSelect}
                  recentSearches={["API 인증", "시작하기", "REST API"]}
                  suggestions={["문서 작성법", "버전 관리", "용어 정의"]}
                  quickLinks={[
                    { label: "새 문서 만들기", url: "#" },
                    { label: "용어 관리", url: "#" },
                    { label: "대시보드", url: "#" },
                  ]}
                />
                <GlobalSearch
                  trigger={
                    <Button variant="secondary">커스텀 트리거 버튼</Button>
                  }
                  onSearch={mockSearch}
                  onSelect={handleResultSelect}
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* SearchResults Demo */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">SearchResults (검색 결과)</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">검색 결과 페이지</CardTitle>
              <CardDescription>
                검색어를 입력하면 결과가 표시됩니다. 필터를 사용하여 결과를
                좁힐 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search Input */}
              <div className="space-y-2">
                <Label htmlFor="search">검색어 입력</Label>
                <Input
                  id="search"
                  placeholder="검색어를 입력하세요 (예: API, 토큰, 시작)"
                  value={directQuery}
                  onChange={(e) => handleDirectSearch(e.target.value)}
                />
              </div>

              {/* Results */}
              {directQuery ? (
                <SearchResults
                  results={directResults}
                  query={directQuery}
                  isLoading={isSearching}
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                  onResultClick={handleResultSelect}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>검색어를 입력하면 결과가 표시됩니다</p>
                  <p className="text-sm mt-1">
                    예시: &quot;API&quot;, &quot;토큰&quot;, &quot;시작&quot;
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* All Mock Data */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">전체 Mock 데이터</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                테스트용 데이터 ({mockSearchData.length}개)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SearchResults
                results={mockSearchData}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                onResultClick={handleResultSelect}
              />
            </CardContent>
          </Card>
        </section>

        {/* Selected Result */}
        {selectedResult && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">선택된 결과</h2>
            <Card>
              <CardContent className="p-4">
                <pre className="text-sm bg-muted p-4 rounded overflow-auto">
                  {JSON.stringify(selectedResult, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </section>
        )}
      </div>

      {/* Tips */}
      <div className="border-t p-4 bg-muted/30">
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <span className="font-medium">💡 Tips:</span>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>GlobalSearch</strong>: Command Palette 스타일, ⌘K 단축키 지원
            </li>
            <li>
              <strong>HeaderSearchBar</strong>: 헤더에 배치할 수 있는 검색 바
            </li>
            <li>
              <strong>SearchResults</strong>: 검색 결과 목록, 필터링, 하이라이팅
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

