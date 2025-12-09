"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useHealth } from "@/lib/hooks";
import {
  mockDocuments,
  mockConcepts,
  mockVersions,
  mockNavigationTree,
} from "@/lib/mocks";

export default function ApiTestPlayground() {
  const [activeTab, setActiveTab] = useState<"health" | "mocks">("health");

  const { data: health, isLoading, error, refetch } = useHealth();

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
          <h1 className="text-2xl font-bold">API Test</h1>
          <p className="text-muted-foreground">
            API 연결 상태 확인 및 Mock 데이터 테스트
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
          variant={activeTab === "mocks" ? "default" : "outline"}
          onClick={() => setActiveTab("mocks")}
        >
          Mock Data
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

      {activeTab === "mocks" && (
        <div className="grid gap-6">
          {/* Mock Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Mock Documents ({mockDocuments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-muted rounded"
                  >
                    <div>
                      <div className="font-medium">{doc.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {doc.type} • {doc.lang}
                      </div>
                    </div>
                    <StatusBadge status={doc.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mock Concepts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Mock Concepts ({mockConcepts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockConcepts.map((concept) => (
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
                    <span className="text-xs px-2 py-1 bg-secondary rounded">
                      {concept.category}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mock Versions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Mock Versions ({mockVersions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockVersions.map((version) => (
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
                        {version.version}
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        version.is_public
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}
                    >
                      {version.is_public ? "Public" : "Private"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mock Navigation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mock Navigation Tree</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded text-xs overflow-auto max-h-64">
                {JSON.stringify(mockNavigationTree, null, 2)}
              </pre>
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
