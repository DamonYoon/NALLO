import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { GlossaryCategory } from "@/lib/mocks/glossary";

/* ============================================
   Category Badge Styles (using CSS variables)
   ============================================ */

const CATEGORY_STYLES: Record<GlossaryCategory, { bg: string; text: string }> = {
  "API 요소": { 
    bg: "bg-warning-bg", 
    text: "text-warning" 
  },
  "개념": { 
    bg: "bg-info-bg", 
    text: "text-info" 
  },
  "기능": { 
    bg: "bg-success-bg", 
    text: "text-success" 
  },
};

/* ============================================
   Props
   ============================================ */

interface CategoryBadgeProps {
  category: GlossaryCategory;
  className?: string;
}

/* ============================================
   Component
   ============================================ */

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const style = CATEGORY_STYLES[category];
  
  return (
    <Badge
      variant="secondary"
      className={cn(
        "text-[11px]",
        style.bg,
        style.text,
        className
      )}
    >
      {category}
    </Badge>
  );
}

