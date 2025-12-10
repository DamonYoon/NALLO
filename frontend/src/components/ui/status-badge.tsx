"use client";

import * as React from "react";
import { Badge, badgeVariants } from "./badge";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

/**
 * Document/Content Status Types
 */
export type DocumentStatus = "Draft" | "In Review" | "Done" | "Publish";

/**
 * Node Types for Graph
 */
export type NodeType = "page" | "document" | "concept" | "tag";

/**
 * Status to Badge Variant Mapping
 */
const statusVariantMap: Record<DocumentStatus, VariantProps<typeof badgeVariants>["variant"]> = {
  Draft: "draft",
  "In Review": "in-review",
  Done: "done",
  Publish: "publish",
};

/**
 * Node Type to Badge Variant Mapping
 */
const nodeTypeVariantMap: Record<NodeType, VariantProps<typeof badgeVariants>["variant"]> = {
  page: "page",
  document: "document",
  concept: "concept",
  tag: "tag",
};

/**
 * Status Badge Component
 * Type-safe wrapper for document status badges
 */
export interface StatusBadgeProps extends Omit<React.ComponentProps<typeof Badge>, "variant"> {
  status: DocumentStatus;
}

export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const variant = statusVariantMap[status];
  
  return (
    <Badge variant={variant} className={cn("text-[11px]", className)} {...props}>
      {status}
    </Badge>
  );
}

/**
 * Node Type Badge Component
 * Type-safe wrapper for node type badges in graphs
 */
export interface NodeTypeBadgeProps extends Omit<React.ComponentProps<typeof Badge>, "variant"> {
  nodeType: NodeType;
  label?: string;
}

export function NodeTypeBadge({ nodeType, label, className, ...props }: NodeTypeBadgeProps) {
  const variant = nodeTypeVariantMap[nodeType];
  const displayLabel = label || nodeType.charAt(0).toUpperCase() + nodeType.slice(1);
  
  return (
    <Badge variant={variant} className={cn("text-[11px]", className)} {...props}>
      {displayLabel}
    </Badge>
  );
}

/**
 * Utility function to get status color classes
 */
export function getStatusColorClasses(status: DocumentStatus) {
  const colorMap: Record<DocumentStatus, { bg: string; text: string }> = {
    Draft: { bg: "bg-muted", text: "text-text-tertiary" },
    "In Review": { bg: "bg-warning-bg", text: "text-warning" },
    Done: { bg: "bg-success-bg", text: "text-success" },
    Publish: { bg: "bg-info-bg", text: "text-info" },
  };
  
  return colorMap[status];
}

/**
 * Utility function to get node type color classes
 */
export function getNodeTypeColorClasses(nodeType: NodeType) {
  const colorMap: Record<NodeType, { bg: string; text: string; border: string }> = {
    page: { bg: "bg-node-page/20", text: "text-node-page", border: "border-node-page" },
    document: { bg: "bg-node-document/20", text: "text-node-document", border: "border-node-document" },
    concept: { bg: "bg-node-concept/20", text: "text-node-concept", border: "border-node-concept" },
    tag: { bg: "bg-node-tag/20", text: "text-node-tag", border: "border-node-tag" },
  };
  
  return colorMap[nodeType];
}

