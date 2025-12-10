"use client";

import { useState } from "react";
import {
  ArrowLeft,
  FileText,
  BookOpen,
  GitBranch,
  Tag,
  Users,
  Activity,
  Plus,
  Upload,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { StatCard, StatCardGrid } from "@/components/dashboard/stat-card";
import {
  RecentDocuments,
  type RecentDocument,
} from "@/components/dashboard/recent-documents";
import {
  QuickActions,
  QuickActionGrid,
  type QuickAction,
} from "@/components/dashboard/quick-actions";

// Mock data
const mockStats = [
  {
    title: "전체 문서",
    value: 128,
    icon: FileText,
    trend: 12,
    trendLabel: "지난 주 대비",
  },
  {
    title: "전체 용어",
    value: 456,
    icon: BookOpen,
    trend: 8,
    trendLabel: "지난 주 대비",
  },
  {
    title: "버전",
    value: 5,
    icon: GitBranch,
    trend: 0,
    trendLabel: "변동 없음",
  },
  {
    title: "태그",
    value: 32,
    icon: Tag,
    trend: -3,
    trendLabel: "지난 주 대비",
  },
];

const mockRecentDocuments: RecentDocument[] = [
  {
    id: "1",
    title: "REST API 인증 가이드",
    type: "api",
    lang: "ko",
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    author: "홍길동",
  },
  {
    id: "2",
    title: "시작하기 튜토리얼",
    type: "guide",
    lang: "ko",
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    author: "김철수",
  },
  {
    id: "3",
    title: "API 레퍼런스 v2.0",
    type: "reference",
    lang: "ko",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    author: "이영희",
  },
  {
    id: "4",
    title: "2024년 12월 변경 이력",
    type: "changelog",
    lang: "ko",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    author: "박지민",
  },
  {
    id: "5",
    title: "GraphQL 스키마 설명",
    type: "api",
    lang: "en",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    author: "John Doe",
  },
];

const mockQuickActions: QuickAction[] = [
  {
    id: "new-document",
    label: "새 문서",
    description: "새로운 문서를 작성합니다",
    icon: Plus,
    onClick: () => alert("새 문서 생성"),
    variant: "default",
  },
  {
    id: "import",
    label: "문서 가져오기",
    description: "파일에서 문서를 가져옵니다",
    icon: Upload,
    onClick: () => alert("문서 가져오기"),
    variant: "outline",
  },
  {
    id: "new-version",
    label: "새 버전",
    description: "새로운 버전을 생성합니다",
    icon: GitBranch,
    onClick: () => alert("새 버전 생성"),
    variant: "outline",
  },
  {
    id: "new-concept",
    label: "새 용어",
    description: "새로운 용어를 추가합니다",
    icon: BookOpen,
    onClick: () => alert("새 용어 추가"),
    variant: "outline",
  },
];

export default function DashboardPlayground() {
  const [isLoading, setIsLoading] = useState(false);
  const [showTrend, setShowTrend] = useState(true);

  const handleDocumentClick = (doc: RecentDocument) => {
    alert(`문서 클릭: ${doc.title}`);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Link href="/playground">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold">Dashboard Components</h1>
            <p className="text-sm text-muted-foreground">
              대시보드 위젯 컴포넌트 모음
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="loading">로딩 상태</Label>
            <Switch
              id="loading"
              checked={isLoading}
              onCheckedChange={setIsLoading}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto space-y-8">
        {/* Welcome Message */}
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">안녕하세요, 관리자님! 👋</CardTitle>
            <CardDescription>
              오늘의 문서 현황을 확인하고 작업을 시작하세요.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Stat Cards */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">통계 카드 (StatCard)</h2>
            <div className="flex items-center gap-2">
              <Label htmlFor="showTrend">트렌드 표시</Label>
              <Switch
                id="showTrend"
                checked={showTrend}
                onCheckedChange={setShowTrend}
              />
            </div>
          </div>
          <StatCardGrid columns={4}>
            {mockStats.map((stat, i) => (
              <StatCard
                key={i}
                title={stat.title}
                value={stat.value.toLocaleString()}
                icon={stat.icon}
                trend={showTrend ? stat.trend : undefined}
                trendLabel={showTrend ? stat.trendLabel : undefined}
                isLoading={isLoading}
                onClick={() => alert(`${stat.title} 클릭`)}
              />
            ))}
          </StatCardGrid>

          {/* Additional stat examples */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="활성 사용자"
              value="1,234"
              icon={Users}
              description="이번 달 활성 사용자 수"
              isLoading={isLoading}
            />
            <StatCard
              title="오늘의 조회수"
              value="5,678"
              icon={Activity}
              trend={25}
              trendLabel="어제 대비"
              isLoading={isLoading}
            />
            <StatCard
              title="평균 응답 시간"
              value="120ms"
              trend={-15}
              trendLabel="지난 주 대비 (개선)"
              isLoading={isLoading}
            />
          </div>
        </section>

        {/* Recent Documents */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">최근 문서 (RecentDocuments)</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentDocuments
              documents={mockRecentDocuments}
              isLoading={isLoading}
              onDocumentClick={handleDocumentClick}
            />
            <RecentDocuments
              documents={[]}
              title="빈 상태"
              isLoading={isLoading}
            />
          </div>
        </section>

        {/* Quick Actions */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">빠른 작업 (QuickActions)</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QuickActions actions={mockQuickActions} direction="horizontal" />
            <QuickActions
              actions={mockQuickActions}
              direction="vertical"
              title="세로 레이아웃"
            />
          </div>

          <h3 className="text-base font-medium mt-6">
            카드 그리드 (QuickActionGrid)
          </h3>
          <QuickActionGrid actions={mockQuickActions} columns={4} />
        </section>

        {/* Full Dashboard Preview */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">전체 대시보드 미리보기</h2>
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Welcome */}
              <Card className="bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-transparent border-none">
                <CardHeader className="pb-2">
                  <CardTitle>환영합니다! 🎉</CardTitle>
                  <CardDescription>
                    문서화 시스템에 오신 것을 환영합니다. 아래에서 빠르게 작업을
                    시작하세요.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Stats */}
              <StatCardGrid columns={4}>
                {mockStats.map((stat, i) => (
                  <StatCard
                    key={i}
                    title={stat.title}
                    value={stat.value.toLocaleString()}
                    icon={stat.icon}
                    trend={stat.trend}
                    trendLabel={stat.trendLabel}
                  />
                ))}
              </StatCardGrid>

              {/* Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <RecentDocuments
                    documents={mockRecentDocuments}
                    onDocumentClick={handleDocumentClick}
                  />
                </div>
                <div>
                  <QuickActions direction="vertical" />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Tips */}
      <div className="border-t p-4 bg-muted/30">
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <span className="font-medium">💡 Tips:</span>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>StatCard</strong>: 통계 데이터 표시, 트렌드 표시 지원
            </li>
            <li>
              <strong>RecentDocuments</strong>: 최근 수정된 문서 목록
            </li>
            <li>
              <strong>QuickActions</strong>: 빠른 작업 버튼/카드 그리드
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
