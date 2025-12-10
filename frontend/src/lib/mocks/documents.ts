/**
 * Mock data for Document components
 * This file contains sample data for development and testing
 */

import type { DocumentStatus } from "@/components/ui/status-badge";

export type DocumentType = "api-guide" | "general" | "tutorial";

export interface Document {
  id: string;
  title: string;
  type: DocumentType;
  status: DocumentStatus;
  author: string;
  updatedAt: string;
  version: string;
  linkedTerms: number;
}

export const documentTypeLabels: Record<DocumentType, string> = {
  "api-guide": "API Guide",
  general: "General",
  tutorial: "Tutorial",
};

export const mockDocuments: Document[] = [
  {
    id: "1",
    title: "Using Nodit with AI & LLM Tools",
    type: "tutorial",
    status: "In Review",
    author: "Bailey",
    updatedAt: "2시간 전",
    version: "v2.1.0",
    linkedTerms: 5,
  },
  {
    id: "2",
    title: "arbitrum-eth_blocknumber",
    type: "api-guide",
    status: "Publish",
    author: "Damon",
    updatedAt: "5시간 전",
    version: "v1.3.2",
    linkedTerms: 3,
  },
  {
    id: "3",
    title: "Polygon Quickstart",
    type: "tutorial",
    status: "Draft",
    author: "Jonny",
    updatedAt: "1일 전",
    version: "v0.8.1",
    linkedTerms: 8,
  },
  {
    id: "4",
    title: "Webhook Security & Reliability",
    type: "general",
    status: "Done",
    author: "Ben",
    updatedAt: "2025.12.04",
    version: "v1.3.5",
    linkedTerms: 2,
  },
  {
    id: "5",
    title: "Web3 Data API Overview",
    type: "api-guide",
    status: "Publish",
    author: "Bailey",
    updatedAt: "2025.12.03",
    version: "v2.0.0",
    linkedTerms: 12,
  },
  {
    id: "6",
    title: "Getting Started with Elastic Node",
    type: "tutorial",
    status: "In Review",
    author: "Damon",
    updatedAt: "2025.12.02",
    version: "v1.1.0",
    linkedTerms: 6,
  },
  {
    id: "7",
    title: "Dedicated Node Configuration",
    type: "general",
    status: "Draft",
    author: "Jonny",
    updatedAt: "2025.12.01",
    version: "v0.5.0",
    linkedTerms: 4,
  },
  {
    id: "8",
    title: "GraphQL API Reference",
    type: "api-guide",
    status: "Done",
    author: "Ben",
    updatedAt: "2025.11.30",
    version: "v3.0.0",
    linkedTerms: 15,
  },
];

