"use client";

import { Search, Network, Sparkles, Bookmark, User } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/* ============================================
   Types
   ============================================ */

type ViewType = "document" | "graph";

interface UserGlobalBarProps {
  onSearchClick?: () => void;
  onGraphClick?: () => void;
  onAskAIClick?: () => void;
  onBookmarksClick?: () => void;
  currentView?: ViewType;
  className?: string;
}

/* ============================================
   Subcomponents
   ============================================ */

interface PillButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  variant?: "default" | "primary";
}

function PillButton({
  icon,
  label,
  onClick,
  variant = "default",
}: PillButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors",
        variant === "default" && [
          "bg-white border border-border",
          "text-text-primary hover:bg-muted",
        ],
        variant === "primary" && [
          "bg-text-secondary text-white",
          "hover:bg-text-secondary/90",
        ]
      )}
    >
      <span className="[&_svg]:size-3.5">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

/* ============================================
   Component
   ============================================ */

export function UserGlobalBar({
  onSearchClick,
  onGraphClick,
  onAskAIClick,
  onBookmarksClick,
  currentView = "document",
  className,
}: UserGlobalBarProps) {
  // 그래프 뷰에서만 로고 표시
  const showLogo = currentView === "graph";

  return (
    <header
      className={cn(
        "h-10 bg-transparent flex items-center justify-between px-5",
        className
      )}
    >
      {/* Left - Logo (그래프 뷰에서만 표시) */}
      <div className="flex items-center gap-4">
        {showLogo && (
          <div className="flex items-center gap-1.5">
            <div className="relative w-[11px] h-[15px]">
              <Image
                src="/nallo_logo.svg"
                alt="NALLO Logo"
                width={11}
                height={15}
              />
            </div>
            <Image
              src="/nallo_logo_text.svg"
              alt="NALLO Logo Text"
              width={60}
              height={15}
            />
          </div>
        )}
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2.5">
        {/* My Bookmarks */}
        <PillButton
          icon={<Bookmark />}
          label="My Bookmarks"
          onClick={onBookmarksClick}
        />

        {/* My Knowledge Graph */}
        <PillButton
          icon={<Network />}
          label="My Knowledge Graph"
          onClick={onGraphClick}
        />

        {/* User Profile */}
        <PillButton icon={<User />} label="Profile" />

        {/* Ask AI */}
        <PillButton
          icon={<Sparkles />}
          label="Ask AI"
          onClick={onAskAIClick}
          variant="primary"
        />
      </div>
    </header>
  );
}
