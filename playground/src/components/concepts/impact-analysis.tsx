"use client";

import { AlertTriangle, FileText, ExternalLink, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Types for impact analysis
export interface ImpactDocument {
  id: string;
  title: string;
  type: "api" | "general" | "tutorial";
  status: "draft" | "in_review" | "done" | "published";
  lang: string;
  updatedAt: string;
}

interface ImpactAnalysisPanelProps {
  conceptId?: string;
  conceptTerm?: string;
  documents: ImpactDocument[];
  loading?: boolean;
  onRefresh?: () => void;
  onDocumentClick?: (doc: ImpactDocument) => void;
}

// Status badge component
const StatusBadge = ({ status }: { status: ImpactDocument["status"] }) => {
  const variants: Record<
    ImpactDocument["status"],
    { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
  > = {
    draft: { label: "초안", variant: "secondary" },
    in_review: { label: "검토중", variant: "outline" },
    done: { label: "완료", variant: "default" },
    published: { label: "배포됨", variant: "default" },
  };

  const { label, variant } = variants[status];
  return (
    <Badge variant={variant} className="text-xs">
      {label}
    </Badge>
  );
};

// Type badge component
const TypeBadge = ({ type }: { type: ImpactDocument["type"] }) => {
  const variants: Record<ImpactDocument["type"], { label: string; className: string }> = {
    api: {
      label: "API",
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    },
    general: {
      label: "일반",
      className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    },
    tutorial: {
      label: "튜토리얼",
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    },
  };

  const { label, className } = variants[type];
  return (
    <Badge className={className} variant="outline">
      {label}
    </Badge>
  );
};

export function ImpactAnalysisPanel({
  conceptTerm,
  documents,
  loading = false,
  onRefresh,
  onDocumentClick,
}: ImpactAnalysisPanelProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            영향도 분석
          </CardTitle>
          <CardDescription>분석 중...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                <Skeleton className="h-4 w-4" />
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
    <Card
      className={
        documents.length > 0
          ? "border-amber-200 dark:border-amber-800"
          : ""
      }
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle
                className={`h-5 w-5 ${
                  documents.length > 0 ? "text-amber-500" : "text-muted-foreground"
                }`}
              />
              영향도 분석
            </CardTitle>
            <CardDescription>
              {conceptTerm ? (
                <>
                  <span className="font-medium text-foreground">&quot;{conceptTerm}&quot;</span>
                  {" "}용어를 사용하는 문서
                </>
              ) : (
                "이 용어를 사용하는 문서 목록"
              )}
            </CardDescription>
          </div>
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              새로고침
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">이 용어를 사용하는 문서가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Summary */}
            <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg mb-4">
              <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                총 {documents.length}개의 문서가 영향을 받습니다
              </span>
              <Badge variant="outline" className="text-amber-600 dark:text-amber-400">
                {documents.filter((d) => d.status === "published").length}개 배포됨
              </Badge>
            </div>

            {/* Document list */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                    onDocumentClick
                      ? "cursor-pointer hover:bg-muted/50"
                      : ""
                  }`}
                  onClick={() => onDocumentClick?.(doc)}
                >
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{doc.title}</span>
                      {onDocumentClick && (
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <TypeBadge type={doc.type} />
                      <StatusBadge status={doc.status} />
                      <span className="text-xs text-muted-foreground uppercase">
                        {doc.lang}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(doc.updatedAt).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

