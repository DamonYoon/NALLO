"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  FileText,
  Grid,
  List,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryBadge } from "@/components/ui/category-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { IconButton } from "@/components/ui/icon-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useConcepts, useConceptRelations } from "@/lib/api";
import type { Concept, ConceptRelationCounts } from "@/lib/api";
import {
  mockGlossaryTerms,
  glossaryCategoryOptions,
  type GlossaryTerm,
  type GlossaryCategory,
} from "@/lib/mocks/glossary";

/* ============================================
   Types
   ============================================ */

// Unified display type
interface DisplayTerm {
  id: string;
  name: string;
  description: string;
  category: GlossaryCategory;
  documentCount: number;
  linkedDocumentCount: number;
  lastModified: string;
}

interface GlossaryListProps {
  useMockData?: boolean;
  onCreateTerm?: () => void;
  onViewTerm?: (termId: string) => void;
  onEditTerm?: (termId: string) => void;
  onDuplicateTerm?: (termId: string) => void;
  onDeleteTerm?: (termId: string) => void;
}

/* ============================================
   Helpers
   ============================================ */

// Infer category from term description (simple heuristic)
function inferCategory(term: string, description: string): GlossaryCategory {
  const text = `${term} ${description}`.toLowerCase();

  if (
    text.includes("api") ||
    text.includes("endpoint") ||
    text.includes("response") ||
    text.includes("request")
  ) {
    return "API 요소";
  }
  if (
    text.includes("기능") ||
    text.includes("인증") ||
    text.includes("권한") ||
    text.includes("설정")
  ) {
    return "기능";
  }
  return "개념";
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "방금 전";
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;

  return date
    .toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\. /g, ".")
    .replace(/\.$/, "");
}

function transformApiConcept(
  concept: Concept,
  relationCounts?: Map<string, ConceptRelationCounts>
): DisplayTerm {
  const relations = relationCounts?.get(concept.id);
  return {
    id: concept.id,
    name: concept.term,
    description: concept.description,
    category: inferCategory(concept.term, concept.description),
    documentCount: relations?.documentCount ?? 0,
    linkedDocumentCount: relations?.relatedConceptCount ?? 0,
    lastModified: formatRelativeTime(concept.updated_at),
  };
}

function transformMockTerm(term: GlossaryTerm): DisplayTerm {
  return {
    id: term.id,
    name: term.name,
    description: term.description,
    category: term.category,
    documentCount: term.documentCount,
    linkedDocumentCount: term.linkedDocumentCount,
    lastModified: term.lastModified,
  };
}

/* ============================================
   Component
   ============================================ */

export function GlossaryList({
  useMockData = false,
  onCreateTerm,
  onViewTerm,
  onEditTerm,
  onDuplicateTerm,
  onDeleteTerm,
}: GlossaryListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // API Queries
  const {
    data: apiData,
    isLoading,
    isError,
    error,
    refetch,
  } = useConcepts({ limit: 100 });

  // Fetch concept relation counts (document count, related concept count)
  const { data: relationData } = useConceptRelations();

  // Build relation counts map for efficient lookup
  const relationCountsMap = new Map<string, ConceptRelationCounts>();
  if (relationData) {
    for (const relation of relationData) {
      relationCountsMap.set(relation.conceptId, relation);
    }
  }

  // Transform data based on source
  const terms: DisplayTerm[] = useMockData
    ? mockGlossaryTerms.map(transformMockTerm)
    : (apiData?.items || []).map((c) =>
        transformApiConcept(c, relationCountsMap)
      );

  const filteredTerms = terms.filter((term) => {
    const matchesSearch =
      term.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredTerms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTerms = filteredTerms.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Loading state
  if (isLoading && !useMockData) {
    return <GlossaryListSkeleton />;
  }

  // Error state
  if (isError && !useMockData) {
    return <GlossaryListError error={error} onRetry={() => refetch()} />;
  }

  return (
    <div className="flex-1 bg-muted overflow-auto">
      <div className="max-w-[1200px] mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-foreground">용어집</h1>
            <p className="text-sm text-muted-foreground mt-1">
              프로젝트에서 자주 사용하는 중요한 용어를 등록해보세요.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!useMockData && (
              <IconButton variant="muted" onClick={() => refetch()}>
                <RefreshCw size={16} />
              </IconButton>
            )}
            <Button variant="brand" onClick={onCreateTerm}>
              <Plus size={16} className="mr-1.5" />
              용어 생성
            </Button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-card rounded-xl p-5 mb-5 shadow-sm border border-border">
          <div className="flex gap-3 items-center">
            {/* Category Dropdown */}
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="카테고리" />
              </SelectTrigger>
              <SelectContent>
                {glossaryCategoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Search Input */}
            <div className="flex-1 relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="용어명을 입력하세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-muted rounded-md p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  viewMode === "grid"
                    ? "bg-brand text-white"
                    : "text-muted-foreground hover:bg-background"
                )}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  viewMode === "list"
                    ? "bg-brand text-white"
                    : "text-muted-foreground hover:bg-background"
                )}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            총 {filteredTerms.length}개 용어
          </div>
        </div>

        {/* Terms List */}
        {viewMode === "list" ? (
          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[2fr_1fr_100px_100px_120px_48px] gap-4 px-5 py-3 bg-muted/50 border-b border-border">
              <div className="text-xs font-medium text-muted-foreground">
                용어명
              </div>
              <div className="text-xs font-medium text-muted-foreground">
                카테고리
              </div>
              <div className="text-xs font-medium text-muted-foreground text-center">
                문서 수
              </div>
              <div className="text-xs font-medium text-muted-foreground text-center">
                연결 용어
              </div>
              <div className="text-xs font-medium text-muted-foreground text-center">
                최근 수정일
              </div>
              <div></div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-border">
              {paginatedTerms.map((term) => (
                <TermRow
                  key={term.id}
                  term={term}
                  onView={() => onViewTerm?.(term.id)}
                  onEdit={() => onEditTerm?.(term.id)}
                  onDuplicate={() => onDuplicateTerm?.(term.id)}
                  onDelete={() => onDeleteTerm?.(term.id)}
                />
              ))}
            </div>

            {/* Empty State */}
            {paginatedTerms.length === 0 && (
              <div className="py-12 text-center">
                <FileText
                  size={48}
                  className="mx-auto text-muted-foreground/50 mb-4"
                />
                <p className="text-muted-foreground">
                  {searchQuery ? "검색 결과가 없습니다" : "용어가 없습니다"}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedTerms.map((term) => (
              <TermCard
                key={term.id}
                term={term}
                onView={() => onViewTerm?.(term.id)}
                onEdit={() => onEditTerm?.(term.id)}
                onDuplicate={() => onDuplicateTerm?.(term.id)}
                onDelete={() => onDeleteTerm?.(term.id)}
              />
            ))}
          </div>
        )}

        {/* Empty State for Grid */}
        {viewMode === "grid" && paginatedTerms.length === 0 && (
          <div className="py-12 text-center">
            <FileText
              size={48}
              className="mx-auto text-muted-foreground/50 mb-4"
            />
            <p className="text-muted-foreground">
              {searchQuery ? "검색 결과가 없습니다" : "용어가 없습니다"}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              {startIndex + 1}-
              {Math.min(startIndex + itemsPerPage, filteredTerms.length)} of{" "}
              {filteredTerms.length}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                이전
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "w-8 h-8 rounded-md text-sm transition-colors",
                        currentPage === page
                          ? "bg-brand text-white"
                          : "bg-card border border-border text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
              >
                다음
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================
   Term Row Subcomponent
   ============================================ */

interface TermItemProps {
  term: DisplayTerm;
  onView?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

function TermRow({
  term,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
}: TermItemProps) {
  return (
    <div
      onClick={onView}
      className="grid grid-cols-[2fr_1fr_100px_100px_120px_48px] gap-4 px-5 py-4 hover:bg-muted/30 transition-colors cursor-pointer group"
    >
      {/* Term Name & Description */}
      <div className="min-w-0">
        <div className="text-sm text-foreground mb-1 group-hover:text-brand transition-colors">
          {term.name}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {term.description}
        </div>
      </div>

      {/* Category */}
      <div className="flex items-center">
        <CategoryBadge category={term.category} />
      </div>

      {/* Document Count */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-1.5 text-sm text-foreground">
          <FileText size={14} className="text-muted-foreground" />
          <span>{term.documentCount}</span>
        </div>
      </div>

      {/* Linked Document Count */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-1.5 text-sm text-foreground">
          <FileText size={14} className="text-muted-foreground" />
          <span>{term.linkedDocumentCount}</span>
        </div>
      </div>

      {/* Last Modified */}
      <div className="flex items-center justify-center text-sm text-muted-foreground">
        {term.lastModified}
      </div>

      {/* More Actions */}
      <div className="flex items-center justify-center">
        <TermDropdownMenu
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}

/* ============================================
   Term Card Subcomponent
   ============================================ */

function TermCard({
  term,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
}: TermItemProps) {
  return (
    <div
      onClick={onView}
      className="bg-card rounded-xl p-5 shadow-sm border border-border hover:border-brand/50 hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <CategoryBadge category={term.category} />
        <TermDropdownMenu
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      </div>

      <h3 className="text-base font-medium text-foreground mb-2 group-hover:text-brand transition-colors">
        {term.name}
      </h3>
      <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
        {term.description}
      </p>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <FileText size={12} />
          <span>문서 {term.documentCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <FileText size={12} />
          <span>연결 {term.linkedDocumentCount}</span>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   Term Dropdown Menu Subcomponent
   ============================================ */

interface TermDropdownMenuProps {
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

function TermDropdownMenu({
  onEdit,
  onDuplicate,
  onDelete,
}: TermDropdownMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="p-1 rounded text-muted-foreground hover:bg-border transition-colors opacity-0 group-hover:opacity-100"
        >
          <MoreVertical size={16} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.();
          }}
        >
          편집
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate?.();
          }}
        >
          복제
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
        >
          삭제
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ============================================
   Loading Skeleton
   ============================================ */

function GlossaryListSkeleton() {
  return (
    <div className="flex-1 bg-muted overflow-auto">
      <div className="max-w-[1200px] mx-auto px-6 py-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>

        {/* Filter Skeleton */}
        <div className="bg-card rounded-xl p-5 mb-5 shadow-sm border border-border">
          <div className="flex gap-3 items-center">
            <Skeleton className="h-10 w-[160px]" />
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="px-5 py-3 bg-muted/50 border-b border-border">
            <Skeleton className="h-4 w-full" />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-5 py-4 border-b border-border">
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================
   Error State
   ============================================ */

interface GlossaryListErrorProps {
  error: Error | null;
  onRetry: () => void;
}

function GlossaryListError({ error, onRetry }: GlossaryListErrorProps) {
  return (
    <div className="flex-1 bg-muted overflow-auto">
      <div className="max-w-[1200px] mx-auto px-6 py-6">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle size={48} className="text-destructive mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            용어집을 불러오는데 실패했습니다
          </h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-md">
            {error?.message ||
              "서버와의 연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요."}
          </p>
          <Button onClick={onRetry}>
            <RefreshCw size={16} className="mr-2" />
            다시 시도
          </Button>
        </div>
      </div>
    </div>
  );
}
