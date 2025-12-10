"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavItem } from "@/components/ui/nav-item";
import { IconButton } from "@/components/ui/icon-button";
import { Badge } from "@/components/ui/badge";
import {
  mockNavigationItems,
  mockDocumentTree,
  type NavigationItem,
  type DocumentTreeItem,
  type DocumentTreeChild,
} from "@/lib/mocks/sidebar";

/* ============================================
   Types
   ============================================ */

interface AdminSidebarProps {
  className?: string;
  navigationItems?: NavigationItem[];
  documentTree?: DocumentTreeItem[];
  onNavigationSelect?: (item: NavigationItem) => void;
  onDocumentSelect?: (doc: DocumentTreeChild) => void;
  onAddCategory?: () => void;
  onAddDocument?: (parentId: string) => void;
}

/* ============================================
   Subcomponents
   ============================================ */

interface TreeItemProps {
  item: DocumentTreeItem;
  isExpanded: boolean;
  onToggle: () => void;
  onAddClick?: () => void;
  onMoreClick?: () => void;
  onChildClick?: (child: DocumentTreeChild) => void;
}

function TreeItem({
  item,
  isExpanded,
  onToggle,
  onAddClick,
  onMoreClick,
  onChildClick,
}: TreeItemProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {/* Parent Item */}
      <div
        onClick={onToggle}
        className={cn(
          "flex items-center gap-1.5 rounded px-1.5 py-1 -mx-1.5",
          "hover:bg-surface-hover cursor-pointer group"
        )}
      >
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <span className="text-[13px] text-foreground group-hover:text-brand truncate">
            {item.name}
          </span>
          <span className="text-xs text-brand flex-shrink-0">{item.count}</span>
        </div>

        {/* Action Buttons */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 flex-shrink-0">
          <IconButton
            variant="muted"
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              onAddClick?.();
            }}
          >
            <Plus size={12} />
          </IconButton>
          <IconButton
            variant="muted"
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              onMoreClick?.();
            }}
          >
            <MoreHorizontal size={12} />
          </IconButton>
        </div>

        {/* Expand Icon */}
        {isExpanded ? (
          <ChevronDown size={14} className="text-foreground flex-shrink-0" />
        ) : (
          <ChevronRight size={14} className="text-foreground flex-shrink-0" />
        )}
      </div>

      {/* Children */}
      {isExpanded && item.children.length > 0 && (
        <div className="ml-1.5 pl-2 border-l border-border flex flex-col gap-1">
          {item.children.map((child) => (
            <TreeChildItem
              key={child.id}
              child={child}
              onClick={() => onChildClick?.(child)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface TreeChildItemProps {
  child: DocumentTreeChild;
  onClick?: () => void;
}

function TreeChildItem({ child, onClick }: TreeChildItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center justify-between rounded px-1 py-0.5 -mx-1",
        "hover:bg-surface-hover cursor-pointer group"
      )}
    >
      <span className="text-[13px] text-foreground group-hover:text-brand flex-1 truncate">
        {child.name}
      </span>
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 flex-shrink-0">
        <IconButton variant="muted" size="xs">
          <Plus size={12} />
        </IconButton>
        <IconButton variant="muted" size="xs">
          <MoreHorizontal size={12} />
        </IconButton>
      </div>
    </div>
  );
}

/* ============================================
   Main Component
   ============================================ */

export function AdminSidebar({
  className,
  navigationItems = mockNavigationItems,
  documentTree = mockDocumentTree,
  onNavigationSelect,
  onDocumentSelect,
  onAddCategory,
  onAddDocument,
}: AdminSidebarProps) {
  const [activeNavId, setActiveNavId] = useState(navigationItems[0]?.id);
  const [expandedItems, setExpandedItems] = useState<string[]>(
    documentTree.filter((item) => item.expanded).map((item) => item.id)
  );

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleNavigationSelect = (item: NavigationItem) => {
    setActiveNavId(item.id);
    onNavigationSelect?.(item);
  };

  const activeNav = navigationItems.find((item) => item.id === activeNavId);

  return (
    <aside
      className={cn(
        "w-sidebar bg-sidebar border-r border-sidebar-border flex flex-col",
        className
      )}
    >
      {/* Navigation Section */}
      <div className="px-4 py-2.5 border-b border-sidebar-border">
        <div className="mb-3">
          <span className="text-xs text-muted-foreground">Navigation</span>
        </div>

        <nav className="flex flex-col gap-1">
          {navigationItems.map((item) => (
            <NavItem
              key={item.id}
              variant="sidebar"
              active={activeNavId === item.id}
              onClick={() => handleNavigationSelect(item)}
              className="text-[13px] px-2 py-1.5"
            >
              {item.name}
            </NavItem>
          ))}
        </nav>
      </div>

      {/* Document Tree */}
      <ScrollArea className="flex-1">
        {/* Active Navigation Badge */}
        {activeNav && (
          <div className="px-4 pt-3.5 pb-2.5">
            <Badge variant="secondary" className="text-2xs">
              {activeNav.name}
            </Badge>
          </div>
        )}

        {/* Tree Items */}
        <div className="px-4 pb-4">
          <div className="flex flex-col gap-2">
            {documentTree.map((item) => (
              <TreeItem
                key={item.id}
                item={item}
                isExpanded={expandedItems.includes(item.id)}
                onToggle={() => toggleExpand(item.id)}
                onAddClick={() => onAddDocument?.(item.id)}
                onChildClick={(child) => onDocumentSelect?.(child)}
              />
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Add Category Footer */}
      <div className="h-12 bg-muted border-t border-border flex items-center justify-center">
        <button
          onClick={onAddCategory}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          + 카테고리 추가
        </button>
      </div>
    </aside>
  );
}

