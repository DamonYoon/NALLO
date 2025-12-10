"use client";

import { Settings, User, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";

/* ============================================
   Subcomponents
   ============================================ */

interface HeaderActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "highlight";
}

function HeaderActionButton({
  icon,
  label,
  onClick,
  className,
  variant = "default",
}: HeaderActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full transition-colors group",
        variant === "default" && [
          "bg-white/10 hover:bg-surface-hover",
          "text-white hover:text-text-primary",
        ],
        variant === "highlight" && [
          "bg-emerald-500/15 hover:bg-emerald-500/25",
          "text-emerald-400 hover:text-emerald-300",
        ],
        className
      )}
    >
      <span className="[&_svg]:size-[11px]">{icon}</span>
      <span className="text-2xs">{label}</span>
    </button>
  );
}

/* ============================================
   Types
   ============================================ */

interface AdminHeaderProps {
  onAskAIClick?: () => void;
  projectName?: string;
  onProjectSelect?: () => void;
}

/* ============================================
   Component
   ============================================ */

export function AdminHeader({
  onAskAIClick,
  projectName = "Nodit",
  onProjectSelect,
}: AdminHeaderProps) {
  return (
    <header className="h-header bg-transparent flex items-center justify-between px-3.5">
      {/* Left Side - Logo & Project */}
      <div className="flex items-center gap-4">
        {/* NALLO Logo */}
        <div className="flex items-center gap-1.5">
          <div className="relative w-[11px] h-[15px]">
            <Image
              src="/nallo_logo.svg"
              alt="NALLO Logo"
              width={11}
              height={15}
            />
          </div>
          <span className="text-sm font-semibold text-white tracking-wide">
            NALLO
          </span>
        </div>

        {/* Project Selector */}
        <button
          onClick={onProjectSelect}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full",
            "bg-white/10 hover:bg-surface-hover transition-colors",
            "text-white hover:text-text-primary",
            "group"
          )}
        >
          <span className="text-2xs">{projectName}</span>
          <ChevronDown size={10} />
        </button>
      </div>

      {/* Right Side - Action Buttons */}
      <div className="flex items-center gap-2">
        <HeaderActionButton icon={<Settings />} label="관리자 설정" />

        <HeaderActionButton icon={<User />} label="계정 관리" />

        <Button
          onClick={onAskAIClick}
          variant="header-action"
          size="xs"
          className="gap-1"
        >
          <Sparkles size={11} />
          <span className="text-2xs">ASK AI</span>
        </Button>
      </div>
    </header>
  );
}

