"use client";

import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/cjs/styles/prism";
import { useTheme } from "next-themes";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

// Separate component for code block with copy functionality
function CodeBlock({
  code,
  language,
  isDark,
}: {
  code: string;
  language: string;
  isDark: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className="relative group not-prose">
      {/* Header with language badge and copy button */}
      <div className="absolute right-2 top-2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded border">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className={cn(
            "p-1.5 rounded border transition-colors",
            copied
              ? "bg-green-500/20 border-green-500/50 text-green-600 dark:text-green-400"
              : "bg-background/80 hover:bg-background border-border text-muted-foreground hover:text-foreground"
          )}
          title={copied ? "Copied!" : "Copy code"}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      <SyntaxHighlighter
        style={isDark ? oneDark : oneLight}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: "0.5rem",
          fontSize: "0.875rem",
          border: "1px solid hsl(var(--border))",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export function MarkdownViewer({ content, className }: MarkdownViewerProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div
      className={cn(
        "prose prose-neutral dark:prose-invert max-w-none",
        // Headings
        "prose-headings:scroll-mt-20 prose-headings:font-semibold",
        "prose-h1:text-3xl prose-h1:border-b prose-h1:pb-2",
        "prose-h2:text-2xl prose-h2:border-b prose-h2:pb-1",
        "prose-h3:text-xl",
        // Links - hover:underline applied to each link individually
        "prose-a:text-primary prose-a:no-underline prose-a:hover:underline",
        // Code (inline only)
        "prose-code:before:content-none prose-code:after:content-none",
        "prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-normal",
        // Pre - remove default styles for syntax highlighter
        "prose-pre:p-0 prose-pre:bg-transparent prose-pre:border-0",
        // Tables
        "prose-table:border prose-table:border-collapse",
        "prose-th:border prose-th:px-3 prose-th:py-2 prose-th:bg-muted",
        "prose-td:border prose-td:px-3 prose-td:py-2",
        // Blockquote
        "prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-1",
        // Lists
        "prose-li:marker:text-muted-foreground",
        // Images
        "prose-img:rounded-lg prose-img:border",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom code block rendering with syntax highlighting
          code({ className, children }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");

            // Check if it's a code block (has language) or inline code
            if (match) {
              return (
                <CodeBlock
                  code={codeString}
                  language={match[1]}
                  isDark={isDark}
                />
              );
            }

            // Inline code
            return <code className={className}>{children}</code>;
          },
          // Custom link rendering (open external links in new tab)
          a({ href, children, ...props }) {
            const isExternal = href?.startsWith("http");
            return (
              <a
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                {...props}
              >
                {children}
              </a>
            );
          },
          // Custom table rendering
          table({ children, ...props }) {
            return (
              <div className="overflow-x-auto my-4">
                <table {...props}>{children}</table>
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
