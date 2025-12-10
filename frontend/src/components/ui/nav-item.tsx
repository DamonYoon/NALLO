"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const navItemVariants = cva(
  "relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
  {
    variants: {
      variant: {
        default: "text-foreground hover:bg-surface-hover hover:text-brand",
        sidebar: "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        dark: "text-text-secondary hover:bg-surface-hover hover:text-text-primary",
      },
      active: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        active: true,
        className: "bg-accent text-brand",
      },
      {
        variant: "sidebar",
        active: true,
        className: "bg-sidebar-accent text-sidebar-accent-foreground",
      },
      {
        variant: "dark",
        active: true,
        className: "bg-surface-hover text-brand",
      },
    ],
    defaultVariants: {
      variant: "default",
      active: false,
    },
  }
);

export interface NavItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof navItemVariants> {
  icon?: React.ReactNode;
  showActiveIndicator?: boolean;
  asChild?: boolean;
}

const NavItem = React.forwardRef<HTMLDivElement, NavItemProps>(
  (
    {
      className,
      variant,
      active,
      icon,
      showActiveIndicator = true,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(navItemVariants({ variant, active, className }))}
        {...props}
      >
        {active && showActiveIndicator && (
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-brand rounded-r" />
        )}
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className={active && showActiveIndicator ? "ml-1" : ""}>
          {children}
        </span>
      </div>
    );
  }
);

NavItem.displayName = "NavItem";

export { NavItem, navItemVariants };

