/**
 * Mock data for Sidebar component
 * This file contains sample data for development and testing
 */

export interface NavigationItem {
  id: string;
  name: string;
  path?: string;
}

export interface DocumentTreeItem {
  id: string;
  name: string;
  count: number;
  expanded?: boolean;
  children: DocumentTreeChild[];
}

export interface DocumentTreeChild {
  id: string;
  name: string;
  path?: string;
}

export const mockNavigationItems: NavigationItem[] = [
  { id: "nav-1", name: "Getting Started", path: "/getting-started" },
  { id: "nav-2", name: "Recipes", path: "/recipes" },
  { id: "nav-3", name: "API Reference", path: "/api-reference" },
  { id: "nav-4", name: "GraphQL", path: "/graphql" },
];

export const mockDocumentTree: DocumentTreeItem[] = [
  {
    id: "doc-1",
    name: "Welcome to Nodit",
    count: 14,
    expanded: true,
    children: [{ id: "doc-1-1", name: "Overview", path: "/overview" }],
  },
  {
    id: "doc-2",
    name: "Features",
    count: 6,
    expanded: true,
    children: [
      { id: "doc-2-1", name: "Elastic Node", path: "/features/elastic-node" },
      { id: "doc-2-2", name: "Dedicated Node", path: "/features/dedicated-node" },
      { id: "doc-2-3", name: "Web3 Data API", path: "/features/web3-data-api" },
    ],
  },
  {
    id: "doc-3",
    name: "Learn & Run",
    count: 18,
    expanded: false,
    children: [],
  },
  {
    id: "doc-4",
    name: "FAQ",
    count: 5,
    expanded: false,
    children: [],
  },
];

