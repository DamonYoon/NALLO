"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, FileText, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DocumentForm,
  DocumentFormValues,
} from "@/components/documents/document-form";

export default function DocumentFormPlayground() {
  const [isLoading, setIsLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState<DocumentFormValues | null>(
    null
  );
  const [mode, setMode] = useState<"create" | "edit">("create");

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

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSubmittedData(values);
    setIsLoading(false);
  };

  const handleReset = () => {
    setSubmittedData(null);
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
              문서 기본 정보 입력 폼 (제목, 타입, 언어, 태그)
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
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  편집 모드
                </Button>
              </div>
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
                onCancel={() => setSubmittedData(null)}
                isLoading={isLoading}
                mode={mode}
              />
            </CardContent>
          </Card>
        </div>

        {/* Result section */}
        <div className="space-y-4">
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
                            <Badge key={tag} variant="secondary" className="text-xs">
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
                  <p className="font-medium mb-1">유효성 검사</p>
                  <ul className="text-muted-foreground text-xs space-y-0.5">
                    <li>• Zod 스키마 기반 검증</li>
                    <li>• 실시간 에러 메시지</li>
                    <li>• 필수 필드 표시</li>
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

