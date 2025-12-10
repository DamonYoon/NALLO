'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge, type DocumentStatus } from '@/components/ui/status-badge';
import {
  mockRecentDocuments,
  mockAITasks,
  mockHealthMetrics,
  mockOntologyInsight,
  type RecentDocument,
  type AITask,
  type HealthMetric,
  type OntologyInsight,
  type MetricStatus,
} from '@/lib/mocks/dashboard';

/* ============================================
   Status Color Mapping (using CSS variables)
   ============================================ */

const METRIC_STATUS_COLORS: Record<MetricStatus, string> = {
  success: 'var(--success)',
  warning: 'var(--warning)',
  error: 'var(--error)',
};

/* ============================================
   Props
   ============================================ */

interface DashboardProps {
  recentDocuments?: RecentDocument[];
  aiTasks?: AITask[];
  healthMetrics?: HealthMetric[];
  ontologyInsight?: OntologyInsight;
  onViewDocuments?: () => void;
  onCreateDocument?: () => void;
  onViewDocument?: (docId: string) => void;
  onReviewTask?: (taskId: string) => void;
}

/* ============================================
   Component
   ============================================ */

export function Dashboard({
  recentDocuments = mockRecentDocuments,
  aiTasks = mockAITasks,
  healthMetrics = mockHealthMetrics,
  ontologyInsight = mockOntologyInsight,
  onViewDocuments,
  onCreateDocument,
  onViewDocument,
  onReviewTask,
}: DashboardProps) {
  return (
    <div className="px-6 py-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-foreground">문서 대시보드</h1>
          <p className="text-sm text-muted-foreground mt-1">
            문서 작업 현황을 한눈에 확인하세요
          </p>
        </div>
        <Button variant="brand" onClick={onCreateDocument}>
          <Plus size={16} className="mr-1.5" />
          문서 생성
        </Button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">최근 활동</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                최근 수정되거나 생성된 문서
              </p>
            </div>
            <button
              onClick={onViewDocuments}
              className="text-xs text-brand hover:underline"
            >
              전체 보기
            </button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentDocuments.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => onViewDocument?.(doc.id)}
                  className="p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-foreground">{doc.title}</p>
                    <StatusBadge status={doc.status as DocumentStatus} />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {doc.editor}
                      </span>
                      <span className="text-border">•</span>
                      <span className="text-xs text-muted-foreground">
                        {doc.time}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {doc.version}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ontology Insights */}
        <OntologyInsightsCard insight={ontologyInsight} />

        {/* AI Suggested Tasks */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">AI 추천 작업</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              AI가 분석한 개선 제안 사항
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiTasks.map((task) => {
                const Icon = task.icon;
                return (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-lg bg-muted/50 border border-border/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <Icon
                          size={16}
                          className="text-muted-foreground mt-0.5 flex-shrink-0"
                        />
                        <div>
                          <p className="text-sm text-foreground">{task.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {task.description}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 hover:bg-brand hover:text-white hover:border-brand"
                        onClick={() => onReviewTask?.(task.id)}
                      >
                        검토하기
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Documentation Health */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">문서 상태 요약</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                전체 문서 건강도 지표
              </p>
            </div>
            <button className="text-xs text-brand hover:underline">
              전체 리포트 받기
            </button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {healthMetrics.map((metric) => {
                const Icon = metric.icon;
                const color = METRIC_STATUS_COLORS[metric.status];
                return (
                  <div
                    key={metric.id}
                    className="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={16} style={{ color }} />
                      <p className="text-xs text-muted-foreground">
                        {metric.label}
                      </p>
                    </div>
                    <p className="text-[28px] font-medium" style={{ color }}>
                      {metric.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ============================================
   Ontology Insights Subcomponent
   ============================================ */

function OntologyInsightsCard({ insight }: { insight: OntologyInsight }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">문서 운영 인사이트</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          온톨로지 기반 문서 구조 분석
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-6">
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-brand text-white">
            문서 연결성 지수
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium border border-border text-muted-foreground">
            용어 종속도 인덱스
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium border border-border text-muted-foreground">
            문서 중복도
          </span>
        </div>

        {/* Circular Progress */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                className="stroke-border"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                className="stroke-brand"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${insight.connectivityScore * 2.51} ${100 * 2.51}`}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-semibold text-foreground">
                {insight.connectivityScore}
              </span>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">핵심 허브 문서</p>
            <p className="text-2xl font-semibold mt-1">{insight.hubDocuments}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">평균 연결 밀도</p>
            <p className="text-2xl font-semibold mt-1">{insight.averageDensity}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">클러스터 수</p>
            <p className="text-2xl font-semibold mt-1">{insight.clusterCount}개</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
