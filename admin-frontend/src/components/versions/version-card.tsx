"use client";

import { Globe, Lock, Star, Calendar, MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Version } from "@/lib/types/api";

interface VersionCardProps {
  version: Version;
  /** Click handler for the card */
  onClick?: (version: Version) => void;
  /** Edit handler */
  onEdit?: (version: Version) => void;
  /** Delete handler */
  onDelete?: (version: Version) => void;
  /** Set as main handler */
  onSetMain?: (version: Version) => void;
  /** Toggle public handler */
  onTogglePublic?: (version: Version) => void;
}

export function VersionCard({
  version,
  onClick,
  onEdit,
  onDelete,
  onSetMain,
  onTogglePublic,
}: VersionCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card
      className={`group relative transition-all hover:shadow-md ${
        onClick ? "cursor-pointer" : ""
      } ${version.is_main ? "ring-2 ring-primary ring-offset-2" : ""}`}
      onClick={() => onClick?.(version)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-semibold">
                {version.name}
              </CardTitle>
              {version.is_main && (
                <Badge
                  variant="default"
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  <Star className="mr-1 h-3 w-3" />
                  메인
                </Badge>
              )}
            </div>
            <CardDescription className="font-mono text-sm">
              {version.version}
            </CardDescription>
          </div>

          {/* Actions Menu */}
          {(onEdit || onDelete || onSetMain || onTogglePublic) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">버전 메뉴</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(version);
                    }}
                  >
                    편집
                  </DropdownMenuItem>
                )}
                {onSetMain && !version.is_main && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetMain(version);
                    }}
                  >
                    <Star className="mr-2 h-4 w-4" />
                    메인 버전으로 설정
                  </DropdownMenuItem>
                )}
                {onTogglePublic && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePublic(version);
                    }}
                  >
                    {version.is_public ? (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        비공개로 전환
                      </>
                    ) : (
                      <>
                        <Globe className="mr-2 h-4 w-4" />
                        공개로 전환
                      </>
                    )}
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(version);
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      삭제
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Description */}
        {version.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {version.description}
          </p>
        )}

        {/* Status Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={version.is_public ? "secondary" : "outline"}>
            {version.is_public ? (
              <>
                <Globe className="mr-1 h-3 w-3" />
                공개
              </>
            ) : (
              <>
                <Lock className="mr-1 h-3 w-3" />
                비공개
              </>
            )}
          </Badge>
        </div>

        {/* Date Info */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>생성: {formatDate(version.created_at)}</span>
          {version.updated_at !== version.created_at && (
            <span className="ml-2">
              (수정: {formatDate(version.updated_at)})
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

