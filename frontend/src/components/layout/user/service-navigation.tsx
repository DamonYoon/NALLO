"use client";

import Image from "next/image";
import { Book, Lightbulb, Code2, Bell, Megaphone, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ============================================
   Types
   ============================================ */

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface ServiceNavigationProps {
  activeItem?: string;
  onItemClick?: (item: string) => void;
  serviceName?: string;
  serviceLogo?: string;
  className?: string;
}

/* ============================================
   Constants
   ============================================ */

const NAV_ITEMS: NavItem[] = [
  { id: "getting-started", label: "Getting Started", icon: Book },
  { id: "recipes", label: "Recipes", icon: Lightbulb },
  { id: "api-reference", label: "API Reference", icon: Code2 },
  { id: "changelog", label: "Changelog", icon: Bell },
  { id: "notice", label: "Notice", icon: Megaphone },
];

const VERSION_OPTIONS = [
  { value: "v2.4.0", label: "v2.4.0" },
  { value: "v2.3.0", label: "v2.3.0" },
  { value: "v2.2.0", label: "v2.2.0" },
];

/* ============================================
   Component
   ============================================ */

export function ServiceNavigation({
  activeItem = "Getting Started",
  onItemClick,
  serviceName = "NODIT",
  serviceLogo,
  className,
}: ServiceNavigationProps) {
  return (
    <nav
      className={cn(
        "h-12 bg-card border-b border-border flex items-center px-5",
        className
      )}
    >
      {/* Service Logo */}
      <div className="flex items-center gap-6 mr-6">
        {serviceLogo ? (
          <Image
            src={serviceLogo}
            alt={serviceName}
            width={80}
            height={24}
            className="h-6 w-auto"
          />
        ) : (
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

      {/* Navigation Items */}
      <div className="flex items-center gap-0.5 flex-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.label;

          return (
            <button
              key={item.id}
              onClick={() => onItemClick?.(item.label)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all",
                isActive
                  ? "bg-muted text-text-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-muted"
              )}
            >
              <Icon size={14} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right - Version Selector */}
      <div className="flex items-center gap-2">
        <Select defaultValue="v2.4.0">
          <SelectTrigger className="w-[90px] h-7 text-xs">
            <SelectValue placeholder="Version" />
          </SelectTrigger>
          <SelectContent>
            {VERSION_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </nav>
  );
}

