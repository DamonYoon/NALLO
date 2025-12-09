"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Lightbulb, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConceptForm, ConceptFormValues } from "@/components/concepts/concept-form";
import {
  ImpactAnalysisPanel,
  ImpactDocument,
} from "@/components/concepts/impact-analysis";
import {
  ConceptRelations,
  ConceptRelation,
  ConceptSummary,
  RelationType,
} from "@/components/concepts/concept-relations";

// Mock data for impact analysis
const generateMockImpactDocuments = (term: string): ImpactDocument[] => {
  const docs: ImpactDocument[] = [
    {
      id: "doc-1",
      title: "시작 가이드",
      type: "tutorial",
      status: "published",
      lang: "ko",
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "doc-2",
      title: "API 레퍼런스",
      type: "api",
      status: "published",
      lang: "ko",
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "doc-3",
      title: "인증 가이드",
      type: "general",
      status: "in_review",
      lang: "ko",
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "doc-4",
      title: "에러 처리",
      type: "api",
      status: "draft",
      lang: "ko",
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "doc-5",
      title: "웹훅 설정",
      type: "tutorial",
      status: "done",
      lang: "ko",
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  // Filter based on term (simulated)
  if (term.length < 3) return [];
  return docs.slice(0, Math.min(docs.length, Math.floor(term.length / 2) + 1));
};

// Mock available concepts for relations
const mockAvailableConcepts: ConceptSummary[] = [
  { id: "c1", term: "API", lang: "ko" },
  { id: "c2", term: "인증", lang: "ko" },
  { id: "c3", term: "OAuth", lang: "ko" },
  { id: "c4", term: "토큰", lang: "ko" },
  { id: "c5", term: "REST API", lang: "ko" },
  { id: "c6", term: "Access Token", lang: "en" },
  { id: "c7", term: "Authentication", lang: "en" },
  { id: "c8", term: "Authorization", lang: "en" },
  { id: "c9", term: "접근 토큰", lang: "ko" },
  { id: "c10", term: "인증 시스템", lang: "ko" },
  { id: "c11", term: "보안", lang: "ko" },
  { id: "c12", term: "JWT", lang: "ko" },
  { id: "c13", term: "Bearer Token", lang: "en" },
];

// Mock initial relations for edit mode
const mockInitialRelations: ConceptRelation[] = [
  {
    id: "rel-1",
    targetId: "c1",
    targetTerm: "API",
    relationType: "SUBTYPE_OF",
  },
  {
    id: "rel-2",
    targetId: "c9",
    targetTerm: "접근 토큰",
    relationType: "SYNONYM_OF",
  },
];

export default function ConceptFormPlayground() {
  const [isLoading, setIsLoading] = useState(false);
  const [isImpactLoading, setIsImpactLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState<ConceptFormValues | null>(null);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [impactDocuments, setImpactDocuments] = useState<ImpactDocument[]>([]);
  const [currentTerm, setCurrentTerm] = useState("");
  const [currentLang, setCurrentLang] = useState("ko");
  
  // Relations state
  const [relations, setRelations] = useState<ConceptRelation[]>([]);

  // Mock existing concept for edit mode
  const existingConcept: Partial<ConceptFormValues> = {
    term: "API 키",
    description:
      "API 키는 애플리케이션이 API에 접근할 수 있도록 인증하는 고유한 식별자입니다. 각 API 키는 특정 권한과 사용 제한이 있으며, 보안을 위해 주기적으로 재발급해야 합니다.",
    lang: "ko",
  };

  const handleSubmit = async (values: ConceptFormValues) => {
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSubmittedData(values);
    setCurrentTerm(values.term);
    setCurrentLang(values.lang);
    setIsLoading(false);

    // Log relations that would be saved
    console.log("Submitted concept:", values);
    console.log("Relations to save:", relations);

    // Load impact analysis
    handleLoadImpact(values.term);
  };

  const handleLoadImpact = async (term: string) => {
    setIsImpactLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setImpactDocuments(generateMockImpactDocuments(term));
    setIsImpactLoading(false);
  };

  const handleReset = () => {
    setSubmittedData(null);
    setImpactDocuments([]);
    setCurrentTerm("");
    setRelations([]);
  };

  const handleDocumentClick = (doc: ImpactDocument) => {
    alert(`문서 클릭: ${doc.title} (ID: ${doc.id})`);
  };

  // Relation handlers
  const handleAddRelation = useCallback(
    (targetId: string, relationType: RelationType) => {
      const targetConcept = mockAvailableConcepts.find((c) => c.id === targetId);
      if (!targetConcept) return;

      const newRelation: ConceptRelation = {
        id: `rel-${Date.now()}`,
        targetId,
        targetTerm: targetConcept.term,
        relationType,
      };

      setRelations((prev) => [...prev, newRelation]);
      console.log(`Added relation: ${relationType} -> ${targetConcept.term}`);
    },
    []
  );

  const handleRemoveRelation = useCallback((relationId: string) => {
    setRelations((prev) => {
      const removed = prev.find((r) => r.id === relationId);
      console.log(`Removed relation: ${removed?.relationType} -> ${removed?.targetTerm}`);
      return prev.filter((r) => r.id !== relationId);
    });
  }, []);

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
            <h1 className="text-2xl font-bold">ConceptForm & Relations</h1>
            <p className="text-muted-foreground">
              용어 폼, 관계 설정, 영향도 분석 컴포넌트
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Left column - Form & Relations */}
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
                    handleReset();
                  }}
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  생성 모드
                </Button>
                <Button
                  variant={mode === "edit" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setMode("edit");
                    handleReset();
                    setCurrentTerm(existingConcept.term || "");
                    setCurrentLang(existingConcept.lang || "ko");
                    setRelations(mockInitialRelations);
                    handleLoadImpact(existingConcept.term || "");
                  }}
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  편집 모드
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {mode === "create" ? "새 용어 생성" : "용어 편집"}
                <Badge variant="outline">
                  {mode === "create" ? "Create" : "Edit"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ConceptForm
                key={mode}
                defaultValues={mode === "edit" ? existingConcept : undefined}
                onSubmit={handleSubmit}
                onCancel={handleReset}
                isLoading={isLoading}
                mode={mode}
              />
            </CardContent>
          </Card>

          {/* Relations */}
          <ConceptRelations
            conceptId={mode === "edit" ? "concept-123" : null}
            conceptLang={currentLang}
            relations={relations}
            availableConcepts={mockAvailableConcepts}
            onAddRelation={handleAddRelation}
            onRemoveRelation={handleRemoveRelation}
            disabled={isLoading}
          />
        </div>

        {/* Right column - Results & Impact */}
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
                        용어
                      </p>
                      <p className="font-medium">{submittedData.term}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        언어
                      </p>
                      <Badge variant="secondary">
                        {submittedData.lang.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      설명
                    </p>
                    <p className="text-sm">{submittedData.description}</p>
                  </div>
                  {relations.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        설정된 관계 ({relations.length})
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {relations.map((rel) => (
                          <Badge
                            key={rel.id}
                            variant={
                              rel.relationType === "SUBTYPE_OF"
                                ? "default"
                                : rel.relationType === "SYNONYM_OF"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="text-xs"
                          >
                            {rel.relationType === "SUBTYPE_OF" && "↑"}
                            {rel.relationType === "SYNONYM_OF" && "≈"}
                            {rel.relationType === "PART_OF" && "⊂"}
                            {" "}{rel.targetTerm}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  폼을 제출하면 여기에 데이터가 표시됩니다.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Impact Analysis Panel */}
          <ImpactAnalysisPanel
            conceptTerm={currentTerm || undefined}
            documents={impactDocuments}
            loading={isImpactLoading}
            onRefresh={() => handleLoadImpact(currentTerm)}
            onDocumentClick={handleDocumentClick}
          />

          {/* Feature list */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">🎯 구현된 기능</CardTitle>
            </CardHeader>
            <CardContent className="py-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium mb-1">ConceptForm</p>
                  <ul className="text-muted-foreground text-xs space-y-0.5">
                    <li>• 용어 (필수, 최대 100자)</li>
                    <li>• 설명 (필수, 최대 2000자)</li>
                    <li>• 언어 선택 (ko/en/ja)</li>
                    <li>• Zod 유효성 검사</li>
                    <li>• 생성/편집 모드</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-1">ConceptRelations</p>
                  <ul className="text-muted-foreground text-xs space-y-0.5">
                    <li>• 상위 개념 (SUBTYPE_OF)</li>
                    <li>• 동의어 (SYNONYM_OF)</li>
                    <li>• 부분-전체 (PART_OF)</li>
                    <li>• 검색 및 추가</li>
                    <li>• 관계 삭제</li>
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
