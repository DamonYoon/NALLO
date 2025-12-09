"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  VersionForm,
  type VersionFormValues,
} from "@/components/versions/version-form";
import { VersionCard } from "@/components/versions/version-card";

// Mock version data
const mockVersions = [
  {
    id: "v1",
    version: "v2.0.0",
    name: "2025 Q1 릴리스",
    description: "새로운 검색 기능과 그래프 시각화가 추가된 주요 업데이트입니다.",
    is_public: true,
    is_main: true,
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-02-01T14:30:00Z",
  },
  {
    id: "v2",
    version: "v1.5.0",
    name: "2024 Q4 패치",
    description: "성능 개선 및 버그 수정",
    is_public: true,
    is_main: false,
    created_at: "2024-10-01T09:00:00Z",
    updated_at: "2024-11-15T11:00:00Z",
  },
  {
    id: "v3",
    version: "v2.1.0-beta",
    name: "베타 테스트",
    description: "새로운 에디터 기능 베타 테스트 버전입니다. 일부 기능이 불안정할 수 있습니다.",
    is_public: false,
    is_main: false,
    created_at: "2025-02-10T08:00:00Z",
    updated_at: "2025-02-10T08:00:00Z",
  },
  {
    id: "v4",
    version: "v1.0.0",
    name: "초기 릴리스",
    description: null,
    is_public: true,
    is_main: false,
    created_at: "2024-06-01T00:00:00Z",
    updated_at: "2024-06-01T00:00:00Z",
  },
];

export default function VersionFormPlayground() {
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isLoading, setIsLoading] = useState(false);
  const [lastSubmittedData, setLastSubmittedData] =
    useState<VersionFormValues | null>(null);

  const handleSubmit = async (data: VersionFormValues) => {
    setIsLoading(true);
    setLastSubmittedData(data);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsLoading(false);
    console.log("Submitted version data:", data);
    alert(`버전 ${formMode === "create" ? "생성" : "수정"} 성공!\n\n${JSON.stringify(data, null, 2)}`);
  };

  const handleCancel = () => {
    console.log("Form cancelled");
  };

  // Card action handlers
  const handleCardClick = (version: (typeof mockVersions)[0]) => {
    console.log("Card clicked:", version);
    alert(`버전 "${version.name}" 클릭됨`);
  };

  const handleEdit = (version: (typeof mockVersions)[0]) => {
    console.log("Edit version:", version);
    alert(`버전 "${version.name}" 편집`);
  };

  const handleDelete = (version: (typeof mockVersions)[0]) => {
    console.log("Delete version:", version);
    if (confirm(`버전 "${version.name}"을(를) 삭제하시겠습니까?`)) {
      alert("삭제됨 (Mock)");
    }
  };

  const handleSetMain = (version: (typeof mockVersions)[0]) => {
    console.log("Set as main:", version);
    alert(`"${version.name}"을(를) 메인 버전으로 설정함 (Mock)`);
  };

  const handleTogglePublic = (version: (typeof mockVersions)[0]) => {
    console.log("Toggle public:", version);
    alert(
      `"${version.name}"을(를) ${version.is_public ? "비공개" : "공개"}로 전환함 (Mock)`
    );
  };

  // Edit mode default values
  const editDefaultValues: Partial<VersionFormValues> = {
    version: "v1.5.0",
    name: "2024 Q4 패치",
    description: "성능 개선 및 버그 수정",
    is_public: true,
    is_main: false,
  };

  return (
    <div className="container py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/playground"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Playground로 돌아가기
        </Link>
        <h1 className="text-3xl font-bold">VersionForm & VersionCard</h1>
        <p className="text-muted-foreground mt-2">
          버전 관련 컴포넌트 테스트 페이지입니다.
        </p>
      </div>

      <Tabs defaultValue="form" className="space-y-6">
        <TabsList>
          <TabsTrigger value="form">VersionForm</TabsTrigger>
          <TabsTrigger value="cards">VersionCard</TabsTrigger>
        </TabsList>

        {/* VersionForm Tab */}
        <TabsContent value="form" className="space-y-6">
          {/* Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">모드:</span>
            <Button
              variant={formMode === "create" ? "default" : "outline"}
              size="sm"
              onClick={() => setFormMode("create")}
            >
              <Plus className="mr-1 h-4 w-4" />
              생성
            </Button>
            <Button
              variant={formMode === "edit" ? "default" : "outline"}
              size="sm"
              onClick={() => setFormMode("edit")}
            >
              편집
            </Button>
          </div>

          {/* Form */}
          <div className="max-w-2xl">
            <VersionForm
              key={formMode}
              mode={formMode}
              defaultValues={formMode === "edit" ? editDefaultValues : undefined}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          </div>

          {/* Last Submitted Data */}
          {lastSubmittedData && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">마지막 제출 데이터:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(lastSubmittedData, null, 2)}
              </pre>
            </div>
          )}

          {/* Tips */}
          <div className="rounded-lg border p-4 bg-muted/50">
            <h3 className="font-medium mb-2">💡 사용법</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 버전 식별자는 시맨틱 버전 형식 (v1.0.0)을 따릅니다</li>
              <li>• 편집 모드에서는 버전 식별자를 변경할 수 없습니다</li>
              <li>• 메인 버전은 사용자에게 기본으로 표시되는 버전입니다</li>
              <li>• 비공개 버전은 관리자만 볼 수 있습니다</li>
            </ul>
          </div>
        </TabsContent>

        {/* VersionCard Tab */}
        <TabsContent value="cards" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockVersions.map((version) => (
              <VersionCard
                key={version.id}
                version={version}
                onClick={handleCardClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSetMain={handleSetMain}
                onTogglePublic={handleTogglePublic}
              />
            ))}
          </div>

          {/* Tips */}
          <div className="rounded-lg border p-4 bg-muted/50">
            <h3 className="font-medium mb-2">💡 VersionCard 기능</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 카드 클릭 시 상세 페이지로 이동 가능</li>
              <li>• 메인 버전은 강조 테두리로 표시됩니다</li>
              <li>• 호버 시 더보기 메뉴가 나타납니다</li>
              <li>• 공개/비공개 상태가 뱃지로 표시됩니다</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

