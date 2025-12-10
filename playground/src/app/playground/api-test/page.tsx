"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Loader2,
  Trash2,
  RefreshCw,
  Database,
  AlertTriangle,
  FileText,
  BookOpen,
  Tag,
  Sparkles,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useHealth } from "@/lib/hooks";
import { documentsApi, conceptsApi, versionsApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/api/client";
import type { Document, Concept, Version } from "@/lib/types/api";
import {
  SEED_VERSIONS,
  SEED_CONCEPTS,
  SEED_DOCUMENTS,
  SEED_DATA_SUMMARY,
} from "@/lib/seed-data";

export default function ApiTestPlayground() {
  const [activeTab, setActiveTab] = useState<"health" | "data" | "seed">(
    "health"
  );

  const { data: health, isLoading, error, refetch } = useHealth();

  // Data state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [deleteResult, setDeleteResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Seed state
  const [isSeedingVersions, setIsSeedingVersions] = useState(false);
  const [isSeedingConcepts, setIsSeedingConcepts] = useState(false);
  const [isSeedingDocuments, setIsSeedingDocuments] = useState(false);
  const [isSeedingAll, setIsSeedingAll] = useState(false);
  const [seedResult, setSeedResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Load all data
  const loadAllData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [docsRes, conceptsRes, versionsRes] = await Promise.all([
        documentsApi.list({ limit: 100 }),
        conceptsApi.list({ limit: 100 }),
        versionsApi.list(),
      ]);
      setDocuments(docsRes.items || []);
      setConcepts(conceptsRes.items || []);
      // Handle both array and object response
      const versionItems = Array.isArray(versionsRes)
        ? versionsRes
        : versionsRes.items;
      setVersions(versionItems || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "data" || activeTab === "seed") {
      loadAllData();
    }
  }, [activeTab, loadAllData]);

  // Delete all documents
  const handleDeleteAllDocuments = async () => {
    if (
      !confirm(
        `정말 모든 문서 ${documents.length}개를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`
      )
    ) {
      return;
    }

    setDeleteResult(null);
    let deleted = 0;
    let failed = 0;

    for (const doc of documents) {
      try {
        await documentsApi.delete(doc.id);
        deleted++;
      } catch (error) {
        console.error(`Failed to delete document ${doc.id}:`, error);
        failed++;
      }
    }

    setDeleteResult({
      success: failed === 0,
      message:
        failed === 0
          ? `${deleted}개의 문서가 삭제되었습니다.`
          : `${deleted}개 삭제 완료, ${failed}개 삭제 실패`,
    });

    loadAllData();
  };

  // Delete all concepts
  const handleDeleteAllConcepts = async () => {
    if (
      !confirm(
        `정말 모든 용어 ${concepts.length}개를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`
      )
    ) {
      return;
    }

    setDeleteResult(null);
    let deleted = 0;
    let failed = 0;

    for (const concept of concepts) {
      try {
        await conceptsApi.delete(concept.id);
        deleted++;
      } catch (error) {
        console.error(`Failed to delete concept ${concept.id}:`, error);
        failed++;
      }
    }

    setDeleteResult({
      success: failed === 0,
      message:
        failed === 0
          ? `${deleted}개의 용어가 삭제되었습니다.`
          : `${deleted}개 삭제 완료, ${failed}개 삭제 실패`,
    });

    loadAllData();
  };

  // Delete all versions
  const handleDeleteAllVersions = async () => {
    if (
      !confirm(
        `정말 모든 버전 ${versions.length}개를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`
      )
    ) {
      return;
    }

    setDeleteResult(null);
    let deleted = 0;
    let failed = 0;

    for (const version of versions) {
      try {
        await versionsApi.delete(version.id);
        deleted++;
      } catch (error) {
        console.error(`Failed to delete version ${version.id}:`, error);
        failed++;
      }
    }

    setDeleteResult({
      success: failed === 0,
      message:
        failed === 0
          ? `${deleted}개의 버전이 삭제되었습니다.`
          : `${deleted}개 삭제 완료, ${failed}개 삭제 실패`,
    });

    loadAllData();
  };

  // Delete all data
  const handleDeleteAllData = async () => {
    if (
      !confirm(
        `⚠️ 경고: 모든 데이터를 삭제합니다.\n\n- 문서: ${documents.length}개\n- 용어: ${concepts.length}개\n- 버전: ${versions.length}개\n\n정말 삭제하시겠습니까?`
      )
    ) {
      return;
    }

    setIsDeletingAll(true);
    setDeleteResult(null);

    let totalDeleted = 0;
    let totalFailed = 0;

    // Delete documents first
    for (const doc of documents) {
      try {
        await documentsApi.delete(doc.id);
        totalDeleted++;
      } catch (error) {
        console.error(`Failed to delete document ${doc.id}:`, error);
        totalFailed++;
      }
    }

    // Delete concepts
    for (const concept of concepts) {
      try {
        await conceptsApi.delete(concept.id);
        totalDeleted++;
      } catch (error) {
        console.error(`Failed to delete concept ${concept.id}:`, error);
        totalFailed++;
      }
    }

    // Delete versions
    for (const version of versions) {
      try {
        await versionsApi.delete(version.id);
        totalDeleted++;
      } catch (error) {
        console.error(`Failed to delete version ${version.id}:`, error);
        totalFailed++;
      }
    }

    setIsDeletingAll(false);
    setDeleteResult({
      success: totalFailed === 0,
      message:
        totalFailed === 0
          ? `모든 데이터 ${totalDeleted}개가 삭제되었습니다.`
          : `${totalDeleted}개 삭제 완료, ${totalFailed}개 삭제 실패`,
    });

    loadAllData();
  };

  // Seed Versions
  const handleSeedVersions = async () => {
    setIsSeedingVersions(true);
    setSeedResult(null);
    let created = 0;
    let failed = 0;

    for (const version of SEED_VERSIONS) {
      try {
        await versionsApi.create(version);
        created++;
      } catch (error) {
        console.error(`Failed to create version ${version.name}:`, error);
        failed++;
      }
    }

    setIsSeedingVersions(false);
    setSeedResult({
      success: failed === 0,
      message:
        failed === 0
          ? `버전 ${created}개가 생성되었습니다.`
          : `${created}개 생성, ${failed}개 실패`,
    });
    loadAllData();
  };

  // Seed Concepts
  const handleSeedConcepts = async () => {
    setIsSeedingConcepts(true);
    setSeedResult(null);
    let created = 0;
    let failed = 0;

    for (const concept of SEED_CONCEPTS) {
      try {
        await conceptsApi.create(concept);
        created++;
      } catch (error) {
        console.error(`Failed to create concept ${concept.term}:`, error);
        failed++;
      }
    }

    setIsSeedingConcepts(false);
    setSeedResult({
      success: failed === 0,
      message:
        failed === 0
          ? `용어 ${created}개가 생성되었습니다.`
          : `${created}개 생성, ${failed}개 실패`,
    });
    loadAllData();
  };

  // Seed Documents
  const handleSeedDocuments = async () => {
    setIsSeedingDocuments(true);
    setSeedResult(null);
    let created = 0;
    let failed = 0;

    for (const doc of SEED_DOCUMENTS) {
      try {
        await documentsApi.create(doc);
        created++;
      } catch (error) {
        console.error(`Failed to create document ${doc.title}:`, error);
        failed++;
      }
    }

    setIsSeedingDocuments(false);
    setSeedResult({
      success: failed === 0,
      message:
        failed === 0
          ? `문서 ${created}개가 생성되었습니다.`
          : `${created}개 생성, ${failed}개 실패`,
    });
    loadAllData();
  };

  // Seed All Data
  const handleSeedAll = async () => {
    if (
      !confirm(
        `GraphDB에 테스트 데이터를 생성합니다.\n\n- 버전: ${SEED_DATA_SUMMARY.versions}개\n- 용어: ${SEED_DATA_SUMMARY.concepts}개\n- 문서: ${SEED_DATA_SUMMARY.documents}개\n\n진행하시겠습니까?`
      )
    ) {
      return;
    }

    setIsSeedingAll(true);
    setSeedResult(null);
    let totalCreated = 0;
    let totalFailed = 0;

    // Create Versions first
    for (const version of SEED_VERSIONS) {
      try {
        await versionsApi.create(version);
        totalCreated++;
      } catch (error) {
        console.error(`Failed to create version ${version.name}:`, error);
        totalFailed++;
      }
    }

    // Create Concepts
    for (const concept of SEED_CONCEPTS) {
      try {
        await conceptsApi.create(concept);
        totalCreated++;
      } catch (error) {
        console.error(`Failed to create concept ${concept.term}:`, error);
        totalFailed++;
      }
    }

    // Create Documents
    for (const doc of SEED_DOCUMENTS) {
      try {
        await documentsApi.create(doc);
        totalCreated++;
      } catch (error) {
        console.error(`Failed to create document ${doc.title}:`, error);
        totalFailed++;
      }
    }

    setIsSeedingAll(false);
    setSeedResult({
      success: totalFailed === 0,
      message:
        totalFailed === 0
          ? `총 ${totalCreated}개의 데이터가 생성되었습니다.`
          : `${totalCreated}개 생성, ${totalFailed}개 실패`,
    });
    loadAllData();
  };

  // Delete single item
  const handleDeleteDocument = async (doc: Document) => {
    try {
      await documentsApi.delete(doc.id);
      setDeleteResult({
        success: true,
        message: `문서 "${doc.title}"이(가) 삭제되었습니다.`,
      });
      loadAllData();
    } catch (error) {
      setDeleteResult({
        success: false,
        message: getErrorMessage(error),
      });
    }
  };

  const handleDeleteConcept = async (concept: Concept) => {
    try {
      await conceptsApi.delete(concept.id);
      setDeleteResult({
        success: true,
        message: `용어 "${concept.term}"이(가) 삭제되었습니다.`,
      });
      loadAllData();
    } catch (error) {
      setDeleteResult({
        success: false,
        message: getErrorMessage(error),
      });
    }
  };

  const handleDeleteVersion = async (version: Version) => {
    try {
      await versionsApi.delete(version.id);
      setDeleteResult({
        success: true,
        message: `버전 "${version.name}"이(가) 삭제되었습니다.`,
      });
      loadAllData();
    } catch (error) {
      setDeleteResult({
        success: false,
        message: getErrorMessage(error),
      });
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/playground">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">API Test & Data Management</h1>
          <p className="text-muted-foreground">
            API 연결 상태 확인 및 데이터 관리
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === "health" ? "default" : "outline"}
          onClick={() => setActiveTab("health")}
        >
          Health Check
        </Button>
        <Button
          variant={activeTab === "data" ? "default" : "outline"}
          onClick={() => setActiveTab("data")}
        >
          <Database className="h-4 w-4 mr-2" />
          Data Management
        </Button>
        <Button
          variant={activeTab === "seed" ? "default" : "outline"}
          onClick={() => setActiveTab("seed")}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Seed Data
        </Button>
      </div>

      {activeTab === "health" && (
        <div className="grid gap-6">
          {/* Health Check Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Backend Health</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking connection...
                </div>
              ) : error ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-destructive">
                    <XCircle className="h-5 w-5" />
                    <span className="font-medium">Connection Failed</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Backend 서버에 연결할 수 없습니다. Backend가 실행 중인지
                    확인하세요.
                  </p>
                  <pre className="bg-muted p-3 rounded text-xs overflow-auto">
                    URL:{" "}
                    {process.env.NEXT_PUBLIC_API_URL ||
                      "http://localhost:8000/api/v1"}
                  </pre>
                </div>
              ) : health ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Connected</span>
                  </div>

                  <div className="grid gap-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded">
                      <span>Overall Status</span>
                      <StatusBadge status={health.status} />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded">
                      <span>GraphDB (Neo4j)</span>
                      <StatusBadge status={health.graphdb.status} />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded">
                      <span>PostgreSQL</span>
                      <StatusBadge status={health.postgresql.status} />
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* API Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">API Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span className="text-muted-foreground">Base URL</span>
                  <code>
                    {process.env.NEXT_PUBLIC_API_URL ||
                      "http://localhost:8000/api/v1"}
                  </code>
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span className="text-muted-foreground">Timeout</span>
                  <code>10000ms</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "data" && (
        <div className="grid gap-6">
          {/* Delete Result */}
          {deleteResult && (
            <Card
              className={
                deleteResult.success
                  ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30"
                  : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30"
              }
            >
              <CardContent className="py-3">
                <div className="flex items-center gap-2">
                  {deleteResult.success ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span
                    className={
                      deleteResult.success
                        ? "text-green-700 dark:text-green-300"
                        : "text-red-700 dark:text-red-300"
                    }
                  >
                    {deleteResult.message}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Danger Zone - Delete All */}
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                DB 초기화 (Danger Zone)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                테스트 데이터를 모두 삭제합니다. 이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteAllData}
                  disabled={
                    isDeletingAll ||
                    (documents.length === 0 &&
                      concepts.length === 0 &&
                      versions.length === 0)
                  }
                >
                  {isDeletingAll ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  모든 데이터 삭제 (
                  {documents.length + concepts.length + versions.length}개)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="py-3">
                <div className="text-3xl font-bold">{documents.length}</div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={handleDeleteAllDocuments}
                  disabled={documents.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  모두 삭제
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Concepts
                </CardTitle>
              </CardHeader>
              <CardContent className="py-3">
                <div className="text-3xl font-bold">{concepts.length}</div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={handleDeleteAllConcepts}
                  disabled={concepts.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  모두 삭제
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Versions
                </CardTitle>
              </CardHeader>
              <CardContent className="py-3">
                <div className="text-3xl font-bold">{versions.length}</div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={handleDeleteAllVersions}
                  disabled={versions.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  모두 삭제
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Documents List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                Documents ({documents.length})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={loadAllData}
                disabled={isLoadingData}
              >
                {isLoadingData ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                새로고침
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : documents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  문서가 없습니다.
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-muted rounded"
                    >
                      <div>
                        <div className="font-medium">{doc.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {doc.type} • {doc.lang} • {doc.status}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDocument(doc)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Concepts List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Concepts ({concepts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : concepts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  용어가 없습니다.
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {concepts.map((concept) => (
                    <div
                      key={concept.id}
                      className="flex items-center justify-between p-3 bg-muted rounded"
                    >
                      <div>
                        <div className="font-medium">{concept.term}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {concept.description}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteConcept(concept)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Versions List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Versions ({versions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : versions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  버전이 없습니다.
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {versions.map((version) => (
                    <div
                      key={version.id}
                      className="flex items-center justify-between p-3 bg-muted rounded"
                    >
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {version.name}
                          {version.is_main && (
                            <span className="text-xs px-2 py-0.5 bg-primary text-primary-foreground rounded">
                              Main
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {version.version} •{" "}
                          {version.is_public ? "Public" : "Private"}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteVersion(version)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "seed" && (
        <div className="grid gap-6">
          {/* Seed Result */}
          {seedResult && (
            <Card
              className={
                seedResult.success
                  ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30"
                  : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30"
              }
            >
              <CardContent className="py-3">
                <div className="flex items-center gap-2">
                  {seedResult.success ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span
                    className={
                      seedResult.success
                        ? "text-green-700 dark:text-green-300"
                        : "text-red-700 dark:text-red-300"
                    }
                  >
                    {seedResult.message}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seed All */}
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                GraphDB Dummy Data 생성
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                테스트를 위한 샘플 데이터를 GraphDB에 생성합니다. 버전, 용어,
                문서가 함께 생성됩니다.
              </p>
              <div className="p-4 bg-muted rounded-lg mb-4">
                <h4 className="font-medium mb-2">생성될 데이터:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>
                    • 버전 (Versions): {SEED_DATA_SUMMARY.versions}개 - Initial
                    Release, Feature Update, Beta
                  </li>
                  <li>
                    • 용어 (Concepts): {SEED_DATA_SUMMARY.concepts}개 - GraphDB,
                    Neo4j, JWT, CRUD 등
                  </li>
                  <li>
                    • 문서 (Documents): {SEED_DATA_SUMMARY.documents}개 - API
                    가이드, 튜토리얼, 아키텍처 문서 등
                  </li>
                </ul>
              </div>
              <Button onClick={handleSeedAll} disabled={isSeedingAll}>
                {isSeedingAll ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                모든 데이터 생성 (
                {SEED_DATA_SUMMARY.versions +
                  SEED_DATA_SUMMARY.concepts +
                  SEED_DATA_SUMMARY.documents}
                개)
              </Button>
            </CardContent>
          </Card>

          {/* Individual Seed Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Versions */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Versions
                </CardTitle>
              </CardHeader>
              <CardContent className="py-3">
                <div className="text-3xl font-bold mb-2">
                  {SEED_DATA_SUMMARY.versions}
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Initial Release, Feature Update, Beta Release
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleSeedVersions}
                  disabled={isSeedingVersions || isSeedingAll}
                >
                  {isSeedingVersions ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  버전 생성
                </Button>
              </CardContent>
            </Card>

            {/* Concepts */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Concepts
                </CardTitle>
              </CardHeader>
              <CardContent className="py-3">
                <div className="text-3xl font-bold mb-2">
                  {SEED_DATA_SUMMARY.concepts}
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  GraphDB, Neo4j, JWT, CRUD, REST API 등
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleSeedConcepts}
                  disabled={isSeedingConcepts || isSeedingAll}
                >
                  {isSeedingConcepts ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  용어 생성
                </Button>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="py-3">
                <div className="text-3xl font-bold mb-2">
                  {SEED_DATA_SUMMARY.documents}
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  API 가이드, 튜토리얼, 아키텍처 문서 등
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleSeedDocuments}
                  disabled={isSeedingDocuments || isSeedingAll}
                >
                  {isSeedingDocuments ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  문서 생성
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Seed Data Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Seed Data 미리보기</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Versions Preview */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Versions ({SEED_VERSIONS.length})
                  </h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {SEED_VERSIONS.map((v, i) => (
                      <div
                        key={i}
                        className="text-sm p-2 bg-muted rounded flex items-center justify-between"
                      >
                        <span>
                          {v.name} ({v.version})
                        </span>
                        <div className="flex gap-1">
                          {v.is_main && (
                            <span className="text-xs px-1.5 py-0.5 bg-primary text-primary-foreground rounded">
                              Main
                            </span>
                          )}
                          {v.is_public ? (
                            <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                              Public
                            </span>
                          ) : (
                            <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded">
                              Private
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Concepts Preview */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Concepts ({SEED_CONCEPTS.length})
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {SEED_CONCEPTS.map((c, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 bg-muted rounded"
                        title={c.description}
                      >
                        {c.term}
                        {c.category && (
                          <span className="text-muted-foreground ml-1">
                            ({c.category})
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Documents Preview */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Documents ({SEED_DOCUMENTS.length})
                  </h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {SEED_DOCUMENTS.map((d, i) => (
                      <div
                        key={i}
                        className="text-sm p-2 bg-muted rounded flex items-center justify-between"
                      >
                        <span>{d.title}</span>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded ${
                            d.type === "api"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : d.type === "tutorial"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                          }`}
                        >
                          {d.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Data Status */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">현재 DB 상태</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={loadAllData}
                disabled={isLoadingData}
              >
                {isLoadingData ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                새로고침
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded">
                  <div className="text-2xl font-bold">{versions.length}</div>
                  <div className="text-sm text-muted-foreground">Versions</div>
                </div>
                <div className="text-center p-4 bg-muted rounded">
                  <div className="text-2xl font-bold">{concepts.length}</div>
                  <div className="text-sm text-muted-foreground">Concepts</div>
                </div>
                <div className="text-center p-4 bg-muted rounded">
                  <div className="text-2xl font-bold">{documents.length}</div>
                  <div className="text-sm text-muted-foreground">Documents</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isPositive =
    status === "healthy" ||
    status === "connected" ||
    status === "publish" ||
    status === "done";
  const isWarning = status === "in_review" || status === "draft";

  return (
    <span
      className={`text-xs px-2 py-1 rounded ${
        isPositive
          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          : isWarning
          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      }`}
    >
      {status}
    </span>
  );
}
