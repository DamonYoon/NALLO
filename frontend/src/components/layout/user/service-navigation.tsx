"use client";

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
  serviceInitial?: string;
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
  serviceInitial = "N",
  className,
}: ServiceNavigationProps) {
  return (
    <nav
      className={cn(
        "h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6",
        className
      )}
    >
      {/* Service Logo */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-md bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
          <span className="text-white text-xs font-medium">{serviceInitial}</span>
        </div>
        <span className="text-base font-medium text-gray-900">{serviceName}</span>
        <span className="ml-2 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[11px] font-medium">
          Docs
        </span>
      </div>

      {/* Navigation Items */}
      <div className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.label;

          return (
            <button
              key={item.id}
              onClick={() => onItemClick?.(item.label)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] transition-all",
                isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <Icon size={15} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right - Version Selector */}
      <div className="flex items-center gap-2">
        <Select defaultValue="v2.4.0">
          <SelectTrigger className="w-[100px] h-8 text-xs">
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

