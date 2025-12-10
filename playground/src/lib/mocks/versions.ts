import type { Version, NavigationNode } from "@/lib/types/api";

// Mock Versions
export const mockVersions: Version[] = [
  {
    id: "version-001",
    version: "v1.0.0",
    name: "Initial Release",
    description: "NALLO 첫 번째 정식 릴리즈",
    is_public: true,
    is_main: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z",
  },
  {
    id: "version-002",
    version: "v1.1.0",
    name: "Feature Update",
    description: "그래프 뷰 기능 추가",
    is_public: true,
    is_main: false,
    created_at: "2024-01-10T00:00:00Z",
    updated_at: "2024-01-20T00:00:00Z",
  },
  {
    id: "version-003",
    version: "v2.0.0-beta",
    name: "Beta Release",
    description: "AI 기능 베타 테스트",
    is_public: false,
    is_main: false,
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-01-25T00:00:00Z",
  },
];

// Mock Navigation Tree
export const mockNavigationTree: NavigationNode[] = [
  {
    id: "page-001",
    title: "Getting Started",
    slug: "getting-started",
    children: [
      {
        id: "page-002",
        title: "Installation",
        slug: "installation",
        children: [],
      },
      {
        id: "page-003",
        title: "Quick Start",
        slug: "quick-start",
        children: [],
      },
    ],
  },
  {
    id: "page-004",
    title: "API Reference",
    slug: "api-reference",
    children: [
      {
        id: "page-005",
        title: "Documents",
        slug: "documents",
        children: [],
      },
      {
        id: "page-006",
        title: "Concepts",
        slug: "concepts",
        children: [],
      },
      {
        id: "page-007",
        title: "Versions",
        slug: "versions",
        children: [],
      },
    ],
  },
  {
    id: "page-008",
    title: "Guides",
    slug: "guides",
    children: [
      {
        id: "page-009",
        title: "Writing Documents",
        slug: "writing-documents",
        children: [],
      },
      {
        id: "page-010",
        title: "Managing Glossary",
        slug: "managing-glossary",
        children: [],
      },
    ],
  },
];

// Helper to get mock version by ID
export function getMockVersion(id: string): Version | undefined {
  return mockVersions.find((version) => version.id === id);
}

// Helper to get main version
export function getMainVersion(): Version | undefined {
  return mockVersions.find((version) => version.is_main);
}
