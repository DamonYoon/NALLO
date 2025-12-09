"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  FileText,
  BookOpen,
  Tag,
  Clock,
  ArrowRight,
  Loader2,
  Command as CommandIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

export type SearchResultType = "document" | "concept" | "page" | "tag";

export interface SearchResult {
  id: string;
  title: string;
  type: SearchResultType;
  description?: string;
  url?: string;
  metadata?: {
    lang?: string;
    documentType?: string;
    updatedAt?: string;
  };
}

interface GlobalSearchProps {
  /** Callback to perform search */
  onSearch?: (query: string) => Promise<SearchResult[]>;
  /** Callback when result is selected */
  onSelect?: (result: SearchResult) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Recent searches */
  recentSearches?: string[];
  /** Suggested searches */
  suggestions?: string[];
  /** Quick links */
  quickLinks?: Array<{ label: string; url: string; icon?: React.ReactNode }>;
  /** Custom trigger button */
  trigger?: React.ReactNode;
  /** Keyboard shortcut to open (default: cmd+k / ctrl+k) */
  shortcut?: string;
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

export function GlobalSearch({
  onSearch,
  onSelect,
  placeholder = "문서, 용어, 페이지 검색...",
  recentSearches = [],
  suggestions = [],
  quickLinks = [],
  trigger,
  shortcut = "⌘K",
  className,
}: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  // Keyboard shortcut handler
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || !onSearch) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const searchResults = await onSearch(query);
        setResults(searchResults);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      onSelect?.(result);
      setOpen(false);
      setQuery("");
    },
    [onSelect]
  );

  // Group results by type
  const groupedResults = results.reduce(
    (acc, result) => {
      if (!acc[result.type]) {
        acc[result.type] = [];
      }
      acc[result.type].push(result);
      return acc;
    },
    {} as Record<SearchResultType, SearchResult[]>
  );

  return (
    <>
      {/* Trigger Button */}
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button
          variant="outline"
          className={cn(
            "relative h-9 w-full justify-start rounded-md bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64",
            className
          )}
          onClick={() => setOpen(true)}
        >
          <Search className="mr-2 h-4 w-4" />
          <span className="hidden lg:inline-flex">검색...</span>
          <span className="inline-flex lg:hidden">검색</span>
          <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">{shortcut}</span>
          </kbd>
        </Button>
      )}

      {/* Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder={placeholder}
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Empty state */}
          {!isLoading && query && results.length === 0 && (
            <CommandEmpty>검색 결과가 없습니다</CommandEmpty>
          )}

          {/* Search Results */}
          {!isLoading &&
            Object.entries(groupedResults).map(([type, items]) => (
              <CommandGroup
                key={type}
                heading={typeLabels[type as SearchResultType]}
              >
                {items.map((result) => {
                  const Icon = typeIcons[result.type];
                  return (
                    <CommandItem
                      key={result.id}
                      value={result.title}
                      onSelect={() => handleSelect(result)}
                      className="flex items-center gap-3"
                    >
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded",
                          typeColors[result.type]
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium">
                            {result.title}
                          </span>
                          {result.metadata?.lang && (
                            <Badge variant="outline" className="text-xs">
                              {result.metadata.lang}
                            </Badge>
                          )}
                        </div>
                        {result.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {result.description}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}

          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="최근 검색">
                {recentSearches.slice(0, 5).map((search, i) => (
                  <CommandItem key={i} onSelect={() => setQuery(search)}>
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    {search}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {/* Suggestions */}
          {!query && suggestions.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="추천 검색어">
                {suggestions.slice(0, 5).map((suggestion, i) => (
                  <CommandItem key={i} onSelect={() => setQuery(suggestion)}>
                    <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                    {suggestion}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {/* Quick Links */}
          {!query && quickLinks.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="바로가기">
                {quickLinks.map((link, i) => (
                  <CommandItem
                    key={i}
                    onSelect={() => {
                      window.location.href = link.url;
                      setOpen(false);
                    }}
                  >
                    {link.icon || (
                      <CommandIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    {link.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}

// Header search bar component
export function HeaderSearchBar({
  onSearch,
  onSelect,
  className,
}: Pick<GlobalSearchProps, "onSearch" | "onSelect" | "className">) {
  return (
    <GlobalSearch
      onSearch={onSearch}
      onSelect={onSelect}
      className={className}
      recentSearches={["API 인증", "시작하기", "REST API"]}
      suggestions={["문서 작성법", "버전 관리", "용어 정의"]}
      quickLinks={[
        { label: "새 문서 만들기", url: "/documents/new" },
        { label: "용어 관리", url: "/concepts" },
        { label: "대시보드", url: "/dashboard" },
      ]}
    />
  );
}

