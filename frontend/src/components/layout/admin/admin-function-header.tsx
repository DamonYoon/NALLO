"use client";

import { FileText, BookOpen, Rocket, Network, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/* ============================================
   Types
   ============================================ */

export interface AdminFunctionTab {
  id: string;
  name: string;
  icon: LucideIcon;
}

interface AdminFunctionHeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  tabs?: AdminFunctionTab[];
  variant?: "light" | "dark";
}

/* ============================================
   Default Tabs
   ============================================ */

const DEFAULT_TABS: AdminFunctionTab[] = [
  { id: "documents", name: "문서", icon: FileText },
  { id: "glossary", name: "용어집", icon: BookOpen },
  { id: "deploy", name: "배포", icon: Rocket },
  { id: "graph", name: "그래프", icon: Network },
];

/* ============================================
   Component
   ============================================ */

export function AdminFunctionHeader({
  activeTab = "문서",
  onTabChange,
  tabs = DEFAULT_TABS,
  variant,
}: AdminFunctionHeaderProps) {
  // Auto-detect dark mode based on active tab if variant not specified
  const isDarkMode =
    variant === "dark" || (variant === undefined && activeTab === "그래프");

  return (
    <div
      className={cn(
        "border-b h-function-header flex items-center px-5",
        isDarkMode
          ? "bg-background border-border"
          : "bg-transparent border-border"
      )}
    >
      <nav className="flex items-center gap-1 h-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.name;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.name)}
              className={cn(
                "relative flex items-center gap-2 px-5 h-full transition-colors",
                isDarkMode
                  ? isActive
                    ? "text-brand"
                    : "text-text-tertiary hover:text-text-secondary"
                  : isActive
                  ? "text-brand"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon size={16} />
              <span className="text-sm">{tab.name}</span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

