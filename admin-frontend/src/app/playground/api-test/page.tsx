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
} from "lucide-react";
import Link from "next/link";
import { useHealth } from "@/lib/hooks";
import { documentsApi, conceptsApi, versionsApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/api/client";
import type { Document, Concept, Version } from "@/lib/types/api";

export default function ApiTestPlayground() {
  const [activeTab, setActiveTab] = useState<"health" | "data">("health");

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
    if (activeTab === "data") {
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
