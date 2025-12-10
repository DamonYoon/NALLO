import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "circular" | "rectangular";
  animation?: "pulse" | "shimmer" | "none";
}

function Skeleton({
  className,
  variant = "default",
  animation = "pulse",
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-muted",
        variant === "circular" && "rounded-full",
        variant === "rectangular" && "rounded-none",
        variant === "default" && "rounded-md",
        animation === "pulse" && "animate-pulse",
        animation === "shimmer" &&
          "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };

