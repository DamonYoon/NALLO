import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const components = [
  {
    name: "api-test",
    title: "API Test",
    description: "API 연결 상태 및 Mock 데이터 테스트",
    status: "ready",
  },
  {
    name: "blocknote-editor",
    title: "BlockNote Editor",
    description: "그래프 연결 멘션이 지원되는 블록 기반 WYSIWYG 에디터",
    status: "ready",
  },
  {
    name: "document-form",
    title: "Document Form",
    description: "문서 기본 정보 폼 (제목, 타입, 언어, 태그)",
    status: "ready",
  },
  {
    name: "data-table",
    title: "Data Table",
    description: "범용 데이터 테이블 (정렬, 필터, 페이지네이션)",
    status: "ready",
  },
  {
    name: "concept-form",
    title: "Concept Form",
    description: "용어 폼 및 영향도 분석 (ConceptForm + ImpactAnalysis)",
    status: "ready",
  },
  {
    name: "version-form",
    title: "Version Form",
    description: "버전 폼 및 버전 카드 (VersionForm + VersionCard)",
    status: "ready",
  },
  {
    name: "page-tree",
    title: "Page Tree",
    description: "페이지 트리 구조 (확장/축소, 선택, 액션 메뉴)",
    status: "ready",
  },
  {
    name: "shared",
    title: "Shared Components",
    description: "공통 컴포넌트 (SearchInput, ConfirmDialog, EmptyState, FileUploader)",
    status: "ready",
  },
  {
    name: "graph-view",
    title: "Graph View",
    description: "그래프 시각화",
    status: "pending",
  },
];

export default function PlaygroundPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Component Playground</h1>
      <p className="text-muted-foreground mb-8">
        각 컴포넌트를 독립적으로 테스트하고 개발할 수 있습니다.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {components.map((component) => (
          <Link key={component.name} href={`/playground/${component.name}`}>
            <Card className="hover:border-primary transition-colors cursor-pointer h-full group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {component.title}
                  </CardTitle>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      component.status === "ready"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}
                  >
                    {component.status === "ready" ? "Ready" : "Pending"}
                  </span>
                </div>
                <CardDescription>{component.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-12 p-6 border rounded-lg bg-muted/50">
        <h2 className="text-lg font-semibold mb-2">📋 개발 가이드</h2>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>
            • 컴포넌트 생성:{" "}
            <code className="bg-muted px-1 rounded">
              src/components/[domain]/[name].tsx
            </code>
          </li>
          <li>
            • Playground 페이지:{" "}
            <code className="bg-muted px-1 rounded">
              src/app/playground/[name]/page.tsx
            </code>
          </li>
          <li>
            • Mock 데이터:{" "}
            <code className="bg-muted px-1 rounded">
              src/lib/mocks/[domain].ts
            </code>
          </li>
        </ul>
      </div>
    </div>
  );
}
