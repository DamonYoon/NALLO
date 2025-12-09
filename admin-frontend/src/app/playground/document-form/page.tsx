"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  FileText,
  RotateCcw,
  Loader2,
  Plus,
  Database,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DocumentForm,
  DocumentFormValues,
} from "@/components/documents/document-form";
import { documentsApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/api/client";

// Sample test data templates
const sampleDocuments = [
  {
    title: "시작하기 가이드",
    type: "tutorial" as const,
    lang: "ko",
    content: "# 시작하기\n\n이 문서는 NALLO를 시작하는 방법을 설명합니다.\n\n## 설치\n\n```bash\nnpm install nallo\n```",
    tags: ["시작하기", "설치", "튜토리얼"],
  },
  {
    title: "API Reference",
    type: "api" as const,
    lang: "en",
    content: "# API Reference\n\n## Authentication\n\nAll API requests require authentication.\n\n### Bearer Token\n\n```\nAuthorization: Bearer <token>\n```",
    tags: ["api", "reference", "authentication"],
  },
  {
    title: "인증 가이드",
    type: "general" as const,
    lang: "ko",
    content: "# 인증 가이드\n\n## OAuth 2.0\n\nNALLO는 OAuth 2.0 인증을 지원합니다.\n\n### 토큰 발급\n\n1. 클라이언트 등록\n2. 인증 코드 발급\n3. 액세스 토큰 교환",
    tags: ["인증", "OAuth", "보안"],
  },
];

export default function DocumentFormPlayground() {
  const [isLoading, setIsLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState<DocumentFormValues | null>(
    null
  );
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [apiResult, setApiResult] = useState<{
    success: boolean;
    message: string;
    data?: unknown;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock existing document for edit mode
  const existingDocument: Partial<DocumentFormValues> = {
    title: "기존 문서 제목",
    type: "api",
    lang: "ko",
    summary: "이것은 기존 문서의 요약입니다.",
    tags: ["api", "인증", "시작하기"],
  };

  const handleSubmit = async (values: DocumentFormValues) => {
    setIsLoading(true);
    setApiResult(null);

    try {
      // Create document via API
      const result = await documentsApi.create({
        title: values.title,
        type: values.type,
        lang: values.lang,
        content: values.summary || `# ${values.title}\n\n문서 내용을 작성하세요.`,
        tags: values.tags,
      });

      setSubmittedData(values);
      setApiResult({
        success: true,
        message: `문서가 성공적으로 생성되었습니다. (ID: ${result.id})`,
        data: result,
      });
    } catch (error) {
      setApiResult({
        success: false,
        message: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSubmittedData(null);
    setApiResult(null);
  };

  // Generate random test data
  const handleGenerateTestData = async () => {
    setIsGenerating(true);
    setApiResult(null);

    try {
      const sample =
        sampleDocuments[Math.floor(Math.random() * sampleDocuments.length)];
      const randomSuffix = Math.random().toString(36).substring(2, 8);

      const result = await documentsApi.create({
        title: `${sample.title} - ${randomSuffix}`,
        type: sample.type,
        lang: sample.lang,
        content: sample.content,
        tags: sample.tags,
      });

      setApiResult({
        success: true,
        message: `테스트 문서가 생성되었습니다. (ID: ${result.id})`,
        data: result,
      });
    } catch (error) {
      setApiResult({
        success: false,
        message: getErrorMessage(error),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate multiple test documents
  const handleGenerateBulkTestData = async () => {
    setIsGenerating(true);
    setApiResult(null);

    try {
      const results = [];
      for (const sample of sampleDocuments) {
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const result = await documentsApi.create({
          title: `${sample.title} - ${randomSuffix}`,
          type: sample.type,
          lang: sample.lang,
          content: sample.content,
          tags: sample.tags,
        });
        results.push(result);
      }

      setApiResult({
        success: true,
        message: `${results.length}개의 테스트 문서가 생성되었습니다.`,
        data: results,
      });
    } catch (error) {
      setApiResult({
        success: false,
        message: getErrorMessage(error),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/playground">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">DocumentForm</h1>
            <p className="text-muted-foreground">
              문서 기본 정보 입력 폼 (실제 API 연동)
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Form section */}
        <div className="space-y-4">
          {/* Mode toggle */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">모드 선택</CardTitle>
            </CardHeader>
            <CardContent className="py-3">
              <div className="flex gap-2">
                <Button
                  variant={mode === "create" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setMode("create");
                    setSubmittedData(null);
                    setApiResult(null);
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  생성 모드
                </Button>
                <Button
                  variant={mode === "edit" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setMode("edit");
                    setSubmittedData(null);
                    setApiResult(null);
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  편집 모드
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Test Data Generation */}
          <Card>
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
                  랜덤 문서 1개 생성
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
                  샘플 문서 3개 일괄 생성
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                클릭 시 실제 DB에 테스트 데이터가 생성됩니다.
              </p>
            </CardContent>
          </Card>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {mode === "create" ? "새 문서 생성" : "문서 편집"}
                <Badge variant="outline">
                  {mode === "create" ? "Create" : "Edit"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentForm
                key={mode} // Reset form when mode changes
                defaultValues={mode === "edit" ? existingDocument : undefined}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setSubmittedData(null);
                  setApiResult(null);
                }}
                isLoading={isLoading}
                mode={mode}
              />
            </CardContent>
          </Card>
        </div>

        {/* Result section */}
        <div className="space-y-4">
          {/* API Result */}
          {apiResult && (
            <Card
              className={
                apiResult.success
                  ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30"
                  : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30"
              }
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

          {/* Submitted data display */}
          <Card
            className={
              submittedData
                ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30"
                : ""
            }
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {submittedData && (
                    <Check className="h-5 w-5 text-green-600" />
                  )}
                  제출된 데이터
                </span>
                {submittedData && (
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    초기화
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {submittedData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        제목
                      </p>
                      <p className="font-medium">{submittedData.title}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        타입
                      </p>
                      <Badge variant="outline">{submittedData.type}</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        언어
                      </p>
                      <Badge variant="secondary">
                        {submittedData.lang.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        태그
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {submittedData.tags.length > 0 ? (
                          submittedData.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            없음
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {submittedData.summary && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        요약
                      </p>
                      <p className="text-sm">{submittedData.summary}</p>
                    </div>
                  )}

                  {/* Raw JSON */}
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Raw JSON
                    </p>
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-auto">
                      {JSON.stringify(submittedData, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  폼을 제출하면 여기에 데이터가 표시됩니다.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Feature list */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">🎯 구현된 기능</CardTitle>
            </CardHeader>
            <CardContent className="py-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium mb-1">입력 필드</p>
                  <ul className="text-muted-foreground text-xs space-y-0.5">
                    <li>• 제목 (필수, 최대 200자)</li>
                    <li>• 타입 선택 (api/general/tutorial)</li>
                    <li>• 언어 선택 (ko/en/ja)</li>
                    <li>• 요약 (선택, 최대 500자)</li>
                    <li>• 태그 (멀티 입력)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-1">API 연동</p>
                  <ul className="text-muted-foreground text-xs space-y-0.5">
                    <li>• 실제 DB에 문서 생성</li>
                    <li>• 테스트 데이터 생성</li>
                    <li>• 에러 핸들링</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-1">태그 입력</p>
                  <ul className="text-muted-foreground text-xs space-y-0.5">
                    <li>• Enter 키로 추가</li>
                    <li>• X 버튼으로 삭제</li>
                    <li>• 중복 방지</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-1">기타</p>
                  <ul className="text-muted-foreground text-xs space-y-0.5">
                    <li>• 생성/편집 모드 지원</li>
                    <li>• 로딩 상태 표시</li>
                    <li>• onSubmit 콜백</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
