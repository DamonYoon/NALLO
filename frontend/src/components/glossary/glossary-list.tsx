"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  FileText,
  Grid,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryBadge } from "@/components/ui/category-badge";
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
import {
  mockGlossaryTerms,
  glossaryCategoryOptions,
  type GlossaryTerm,
  type GlossaryCategory,
} from "@/lib/mocks/glossary";

/* ============================================
   Props
   ============================================ */

interface GlossaryListProps {
  terms?: GlossaryTerm[];
  onCreateTerm?: () => void;
  onViewTerm?: (termId: string) => void;
  onEditTerm?: (termId: string) => void;
  onDuplicateTerm?: (termId: string) => void;
  onDeleteTerm?: (termId: string) => void;
}

/* ============================================
   Component
   ============================================ */

export function GlossaryList({
  terms = mockGlossaryTerms,
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
          <Button variant="brand" onClick={onCreateTerm}>
            <Plus size={16} className="mr-1.5" />
            용어 생성
          </Button>
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
                연결 문서
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
  term: GlossaryTerm;
  onView?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

function TermRow({ term, onView, onEdit, onDuplicate, onDelete }: TermItemProps) {
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

function TermCard({ term, onView, onEdit, onDuplicate, onDelete }: TermItemProps) {
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

function TermDropdownMenu({ onEdit, onDuplicate, onDelete }: TermDropdownMenuProps) {
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
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(); }}>
          편집
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate?.(); }}>
          복제
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-destructive"
          onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
        >
          삭제
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
