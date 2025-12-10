"use client";

import { Search, Network, Sparkles, ChevronDown } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/* ============================================
   Types
   ============================================ */

interface UserGlobalBarProps {
  onSearchClick?: () => void;
  onGraphClick?: () => void;
  onAskAIClick?: () => void;
  className?: string;
}

/* ============================================
   Component
   ============================================ */

export function UserGlobalBar({
  onSearchClick,
  onGraphClick,
  onAskAIClick,
  className,
}: UserGlobalBarProps) {
  return (
    <header
      className={cn(
        "h-14 bg-global border-b border-[#2a2a2a] flex items-center justify-between px-6",
        className
      )}
    >
      {/* Left - Logo & Search */}
      <div className="flex items-center gap-6">
        {/* NALLO Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white text-base font-semibold">
            N
          </div>
          <span className="text-white text-lg font-medium">NALLO</span>
        </div>

        {/* Global Search */}
        <button
          onClick={onSearchClick}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg",
            "bg-[#2a2a2a] hover:bg-[#333333] transition-colors",
            "min-w-[280px]"
          )}
        >
          <Search size={16} className="text-gray-400" />
          <span className="text-[13px] text-gray-400">
            Search documentation...
          </span>
          <div className="ml-auto flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-global text-[11px] text-gray-500 border border-[#444444]">
              ⌘
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-global text-[11px] text-gray-500 border border-[#444444]">
              K
            </kbd>
          </div>
        </button>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-3">
        {/* My Knowledge Graph */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onGraphClick}
          className="bg-[#2a2a2a] text-white text-[13px] hover:bg-[#333333] hover:text-white gap-2"
        >
          <Network size={16} />
          <span>My Knowledge Graph</span>
        </Button>

        {/* Ask AI */}
        <Button
          variant="brand"
          size="sm"
          onClick={onAskAIClick}
          className="gap-2"
        >
          <Sparkles size={16} />
          <span>Ask AI</span>
        </Button>

        {/* User Profile */}
        <button
          className={cn(
            "flex items-center gap-2 px-2.5 py-1.5 rounded-lg",
            "bg-[#2a2a2a] hover:bg-[#333333] transition-colors"
          )}
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-[11px]">
            U
          </div>
          <ChevronDown size={14} className="text-gray-400" />
        </button>
      </div>
    </header>
  );
}
