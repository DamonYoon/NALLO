"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  FileText,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconButton } from "@/components/ui/icon-button";
import { StatusBadge, type DocumentStatus } from "@/components/ui/status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useDocuments } from "@/lib/api";
import type { Document as ApiDocument, DocumentStatus as ApiDocumentStatus, DocumentType as ApiDocumentType } from "@/lib/api";

// Mock data for fallback (development only)
import {
  mockDocuments,
  documentTypeLabels,
  type Document as MockDocument,
} from "@/lib/mocks/documents";

/* ============================================
   Types
   ============================================ */

// Unified document type for display
interface DisplayDocument {
  id: string;
  title: string;
  type: string;
  typeLabel: string;
  status: DocumentStatus;
  author: string;
  updatedAt: string;
  version: string;
  linkedTerms: number;
}

interface DocumentListProps {
  useMockData?: boolean; // Flag to use mock data for development
  onViewDocument?: (docId: string) => void;
  onEditDocument?: (docId: string) => void;
  onDeleteDocument?: (docId: string) => void;
  onCreateDocument?: () => void;
  onBulkDelete?: (docIds: string[]) => void;
}

/* ============================================
   Helpers
   ============================================ */

const API_TYPE_LABELS: Record<ApiDocumentType, string> = {
  api: "API Guide",
  general: "General",
  tutorial: "Tutorial",
};

const API_STATUS_MAP: Record<ApiDocumentStatus, DocumentStatus> = {
  draft: "Draft",
  in_review: "In Review",
  done: "Done",
  publish: "Publish",
};

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "방금 전";
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).replace(/\. /g, ".").replace(/\.$/, "");
}

function transformApiDocument(doc: ApiDocument): DisplayDocument {
  return {
    id: doc.id,
    title: doc.title,
    type: doc.type,
    typeLabel: API_TYPE_LABELS[doc.type] || doc.type,
    status: API_STATUS_MAP[doc.status] || "Draft",
    author: "Admin", // TODO: Add author field to backend
    updatedAt: formatRelativeTime(doc.updated_at),
    version: "v1.0.0", // TODO: Add version field to backend
    linkedTerms: 0, // TODO: Fetch linked concepts count
  };
}

function transformMockDocument(doc: MockDocument): DisplayDocument {
  return {
    id: doc.id,
    title: doc.title,
    type: doc.type,
    typeLabel: documentTypeLabels[doc.type],
    status: doc.status,
    author: doc.author,
    updatedAt: doc.updatedAt,
    version: doc.version,
    linkedTerms: doc.linkedTerms,
  };
}

/* ============================================
   Component
   ============================================ */

export function DocumentList({
  useMockData = false,
  onViewDocument,
  onEditDocument,
  onDeleteDocument,
  onCreateDocument,
  onBulkDelete,
}: DocumentListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);

  // API Query
  const { 
    data: apiData, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useDocuments({
    status: statusFilter !== "all" ? statusFilter : undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
    limit: 50,
  });

  // Transform data based on source
  const documents: DisplayDocument[] = useMockData
    ? mockDocuments.map(transformMockDocument)
    : (apiData?.items || []).map(transformApiDocument);

  // Client-side search filter (API doesn't support full-text search yet)
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    // Status and type filters are handled by API, but keep for mock data
    const matchesStatus = useMockData 
      ? statusFilter === "all" || doc.status === statusFilter
      : true;
    const matchesType = useMockData 
      ? typeFilter === "all" || doc.type === typeFilter
      : true;
    return matchesSearch && matchesStatus && matchesType;
  });

  const toggleSelectDoc = (id: string) => {
    setSelectedDocs((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedDocs.length === filteredDocuments.length) {
      setSelectedDocs([]);
    } else {
      setSelectedDocs(filteredDocuments.map((d) => d.id));
    }
  };

  const handleBulkDelete = () => {
    onBulkDelete?.(selectedDocs);
    setSelectedDocs([]);
  };

  // Loading state
  if (isLoading && !useMockData) {
    return <DocumentListSkeleton />;
  }

  // Error state
  if (isError && !useMockData) {
    return (
      <DocumentListError 
        error={error} 
        onRetry={() => refetch()} 
      />
    );
  }

  return (
    <div className="px-6 py-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-foreground">문서 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">
            총 {apiData?.total ?? documents.length}개의 문서
            {useMockData && <span className="text-amber-500 ml-2">(Mock 데이터)</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!useMockData && (
            <IconButton variant="muted" onClick={() => refetch()}>
              <RefreshCw size={16} />
            </IconButton>
          )}
        <Button variant="brand" onClick={onCreateDocument}>
          <Plus size={16} className="mr-1.5" />새 문서
        </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="문서 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 상태</SelectItem>
            <SelectItem value={useMockData ? "Draft" : "draft"}>Draft</SelectItem>
            <SelectItem value={useMockData ? "In Review" : "in_review"}>In Review</SelectItem>
            <SelectItem value={useMockData ? "Done" : "done"}>Done</SelectItem>
            <SelectItem value={useMockData ? "Publish" : "publish"}>Publish</SelectItem>
          </SelectContent>
        </Select>

        {/* Type Filter */}
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="타입" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 타입</SelectItem>
            <SelectItem value={useMockData ? "api-guide" : "api"}>API Guide</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="tutorial">Tutorial</SelectItem>
          </SelectContent>
        </Select>

        {/* Bulk Actions */}
        {selectedDocs.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-muted-foreground">
              {selectedDocs.length}개 선택됨
            </span>
            <Button variant="outline" size="sm" onClick={handleBulkDelete}>
              <Trash2 size={14} className="mr-1" />
              삭제
            </Button>
          </div>
        )}
      </div>

      {/* Document Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[auto_1fr_120px_100px_100px_100px_80px_48px] gap-4 px-4 py-3 bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={
                selectedDocs.length === filteredDocuments.length &&
                filteredDocuments.length > 0
              }
              onChange={toggleSelectAll}
              className="rounded border-border"
            />
          </div>
          <div>문서 제목</div>
          <div>타입</div>
          <div>상태</div>
          <div>작성자</div>
          <div>수정일</div>
          <div>버전</div>
          <div></div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-border">
          {filteredDocuments.map((doc) => (
            <DocumentRow
              key={doc.id}
              doc={doc}
              isSelected={selectedDocs.includes(doc.id)}
              onSelect={() => toggleSelectDoc(doc.id)}
              onView={() => onViewDocument?.(doc.id)}
              onEdit={() => onEditDocument?.(doc.id)}
              onDelete={() => onDeleteDocument?.(doc.id)}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredDocuments.length === 0 && (
          <div className="py-12 text-center">
            <FileText
              size={48}
              className="mx-auto text-muted-foreground/50 mb-4"
            />
            <p className="text-muted-foreground">
              {searchQuery ? "검색 결과가 없습니다" : "문서가 없습니다"}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-muted-foreground">
          {filteredDocuments.length}개 중 1-
          {Math.min(filteredDocuments.length, 10)}개 표시
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            이전
          </Button>
          <Button variant="outline" size="sm" disabled>
            다음
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   Document Row Subcomponent
   ============================================ */

interface DocumentRowProps {
  doc: DisplayDocument;
  isSelected: boolean;
  onSelect: () => void;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function DocumentRow({
  doc,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onDelete,
}: DocumentRowProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-[auto_1fr_120px_100px_100px_100px_80px_48px] gap-4 px-4 py-3 items-center",
        "hover:bg-surface-hover transition-colors",
        isSelected && "bg-accent/50"
      )}
    >
      {/* Checkbox */}
      <div>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="rounded border-border"
        />
      </div>

      {/* Title */}
      <div className="flex items-center gap-3 min-w-0">
        <FileText size={16} className="text-muted-foreground flex-shrink-0" />
        <div className="min-w-0">
          <p
            onClick={onView}
            className="text-sm text-foreground truncate hover:text-brand cursor-pointer"
          >
            {doc.title}
          </p>
          <p className="text-xs text-muted-foreground">
            연결된 용어 {doc.linkedTerms}개
          </p>
        </div>
      </div>

      {/* Type */}
      <div>
        <span className="text-xs text-muted-foreground">{doc.typeLabel}</span>
      </div>

      {/* Status */}
      <div>
        <StatusBadge status={doc.status} />
      </div>

      {/* Author */}
      <div className="text-sm text-muted-foreground">{doc.author}</div>

      {/* Updated */}
      <div className="text-sm text-muted-foreground">{doc.updatedAt}</div>

      {/* Version */}
      <div className="text-xs text-muted-foreground">{doc.version}</div>

      {/* Actions */}
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconButton variant="muted" size="sm">
              <MoreHorizontal size={16} />
            </IconButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onView}>
              <Eye size={14} className="mr-2" />
              보기
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              <Edit size={14} className="mr-2" />
              편집
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={onDelete}>
              <Trash2 size={14} className="mr-2" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

/* ============================================
   Loading Skeleton
   ============================================ */

function DocumentListSkeleton() {
  return (
    <div className="px-6 py-5">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>

      {/* Filters Skeleton */}
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-9 flex-1 max-w-md" />
        <Skeleton className="h-9 w-[140px]" />
        <Skeleton className="h-9 w-[140px]" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-muted/50 border-b border-border">
          <Skeleton className="h-4 w-full" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="px-4 py-3 border-b border-border">
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================
   Error State
   ============================================ */

interface DocumentListErrorProps {
  error: Error | null;
  onRetry: () => void;
}

function DocumentListError({ error, onRetry }: DocumentListErrorProps) {
  return (
    <div className="px-6 py-5">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle size={48} className="text-destructive mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-2">
          문서를 불러오는데 실패했습니다
        </h2>
        <p className="text-sm text-muted-foreground mb-4 max-w-md">
          {error?.message || "서버와의 연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요."}
        </p>
        <Button onClick={onRetry}>
          <RefreshCw size={16} className="mr-2" />
          다시 시도
        </Button>
      </div>
    </div>
  );
}
