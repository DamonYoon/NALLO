"use client";

import { useState, useCallback } from "react";
import { AlertTriangle, Info, Trash2, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];

export type ConfirmVariant = "default" | "warning" | "danger";

interface ConfirmDialogProps {
  /** Dialog trigger element */
  trigger?: React.ReactNode;
  /** Dialog title */
  title: string;
  /** Dialog description */
  description: string;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Dialog variant */
  variant?: ConfirmVariant;
  /** Callback when confirmed */
  onConfirm: () => void | Promise<void>;
  /** Callback when cancelled */
  onCancel?: () => void;
  /** Open state (controlled) */
  open?: boolean;
  /** Open change callback (controlled) */
  onOpenChange?: (open: boolean) => void;
  /** Disable confirm button */
  disabled?: boolean;
  /** Show loading state on confirm */
  isLoading?: boolean;
}

const variantStyles: Record<
  ConfirmVariant,
  {
    icon: React.ComponentType<{ className?: string }>;
    iconClass: string;
    buttonVariant: ButtonVariant;
  }
> = {
  default: {
    icon: Info,
    iconClass: "text-blue-500",
    buttonVariant: "default",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-yellow-500",
    buttonVariant: "default",
  },
  danger: {
    icon: Trash2,
    iconClass: "text-destructive",
    buttonVariant: "destructive",
  },
};

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmText = "확인",
  cancelText = "취소",
  variant = "default",
  onConfirm,
  onCancel,
  open: controlledOpen,
  onOpenChange,
  disabled = false,
  isLoading = false,
}: ConfirmDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [internalLoading, setInternalLoading] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const loading = isLoading || internalLoading;

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (isControlled) {
        onOpenChange?.(newOpen);
      } else {
        setInternalOpen(newOpen);
      }
    },
    [isControlled, onOpenChange]
  );

  const handleConfirm = useCallback(async () => {
    try {
      setInternalLoading(true);
      await onConfirm();
      handleOpenChange(false);
    } finally {
      setInternalLoading(false);
    }
  }, [onConfirm, handleOpenChange]);

  const handleCancel = useCallback(() => {
    onCancel?.();
    handleOpenChange(false);
  }, [onCancel, handleOpenChange]);

  const styles = variantStyles[variant];
  const Icon = styles.icon;

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                variant === "danger" && "bg-destructive/10",
                variant === "warning" && "bg-yellow-500/10",
                variant === "default" && "bg-blue-500/10"
              )}
            >
              <Icon className={cn("h-5 w-5", styles.iconClass)} />
            </div>
            <div className="space-y-2">
              <AlertDialogTitle>{title}</AlertDialogTitle>
              <AlertDialogDescription>{description}</AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={loading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={disabled || loading}
            className={cn(
              styles.buttonVariant === "destructive" &&
                "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            )}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Convenience hook for programmatic dialogs
export function useConfirmDialog() {
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    title: string;
    description: string;
    variant: ConfirmVariant;
    confirmText: string;
    onConfirm: () => void | Promise<void>;
  }>({
    open: false,
    title: "",
    description: "",
    variant: "default",
    confirmText: "확인",
    onConfirm: () => {},
  });

  const confirm = useCallback(
    (options: {
      title: string;
      description: string;
      variant?: ConfirmVariant;
      confirmText?: string;
    }): Promise<boolean> => {
      return new Promise((resolve) => {
        setDialogState({
          open: true,
          title: options.title,
          description: options.description,
          variant: options.variant || "default",
          confirmText: options.confirmText || "확인",
          onConfirm: () => resolve(true),
        });
      });
    },
    []
  );

  const handleOpenChange = useCallback((open: boolean) => {
    setDialogState((prev) => ({ ...prev, open }));
  }, []);

  const ConfirmDialogComponent = (
    <ConfirmDialog
      open={dialogState.open}
      onOpenChange={handleOpenChange}
      title={dialogState.title}
      description={dialogState.description}
      variant={dialogState.variant}
      confirmText={dialogState.confirmText}
      onConfirm={dialogState.onConfirm}
      onCancel={() => handleOpenChange(false)}
    />
  );

  return { confirm, ConfirmDialog: ConfirmDialogComponent };
}

