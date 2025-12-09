'use client';

import {
  FileText,
  Link2,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const recentDocuments = [
  {
    title: 'Using Nodit with AI & LLM Tools',
    editor: 'Bailey',
    time: '2시간 전',
    status: 'In Review',
    version: 'v2.1.0',
  },
  {
    title: 'arbitrum-eth_blocknumber',
    editor: 'Damon',
    time: '5시간 전',
    status: 'Publish',
    version: 'v1.3.2',
  },
  {
    title: 'Polygon Quickstart',
    editor: 'Jonny',
    time: '1일 전',
    status: 'Draft',
    version: 'v0.8.1',
  },
  {
    title: 'Webhook Security & Reliability',
    editor: 'Ben',
    time: '2025.12.04',
    status: 'Done',
    version: 'v1.3.5',
  },
];

const aiTasks = [
  {
    title: '용어 연결 필요',
    description: '"Elastic Node" 문서에 용어 연결이 필요할 수 있습니다',
    icon: Link2,
  },
  {
    title: '중복 가능성 감지',
    description: '"시작하기"와 "개요" 문서 간 유사한 내용 발견',
    icon: FileText,
  },
  {
    title: '용어집 불일치',
    description: '"API 엔드포인트" 용어가 4개 문서에서 일관되지 않게 사용됨',
    icon: AlertTriangle,
  },
];

const healthMetrics = [
  { label: '고립된 문서', value: 3, status: 'warning', icon: FileText },
  { label: '깨진 링크', value: 5, status: 'error', icon: Link2 },
  { label: '오래된 문서', value: 8, status: 'warning', icon: Clock },
  { label: '용어집 불일치', value: 2, status: 'success', icon: CheckCircle },
];

const statusColors = {
  Draft: { bg: 'bg-gray-100', text: 'text-gray-600' },
  'In Review': { bg: 'bg-amber-100', text: 'text-amber-700' },
  Done: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  Publish: { bg: 'bg-blue-100', text: 'text-blue-700' },
};

const metricColors = {
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
};

interface DashboardProps {
  onViewDocuments?: () => void;
  onCreateDocument?: () => void;
}

export function Dashboard({ onViewDocuments, onCreateDocument }: DashboardProps) {
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
        <Button
          onClick={onCreateDocument}
          className="bg-brand hover:bg-brand-dark text-white"
        >
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
              {recentDocuments.map((doc, idx) => {
                const colors =
                  statusColors[doc.status as keyof typeof statusColors];
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-foreground">{doc.title}</p>
                      <Badge
                        variant="secondary"
                        className={`${colors.bg} ${colors.text} text-[11px]`}
                      >
                        {doc.status}
                      </Badge>
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
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Ontology Insights */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">문서 운영 인사이트</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              온톨로지 기반 문서 구조 분석
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-6">
              <Badge className="bg-brand text-white hover:bg-brand-dark">
                문서 연결성 지수
              </Badge>
              <Badge variant="outline">용어 종속도 인덱스</Badge>
              <Badge variant="outline">문서 중복도</Badge>
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
                    stroke="#f3f4f6"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#fc8658"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${82 * 2.51} ${100 * 2.51}`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-semibold text-foreground">
                    82
                  </span>
                  <span className="text-sm text-muted-foreground">/ 100</span>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">핵심 허브 문서</p>
                <p className="text-2xl font-semibold mt-1">12</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">평균 연결 밀도</p>
                <p className="text-2xl font-semibold mt-1">4.8</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">클러스터 수</p>
                <p className="text-2xl font-semibold mt-1">5개</p>
              </div>
            </div>
          </CardContent>
        </Card>

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
              {aiTasks.map((task, idx) => {
                const Icon = task.icon;
                return (
                  <div
                    key={idx}
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
              {healthMetrics.map((metric, idx) => {
                const Icon = metric.icon;
                const color =
                  metricColors[metric.status as keyof typeof metricColors];
                return (
                  <div
                    key={idx}
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

