"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Loader2,
  Database,
  Check,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  VersionForm,
  type VersionFormValues,
} from "@/components/versions/version-form";
import { VersionCard } from "@/components/versions/version-card";
import { versionsApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/api/client";
import type { Version } from "@/lib/types/api";

// Sample test data templates
const sampleVersions = [
  {
    version: "v1.0.0",
    name: "초기 릴리스",
    description: "NALLO 문서 시스템의 첫 번째 공식 릴리스입니다.",
    is_public: true,
    is_main: false,
  },
  {
    version: "v1.1.0",
    name: "기능 개선",
    description: "검색 기능 개선 및 버그 수정이 포함된 업데이트입니다.",
    is_public: true,
    is_main: false,
  },
  {
    version: "v2.0.0",
    name: "메이저 업데이트",
    description: "그래프 시각화 및 용어 관리 기능이 추가된 주요 업데이트입니다.",
    is_public: true,
    is_main: true,
  },
];

export default function VersionFormPlayground() {
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isLoading, setIsLoading] = useState(false);
  const [lastSubmittedData, setLastSubmittedData] =
    useState<VersionFormValues | null>(null);
  const [apiResult, setApiResult] = useState<{
    success: boolean;
    message: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);

  // Load versions from API
  const loadVersions = async () => {
    setIsLoadingVersions(true);
    try {
      const response = await versionsApi.list();
      // Handle both array and object response
      const items = Array.isArray(response) ? response : response.items;
      setVersions(items || []);
    } catch (error) {
      console.error("Failed to load versions:", error);
      setVersions([]);
    } finally {
      setIsLoadingVersions(false);
    }
  };

  useEffect(() => {
    loadVersions();
  }, []);

  const handleSubmit = async (data: VersionFormValues) => {
    setIsLoading(true);
    setLastSubmittedData(data);
    setApiResult(null);

    try {
      const result = await versionsApi.create({
        version: data.version,
        name: data.name,
        description: data.description,
        is_public: data.is_public,
        is_main: data.is_main,
      });

      setApiResult({
        success: true,
        message: `버전이 성공적으로 생성되었습니다. (ID: ${result.id})`,
        data: result,
      });

      // Reload versions list
      loadVersions();
    } catch (error) {
      setApiResult({
        success: false,
        message: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    console.log("Form cancelled");
    setLastSubmittedData(null);
    setApiResult(null);
  };

  // Generate random test version
  const handleGenerateTestData = async () => {
    setIsGenerating(true);
    setApiResult(null);

    try {
      const majorVersion = Math.floor(Math.random() * 5) + 1;
      const minorVersion = Math.floor(Math.random() * 10);
      const patchVersion = Math.floor(Math.random() * 10);
      const randomSuffix = Math.random().toString(36).substring(2, 6);

      const result = await versionsApi.create({
        version: `v${majorVersion}.${minorVersion}.${patchVersion}`,
        name: `테스트 버전 - ${randomSuffix}`,
        description: `자동 생성된 테스트 버전입니다. (${new Date().toLocaleString("ko-KR")})`,
        is_public: Math.random() > 0.5,
        is_main: false,
      });

      setApiResult({
        success: true,
        message: `테스트 버전이 생성되었습니다. (ID: ${result.id})`,
        data: result,
      });

      loadVersions();
    } catch (error) {
      setApiResult({
        success: false,
        message: getErrorMessage(error),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate bulk test versions
  const handleGenerateBulkTestData = async () => {
    setIsGenerating(true);
    setApiResult(null);

    try {
      const results = [];
      for (let i = 0; i < sampleVersions.length; i++) {
        const sample = sampleVersions[i];
        const randomSuffix = Math.random().toString(36).substring(2, 6);
        // Add randomness to version to avoid duplicates
        const [, major, minor, patch] =
          sample.version.match(/v(\d+)\.(\d+)\.(\d+)/) || [];

        const result = await versionsApi.create({
          version: `v${parseInt(major) + Math.floor(Math.random() * 10)}.${parseInt(minor) + Math.floor(Math.random() * 10)}.${parseInt(patch) + Math.floor(Math.random() * 10)}`,
          name: `${sample.name} - ${randomSuffix}`,
          description: sample.description,
          is_public: sample.is_public,
          is_main: i === sampleVersions.length - 1, // Last one is main
        });
        results.push(result);
      }

      setApiResult({
        success: true,
        message: `${results.length}개의 테스트 버전이 생성되었습니다.`,
        data: results,
      });

      loadVersions();
    } catch (error) {
      setApiResult({
        success: false,
        message: getErrorMessage(error),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Card action handlers
  const handleCardClick = (version: Version) => {
    console.log("Card clicked:", version);
    alert(`버전 "${version.name}" 클릭됨`);
  };

  const handleEdit = (version: Version) => {
    console.log("Edit version:", version);
    setFormMode("edit");
    alert(`버전 "${version.name}" 편집 - 편집 모드로 전환됨`);
  };

  const handleDelete = async (version: Version) => {
    console.log("Delete version:", version);
    if (confirm(`버전 "${version.name}"을(를) 삭제하시겠습니까?`)) {
      try {
        await versionsApi.delete(version.id);
        setApiResult({
          success: true,
          message: `버전 "${version.name}"이(가) 삭제되었습니다.`,
        });
        loadVersions();
      } catch (error) {
        setApiResult({
          success: false,
          message: getErrorMessage(error),
        });
      }
    }
  };

  const handleSetMain = async (version: Version) => {
    console.log("Set as main:", version);
    try {
      await versionsApi.update(version.id, { is_main: true });
      setApiResult({
        success: true,
        message: `"${version.name}"을(를) 메인 버전으로 설정했습니다.`,
      });
      loadVersions();
    } catch (error) {
      setApiResult({
        success: false,
        message: getErrorMessage(error),
      });
    }
  };

  const handleTogglePublic = async (version: Version) => {
    console.log("Toggle public:", version);
    try {
      await versionsApi.update(version.id, { is_public: !version.is_public });
      setApiResult({
        success: true,
        message: `"${version.name}"을(를) ${version.is_public ? "비공개" : "공개"}로 전환했습니다.`,
      });
      loadVersions();
    } catch (error) {
      setApiResult({
        success: false,
        message: getErrorMessage(error),
      });
    }
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
          버전 관련 컴포넌트 테스트 페이지 (실제 API 연동)
        </p>
      </div>

      {/* API Result */}
      {apiResult && (
        <Card
          className={`mb-6 ${
            apiResult.success
              ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30"
              : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30"
          }`}
        >
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              {apiResult.success ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              API 응답
            </CardTitle>
          </CardHeader>
          <CardContent className="py-3">
            <p
              className={`text-sm ${apiResult.success ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}
            >
              {apiResult.message}
            </p>
            {apiResult.data && (
              <pre className="mt-2 bg-muted p-3 rounded-md text-xs overflow-auto max-h-40">
                {JSON.stringify(apiResult.data, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      )}

      {/* Test Data Generation */}
      <Card className="mb-6">
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="h-4 w-4" />
            테스트 데이터 생성
          </CardTitle>
        </CardHeader>
        <CardContent className="py-3">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateTestData}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              랜덤 버전 1개 생성
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateBulkTestData}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              샘플 버전 3개 일괄 생성
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            클릭 시 실제 DB에 테스트 데이터가 생성됩니다.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="form" className="space-y-6">
        <TabsList>
          <TabsTrigger value="form">VersionForm</TabsTrigger>
          <TabsTrigger value="cards">
            VersionCard ({versions.length})
          </TabsTrigger>
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
              <li>• 생성 버튼 클릭 시 실제 DB에 저장됩니다</li>
            </ul>
          </div>
        </TabsContent>

        {/* VersionCard Tab */}
        <TabsContent value="cards" className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              DB에서 가져온 버전 목록입니다.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={loadVersions}
              disabled={isLoadingVersions}
            >
              {isLoadingVersions ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              새로고침
            </Button>
          </div>

          {isLoadingVersions ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>등록된 버전이 없습니다.</p>
              <p className="text-sm mt-2">
                테스트 데이터 생성 버튼을 클릭하거나 폼에서 새 버전을
                생성해보세요.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {versions.map((version) => (
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
          )}

          {/* Tips */}
          <div className="rounded-lg border p-4 bg-muted/50">
            <h3 className="font-medium mb-2">💡 VersionCard 기능</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 카드 클릭 시 상세 페이지로 이동 가능</li>
              <li>• 메인 버전은 강조 테두리로 표시됩니다</li>
              <li>• 호버 시 더보기 메뉴가 나타납니다</li>
              <li>• 공개/비공개 상태가 뱃지로 표시됩니다</li>
              <li>• 삭제 시 실제 DB에서 삭제됩니다</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
