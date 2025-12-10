"use client";

import { FileText, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export interface RecentDocument {
  id: string;
  title: string;
  type: "api" | "guide" | "reference" | "changelog";
  lang: string;
  updatedAt: string;
  author?: string;
}

interface RecentDocumentsProps {
  /** List of recent documents */
  documents: RecentDocument[];
  /** Widget title */
  title?: string;
  /** Widget description */
  description?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Maximum items to show */
  maxItems?: number;
  /** Show "View All" link */
  showViewAll?: boolean;
  /** View all link URL */
  viewAllUrl?: string;
  /** Callback when document is clicked */
  onDocumentClick?: (doc: RecentDocument) => void;
  /** Additional class name */
  className?: string;
}

const typeColors: Record<RecentDocument["type"], string> = {
  api: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  guide: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  reference:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  changelog:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
};

const typeLabels: Record<RecentDocument["type"], string> = {
  api: "API",
  guide: "가이드",
  reference: "레퍼런스",
  changelog: "변경로그",
};

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "방금 전";
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return date.toLocaleDateString("ko-KR");
}

export function RecentDocuments({
  documents,
  title = "최근 문서",
  description = "최근 수정된 문서들",
  isLoading = false,
  maxItems = 5,
  showViewAll = true,
  viewAllUrl = "/documents",
  onDocumentClick,
  className,
}: RecentDocumentsProps) {
  const displayedDocs = documents.slice(0, maxItems);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {showViewAll && (
          <Link href={viewAllUrl}>
            <Button variant="ghost" size="sm">
              전체 보기
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {displayedDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <FileText className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">최근 문서가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedDocs.map((doc) => (
              <div
                key={doc.id}
                className={cn(
                  "flex items-start gap-3 p-2 -m-2 rounded-md transition-colors",
                  onDocumentClick && "cursor-pointer hover:bg-accent"
                )}
                onClick={() => onDocumentClick?.(doc)}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">
                      {doc.title}
                    </span>
                    <Badge
                      variant="secondary"
                      className={cn("text-xs shrink-0", typeColors[doc.type])}
                    >
                      {typeLabels[doc.type]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <Clock className="h-3 w-3" />
                    <span>{formatRelativeTime(doc.updatedAt)}</span>
                    {doc.author && (
                      <>
                        <span>•</span>
                        <span>{doc.author}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
