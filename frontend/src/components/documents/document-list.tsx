"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  FileText,
  Edit,
  Trash2,
  Eye,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";

interface Document {
  id: string;
  title: string;
  type: "api-guide" | "general" | "tutorial";
  status: "Draft" | "In Review" | "Done" | "Publish";
  author: string;
  updatedAt: string;
  version: string;
  linkedTerms: number;
}

const mockDocuments: Document[] = [
  {
    id: "1",
    title: "Using Nodit with AI & LLM Tools",
    type: "tutorial",
    status: "In Review",
    author: "Bailey",
    updatedAt: "2시간 전",
    version: "v2.1.0",
    linkedTerms: 5,
  },
  {
    id: "2",
    title: "arbitrum-eth_blocknumber",
    type: "api-guide",
    status: "Publish",
    author: "Damon",
    updatedAt: "5시간 전",
    version: "v1.3.2",
    linkedTerms: 3,
  },
  {
    id: "3",
    title: "Polygon Quickstart",
    type: "tutorial",
    status: "Draft",
    author: "Jonny",
    updatedAt: "1일 전",
    version: "v0.8.1",
    linkedTerms: 8,
  },
  {
    id: "4",
    title: "Webhook Security & Reliability",
    type: "general",
    status: "Done",
    author: "Ben",
    updatedAt: "2025.12.04",
    version: "v1.3.5",
    linkedTerms: 2,
  },
  {
    id: "5",
    title: "Web3 Data API Overview",
    type: "api-guide",
    status: "Publish",
    author: "Bailey",
    updatedAt: "2025.12.03",
    version: "v2.0.0",
    linkedTerms: 12,
  },
  {
    id: "6",
    title: "Getting Started with Elastic Node",
    type: "tutorial",
    status: "In Review",
    author: "Damon",
    updatedAt: "2025.12.02",
    version: "v1.1.0",
    linkedTerms: 6,
  },
  {
    id: "7",
    title: "Dedicated Node Configuration",
    type: "general",
    status: "Draft",
    author: "Jonny",
    updatedAt: "2025.12.01",
    version: "v0.5.0",
    linkedTerms: 4,
  },
  {
    id: "8",
    title: "GraphQL API Reference",
    type: "api-guide",
    status: "Done",
    author: "Ben",
    updatedAt: "2025.11.30",
    version: "v3.0.0",
    linkedTerms: 15,
  },
];

const statusStyles = {
  Draft: { bg: "bg-gray-100", text: "text-gray-600" },
  "In Review": { bg: "bg-amber-100", text: "text-amber-700" },
  Done: { bg: "bg-emerald-100", text: "text-emerald-700" },
  Publish: { bg: "bg-blue-100", text: "text-blue-700" },
};

const typeLabels = {
  "api-guide": "API Guide",
  general: "General",
  tutorial: "Tutorial",
};

export function DocumentList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);

  const filteredDocuments = mockDocuments.filter((doc) => {
    const matchesSearch = doc.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    const matchesType = typeFilter === "all" || doc.type === typeFilter;
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

  return (
    <div className="px-6 py-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-foreground">문서 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">
            총 {mockDocuments.length}개의 문서
          </p>
        </div>
        <Button className="bg-brand hover:bg-brand-dark text-white">
          <Plus size={16} className="mr-1.5" />새 문서
        </Button>
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
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="In Review">In Review</SelectItem>
            <SelectItem value="Done">Done</SelectItem>
            <SelectItem value="Publish">Publish</SelectItem>
          </SelectContent>
        </Select>

        {/* Type Filter */}
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="타입" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 타입</SelectItem>
            <SelectItem value="api-guide">API Guide</SelectItem>
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
            <Button variant="outline" size="sm">
              <Trash2 size={14} className="mr-1" />
              삭제
            </Button>
          </div>
        )}
      </div>

      {/* Document Table */}
      <div className="bg-white border border-border rounded-lg overflow-hidden">
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
          {filteredDocuments.map((doc) => {
            const statusStyle = statusStyles[doc.status];
            return (
              <div
                key={doc.id}
                className={cn(
                  "grid grid-cols-[auto_1fr_120px_100px_100px_100px_80px_48px] gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-colors",
                  selectedDocs.includes(doc.id) && "bg-accent/50"
                )}
              >
                {/* Checkbox */}
                <div>
                  <input
                    type="checkbox"
                    checked={selectedDocs.includes(doc.id)}
                    onChange={() => toggleSelectDoc(doc.id)}
                    className="rounded border-border"
                  />
                </div>

                {/* Title */}
                <div className="flex items-center gap-3 min-w-0">
                  <FileText
                    size={16}
                    className="text-muted-foreground flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate hover:text-brand cursor-pointer">
                      {doc.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      연결된 용어 {doc.linkedTerms}개
                    </p>
                  </div>
                </div>

                {/* Type */}
                <div>
                  <span className="text-xs text-muted-foreground">
                    {typeLabels[doc.type]}
                  </span>
                </div>

                {/* Status */}
                <div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[11px]",
                      statusStyle.bg,
                      statusStyle.text
                    )}
                  >
                    {doc.status}
                  </Badge>
                </div>

                {/* Author */}
                <div className="text-sm text-muted-foreground">
                  {doc.author}
                </div>

                {/* Updated */}
                <div className="text-sm text-muted-foreground">
                  {doc.updatedAt}
                </div>

                {/* Version */}
                <div className="text-xs text-muted-foreground">
                  {doc.version}
                </div>

                {/* Actions */}
                <div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye size={14} className="mr-2" />
                        보기
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit size={14} className="mr-2" />
                        편집
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 size={14} className="mr-2" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredDocuments.length === 0 && (
          <div className="py-12 text-center">
            <FileText
              size={48}
              className="mx-auto text-muted-foreground/50 mb-4"
            />
            <p className="text-muted-foreground">검색 결과가 없습니다</p>
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
