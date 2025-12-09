"use client";

import { LucideIcon, Plus, Upload, GitBranch, BookOpen } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface QuickAction {
  id: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: "default" | "outline" | "secondary";
  disabled?: boolean;
}

interface QuickActionsProps {
  /** List of quick actions */
  actions?: QuickAction[];
  /** Title */
  title?: string;
  /** Description */
  description?: string;
  /** Layout direction */
  direction?: "horizontal" | "vertical";
  /** Additional class name */
  className?: string;
}

// Default actions
const defaultActions: QuickAction[] = [
  {
    id: "new-document",
    label: "새 문서",
    description: "새로운 문서 작성",
    icon: Plus,
    onClick: () => console.log("New document"),
    variant: "default",
  },
  {
    id: "import",
    label: "문서 가져오기",
    description: "파일에서 문서 가져오기",
    icon: Upload,
    onClick: () => console.log("Import"),
    variant: "outline",
  },
  {
    id: "new-version",
    label: "새 버전",
    description: "새로운 버전 생성",
    icon: GitBranch,
    onClick: () => console.log("New version"),
    variant: "outline",
  },
  {
    id: "new-concept",
    label: "새 용어",
    description: "새로운 용어 추가",
    icon: BookOpen,
    onClick: () => console.log("New concept"),
    variant: "outline",
  },
];

export function QuickActions({
  actions = defaultActions,
  title = "빠른 작업",
  description = "자주 사용하는 작업에 빠르게 접근하세요",
  direction = "horizontal",
  className,
}: QuickActionsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "gap-3",
            direction === "horizontal" ? "flex flex-wrap" : "flex flex-col"
          )}
        >
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant={action.variant || "outline"}
                onClick={action.onClick}
                disabled={action.disabled}
                className={cn(
                  direction === "vertical" && "justify-start",
                  action.variant === "default" && "min-w-[120px]"
                )}
              >
                <Icon className="h-4 w-4 mr-2" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Individual action button component
interface QuickActionButtonProps {
  action: QuickAction;
  showDescription?: boolean;
  className?: string;
}

export function QuickActionButton({
  action,
  showDescription = false,
  className,
}: QuickActionButtonProps) {
  const Icon = action.icon;

  if (showDescription) {
    return (
      <button
        onClick={action.onClick}
        disabled={action.disabled}
        className={cn(
          "flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent transition-colors text-left w-full",
          action.disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-sm">{action.label}</p>
          {action.description && (
            <p className="text-xs text-muted-foreground">
              {action.description}
            </p>
          )}
        </div>
      </button>
    );
  }

  return (
    <Button
      variant={action.variant || "outline"}
      onClick={action.onClick}
      disabled={action.disabled}
      className={className}
    >
      <Icon className="h-4 w-4 mr-2" />
      {action.label}
    </Button>
  );
}

// Grid of action cards
interface QuickActionGridProps {
  actions?: QuickAction[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function QuickActionGrid({
  actions = defaultActions,
  columns = 2,
  className,
}: QuickActionGridProps) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {actions.map((action) => (
        <QuickActionButton key={action.id} action={action} showDescription />
      ))}
    </div>
  );
}
