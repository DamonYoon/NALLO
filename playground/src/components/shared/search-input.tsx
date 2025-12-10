"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface SearchInputProps {
  /** Placeholder text */
  placeholder?: string;
  /** Initial value */
  defaultValue?: string;
  /** Controlled value */
  value?: string;
  /** Callback when search value changes (debounced) */
  onSearch?: (value: string) => void;
  /** Callback when value changes (immediate) */
  onChange?: (value: string) => void;
  /** Debounce delay in ms */
  debounceMs?: number;
  /** Show loading indicator */
  isLoading?: boolean;
  /** Disable input */
  disabled?: boolean;
  /** Show clear button */
  showClear?: boolean;
  /** Size variant */
  size?: "default" | "sm" | "lg";
  /** Additional class name */
  className?: string;
  /** Auto focus on mount */
  autoFocus?: boolean;
}

export function SearchInput({
  placeholder = "검색...",
  defaultValue = "",
  value: controlledValue,
  onSearch,
  onChange,
  debounceMs = 300,
  isLoading = false,
  disabled = false,
  showClear = true,
  size = "default",
  className,
  autoFocus = false,
}: SearchInputProps) {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = isControlled ? controlledValue : internalValue;
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced value
  const debouncedValue = useDebounce(value, debounceMs);

  // Call onSearch when debounced value changes
  useEffect(() => {
    onSearch?.(debouncedValue);
  }, [debouncedValue, onSearch]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    },
    [isControlled, onChange]
  );

  const handleClear = useCallback(() => {
    if (!isControlled) {
      setInternalValue("");
    }
    onChange?.("");
    onSearch?.("");
    inputRef.current?.focus();
  }, [isControlled, onChange, onSearch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        handleClear();
      }
    },
    [handleClear]
  );

  const sizeClasses = {
    sm: "h-8 text-sm",
    default: "h-10",
    lg: "h-12 text-lg",
  };

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    default: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div className={cn("relative", className)}>
      {/* Search icon */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
        {isLoading ? (
          <Loader2 className={cn(iconSizes[size], "animate-spin")} />
        ) : (
          <Search className={iconSizes[size]} />
        )}
      </div>

      {/* Input */}
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={cn(
          sizeClasses[size],
          "pl-9",
          showClear && value && "pr-9"
        )}
      />

      {/* Clear button */}
      {showClear && value && !disabled && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className={cn(
            "absolute right-1 top-1/2 -translate-y-1/2",
            size === "sm" && "h-6 w-6",
            size === "default" && "h-7 w-7",
            size === "lg" && "h-9 w-9"
          )}
        >
          <X className={iconSizes[size]} />
        </Button>
      )}
    </div>
  );
}

