"use client";

import { FileText, BookOpen, Tag, ChevronRight, Filter } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";

import type { SearchResult, SearchResultType } from "./global-search";

interface SearchResultsProps {
  /** Search results */
  results: SearchResult[];
  /** Search query for highlighting */
  query?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Active filter */
  activeFilter?: SearchResultType | "all";
  /** Filter change callback */
  onFilterChange?: (filter: SearchResultType | "all") => void;
  /** Result click callback */
  onResultClick?: (result: SearchResult) => void;
  /** Show filters */
  showFilters?: boolean;
  /** Additional class name */
  className?: string;
}

const typeIcons: Record<SearchResultType, typeof FileText> = {
  document: FileText,
  concept: BookOpen,
  page: FileText,
  tag: Tag,
};

const typeLabels: Record<SearchResultType, string> = {
  document: "문서",
  concept: "용어",
  page: "페이지",
  tag: "태그",
};

const typeColors: Record<SearchResultType, string> = {
  document: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  concept:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  page: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  tag: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
};

// Highlight matching text
function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export function SearchResults({
  results,
  query = "",
  isLoading = false,
  activeFilter = "all",
  onFilterChange,
  onResultClick,
  showFilters = true,
  className,
}: SearchResultsProps) {
  // Count by type
  const typeCounts = results.reduce(
    (acc, result) => {
      acc[result.type] = (acc[result.type] || 0) + 1;
      return acc;
    },
    {} as Record<SearchResultType, number>
  );

  // Filter results
  const filteredResults =
    activeFilter === "all"
      ? results
      : results.filter((r) => r.type === activeFilter);

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {showFilters && (
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20" />
            ))}
          </div>
        )}
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <EmptyState
        variant="no-results"
        title="검색 결과가 없습니다"
        description={`"${query}"에 대한 검색 결과를 찾을 수 없습니다.`}
        action={
          onFilterChange
            ? {
                label: "필터 초기화",
                onClick: () => onFilterChange("all"),
                variant: "outline",
              }
            : undefined
        }
        className={className}
      />
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filters */}
      {showFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Button
            variant={activeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange?.("all")}
          >
            전체 ({results.length})
          </Button>
          {(Object.keys(typeLabels) as SearchResultType[]).map((type) => {
            const count = typeCounts[type] || 0;
            if (count === 0) return null;
            return (
              <Button
                key={type}
                variant={activeFilter === type ? "default" : "outline"}
                size="sm"
                onClick={() => onFilterChange?.(type)}
              >
                {typeLabels[type]} ({count})
              </Button>
            );
          })}
        </div>
      )}

      {/* Results List */}
      <div className="space-y-3">
        {filteredResults.map((result) => {
          const Icon = typeIcons[result.type];
          return (
            <Card
              key={result.id}
              className={cn(
                "transition-colors",
                onResultClick && "cursor-pointer hover:bg-accent"
              )}
              onClick={() => onResultClick?.(result)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded",
                      typeColors[result.type]
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">
                        {highlightText(result.title, query)}
                      </h3>
                      <Badge
                        variant="secondary"
                        className={cn("shrink-0 text-xs", typeColors[result.type])}
                      >
                        {typeLabels[result.type]}
                      </Badge>
                      {result.metadata?.lang && (
                        <Badge variant="outline" className="shrink-0 text-xs">
                          {result.metadata.lang}
                        </Badge>
                      )}
                    </div>

                    {result.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {highlightText(result.description, query)}
                      </p>
                    )}

                    {result.metadata?.updatedAt && (
                      <p className="text-xs text-muted-foreground">
                        최근 수정:{" "}
                        {new Date(result.metadata.updatedAt).toLocaleDateString(
                          "ko-KR"
                        )}
                      </p>
                    )}
                  </div>

                  {/* Arrow */}
                  {onResultClick && (
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground text-center">
        {filteredResults.length}개 결과
        {activeFilter !== "all" && ` (${typeLabels[activeFilter]})`}
      </p>
    </div>
  );
}

