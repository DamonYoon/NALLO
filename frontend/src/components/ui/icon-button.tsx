"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

const iconButtonVariants = cva(
  "inline-flex items-center justify-center rounded-md transition-colors disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "hover:bg-surface-hover active:bg-surface-active",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        brand: "text-brand hover:bg-brand/10",
        muted:
          "text-text-tertiary hover:text-text-secondary hover:bg-surface-hover",
        dark: "text-text-secondary hover:text-text-primary hover:bg-surface-hover",
      },
      size: {
        default: "size-8 [&_svg]:size-4",
        sm: "size-7 [&_svg]:size-3.5",
        xs: "size-6 [&_svg]:size-3",
        lg: "size-9 [&_svg]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  tooltip?: string;
  tooltipSide?: "top" | "right" | "bottom" | "left";
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant,
      size,
      tooltip,
      tooltipSide = "top",
      children,
      ...props
    },
    ref
  ) => {
    const button = (
      <button
        ref={ref}
        className={cn(iconButtonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </button>
    );

    if (tooltip) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side={tooltipSide}>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  }
);

IconButton.displayName = "IconButton";

export { IconButton, iconButtonVariants };
