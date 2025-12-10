"use client";

import { LucideIcon, Inbox, Search, FileX, AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type EmptyStateVariant =
  | "empty"
  | "no-results"
  | "error"
  | "no-access"
  | "custom";

interface EmptyStateProps {
  /** Variant determines default icon and styling */
  variant?: EmptyStateVariant;
  /** Custom icon (overrides variant icon) */
  icon?: LucideIcon;
  /** Title text */
  title?: string;
  /** Description text */
  description?: string;
  /** Primary action button */
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "secondary" | "outline";
  };
  /** Secondary action button */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Children for custom content */
  children?: React.ReactNode;
  /** Additional class name */
  className?: string;
  /** Size variant */
  size?: "sm" | "default" | "lg";
}

const variantDefaults: Record<
  EmptyStateVariant,
  {
    icon: LucideIcon;
    title: string;
    description: string;
  }
> = {
  empty: {
    icon: Inbox,
    title: "데이터가 없습니다",
    description: "아직 생성된 항목이 없습니다. 새로 추가해 보세요.",
  },
  "no-results": {
    icon: Search,
    title: "검색 결과가 없습니다",
    description: "다른 검색어를 입력하거나 필터를 변경해 보세요.",
  },
  error: {
    icon: AlertCircle,
    title: "오류가 발생했습니다",
    description: "데이터를 불러오는 중 문제가 발생했습니다. 다시 시도해 주세요.",
  },
  "no-access": {
    icon: FileX,
    title: "접근 권한이 없습니다",
    description: "이 콘텐츠를 볼 수 있는 권한이 없습니다.",
  },
  custom: {
    icon: Inbox,
    title: "",
    description: "",
  },
};

export function EmptyState({
  variant = "empty",
  icon,
  title,
  description,
  action,
  secondaryAction,
  children,
  className,
  size = "default",
}: EmptyStateProps) {
  const defaults = variantDefaults[variant];
  const Icon = icon || defaults.icon;
  const displayTitle = title || defaults.title;
  const displayDescription = description || defaults.description;

  const sizeClasses = {
    sm: {
      container: "py-6",
      icon: "h-8 w-8",
      title: "text-sm",
      description: "text-xs",
    },
    default: {
      container: "py-12",
      icon: "h-12 w-12",
      title: "text-base",
      description: "text-sm",
    },
    lg: {
      container: "py-16",
      icon: "h-16 w-16",
      title: "text-lg",
      description: "text-base",
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        sizes.container,
        className
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "mb-4 rounded-full bg-muted p-3",
          variant === "error" && "bg-destructive/10"
        )}
      >
        <Icon
          className={cn(
            sizes.icon,
            "text-muted-foreground",
            variant === "error" && "text-destructive"
          )}
        />
      </div>

      {/* Title */}
      {displayTitle && (
        <h3 className={cn("font-medium mb-1", sizes.title)}>{displayTitle}</h3>
      )}

      {/* Description */}
      {displayDescription && (
        <p
          className={cn(
            "text-muted-foreground max-w-sm mb-4",
            sizes.description
          )}
        >
          {displayDescription}
        </p>
      )}

      {/* Custom children */}
      {children}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-2 mt-2">
          {action && (
            <Button
              variant={action.variant || "default"}
              size={size === "sm" ? "sm" : "default"}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="ghost"
              size={size === "sm" ? "sm" : "default"}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Convenience components for common use cases
export function NoDataState(props: Omit<EmptyStateProps, "variant">) {
  return <EmptyState variant="empty" {...props} />;
}

export function NoResultsState(props: Omit<EmptyStateProps, "variant">) {
  return <EmptyState variant="no-results" {...props} />;
}

export function ErrorState(props: Omit<EmptyStateProps, "variant">) {
  return <EmptyState variant="error" {...props} />;
}

