"use client";

import { useState, useCallback, useMemo } from "react";
import {
  ChevronRight,
  ChevronDown,
  File,
  FolderOpen,
  Folder,
  Eye,
  EyeOff,
  GripVertical,
  MoreHorizontal,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Page node type (matches backend Page Node structure)
export interface PageNode {
  id: string;
  slug: string;
  title: string;
  order: number;
  visible: boolean;
  children?: PageNode[];
  documentId?: string; // Linked document ID
  documentTitle?: string; // Linked document title
}

interface PageTreeProps {
  /** Tree data */
  data: PageNode[];
  /** Currently selected page ID */
  selectedId?: string | null;
  /** Callback when page is selected */
  onSelect?: (page: PageNode) => void;
  /** Callback when page visibility is toggled */
  onToggleVisibility?: (page: PageNode) => void;
  /** Callback when page is edited */
  onEdit?: (page: PageNode) => void;
  /** Callback when page is deleted */
  onDelete?: (page: PageNode) => void;
  /** Callback when add child is clicked */
  onAddChild?: (parentPage: PageNode) => void;
  /** Enable drag and drop reordering */
  enableReorder?: boolean;
  /** Show action menu */
  showActions?: boolean;
  /** Show visibility badges */
  showVisibility?: boolean;
  /** Show document link badge */
  showDocumentLink?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Class name for root container */
  className?: string;
}

interface PageTreeNodeProps {
  node: PageNode;
  level: number;
  selectedId?: string | null;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onSelect?: (page: PageNode) => void;
  onToggleVisibility?: (page: PageNode) => void;
  onEdit?: (page: PageNode) => void;
  onDelete?: (page: PageNode) => void;
  onAddChild?: (parentPage: PageNode) => void;
  enableReorder?: boolean;
  showActions?: boolean;
  showVisibility?: boolean;
  showDocumentLink?: boolean;
  disabled?: boolean;
}

function PageTreeNode({
  node,
  level,
  selectedId,
  expandedIds,
  onToggleExpand,
  onSelect,
  onToggleVisibility,
  onEdit,
  onDelete,
  onAddChild,
  enableReorder = false,
  showActions = true,
  showVisibility = true,
  showDocumentLink = true,
  disabled = false,
}: PageTreeNodeProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;

  const handleToggleExpand = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleExpand(node.id);
    },
    [node.id, onToggleExpand]
  );

  const handleSelect = useCallback(() => {
    if (!disabled && onSelect) {
      onSelect(node);
    }
  }, [disabled, node, onSelect]);

  return (
    <div className="select-none">
      {/* Node row */}
      <div
        className={cn(
          "group flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer transition-colors",
          "hover:bg-accent",
          isSelected && "bg-accent",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleSelect}
      >
        {/* Drag handle */}
        {enableReorder && (
          <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab" />
        )}

        {/* Expand/Collapse toggle */}
        <button
          type="button"
          className={cn(
            "shrink-0 h-5 w-5 flex items-center justify-center rounded hover:bg-muted",
            !hasChildren && "invisible"
          )}
          onClick={handleToggleExpand}
          disabled={disabled}
        >
          {hasChildren &&
            (isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            ))}
        </button>

        {/* Icon */}
        <span className="shrink-0 text-muted-foreground">
          {hasChildren ? (
            isExpanded ? (
              <FolderOpen className="h-4 w-4" />
            ) : (
              <Folder className="h-4 w-4" />
            )
          ) : (
            <File className="h-4 w-4" />
          )}
        </span>

        {/* Title */}
        <span className="flex-1 truncate text-sm">{node.title}</span>

        {/* Document link badge */}
        {showDocumentLink && node.documentTitle && (
          <Badge variant="outline" className="text-xs shrink-0">
            {node.documentTitle}
          </Badge>
        )}

        {/* Visibility badge */}
        {showVisibility && (
          <span
            className={cn(
              "shrink-0 text-muted-foreground",
              !node.visible && "text-destructive/50"
            )}
            title={node.visible ? "Visible" : "Hidden"}
          >
            {node.visible ? (
              <Eye className="h-3.5 w-3.5" />
            ) : (
              <EyeOff className="h-3.5 w-3.5" />
            )}
          </span>
        )}

        {/* Actions menu */}
        {showActions && !disabled && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(node);
                  }}
                >
                  편집
                </DropdownMenuItem>
              )}
              {onToggleVisibility && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(node);
                  }}
                >
                  {node.visible ? "숨기기" : "표시"}
                </DropdownMenuItem>
              )}
              {onAddChild && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddChild(node);
                  }}
                >
                  하위 페이지 추가
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(node);
                    }}
                  >
                    삭제
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <PageTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
              onToggleVisibility={onToggleVisibility}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              enableReorder={enableReorder}
              showActions={showActions}
              showVisibility={showVisibility}
              showDocumentLink={showDocumentLink}
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function PageTree({
  data,
  selectedId,
  onSelect,
  onToggleVisibility,
  onEdit,
  onDelete,
  onAddChild,
  enableReorder = false,
  showActions = true,
  showVisibility = true,
  showDocumentLink = true,
  disabled = false,
  className,
}: PageTreeProps) {
  // Track expanded nodes
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    // Initially expand all nodes that have children
    const ids = new Set<string>();
    const collectExpandable = (nodes: PageNode[]) => {
      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          ids.add(node.id);
          collectExpandable(node.children);
        }
      });
    };
    collectExpandable(data);
    return ids;
  });

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Expand/collapse all
  const expandAll = useCallback(() => {
    const ids = new Set<string>();
    const collectExpandable = (nodes: PageNode[]) => {
      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          ids.add(node.id);
          collectExpandable(node.children);
        }
      });
    };
    collectExpandable(data);
    setExpandedIds(ids);
  }, [data]);

  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  // Count stats
  const stats = useMemo(() => {
    let total = 0;
    let visible = 0;
    const count = (nodes: PageNode[]) => {
      nodes.forEach((node) => {
        total++;
        if (node.visible) visible++;
        if (node.children) count(node.children);
      });
    };
    count(data);
    return { total, visible };
  }, [data]);

  if (data.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-8 text-muted-foreground",
          className
        )}
      >
        <Folder className="h-12 w-12 mb-2 opacity-50" />
        <p className="text-sm">페이지가 없습니다</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1 border-b">
        <span className="text-xs text-muted-foreground">
          {stats.total}개 페이지 (표시: {stats.visible})
        </span>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={expandAll}>
            모두 펼치기
          </Button>
          <Button variant="ghost" size="sm" onClick={collapseAll}>
            모두 접기
          </Button>
        </div>
      </div>

      {/* Tree */}
      <div className="overflow-auto">
        {data.map((node) => (
          <PageTreeNode
            key={node.id}
            node={node}
            level={0}
            selectedId={selectedId}
            expandedIds={expandedIds}
            onToggleExpand={handleToggleExpand}
            onSelect={onSelect}
            onToggleVisibility={onToggleVisibility}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddChild={onAddChild}
            enableReorder={enableReorder}
            showActions={showActions}
            showVisibility={showVisibility}
            showDocumentLink={showDocumentLink}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}
