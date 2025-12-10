"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Trash2,
  Plus,
  FileText,
  Link2,
  AlertTriangle,
  Clock,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { SearchInput } from "@/components/shared/search-input";
import {
  ConfirmDialog,
  useConfirmDialog,
} from "@/components/shared/confirm-dialog";
import {
  EmptyState,
  NoDataState,
  NoResultsState,
  ErrorState,
} from "@/components/shared/empty-state";
import {
  FileUploader,
  type UploadedFile,
} from "@/components/shared/file-uploader";
import {
  StatusBadge,
  type StatusBadgeStatus,
} from "@/components/shared/status-badge";
import { PageHeader, PageContainer } from "@/components/shared/page-header";
import { SectionHeader, SectionCard } from "@/components/shared/section-header";
import {
  CircularProgress,
  ScoreCircle,
} from "@/components/shared/circular-progress";
import {
  MetricCard,
  MetricCardGrid,
  StatItem,
  StatRow,
} from "@/components/shared/metric-card";
import { ActionListItem, ActionList } from "@/components/shared/action-list-item";
import {
  ProgressSteps,
  ProgressIndicator,
  type Step,
} from "@/components/shared/progress-steps";

export default function SharedComponentsPlayground() {
  // SearchInput state
  const [searchValue, setSearchValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  // ConfirmDialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { confirm, ConfirmDialog: ProgrammaticDialog } = useConfirmDialog();

  // FileUploader state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // ProgressSteps state
  const [progressSteps, setProgressSteps] = useState<Step[]>([
    { id: "1", label: "문서 저장", status: "complete" },
    { id: "2", label: "키워드 추출", status: "processing", info: "3/5" },
    { id: "3", label: "노드 생성", status: "pending" },
    { id: "4", label: "관계 연결", status: "pending" },
  ]);

  // Handlers
  const handleSearch = (value: string) => {
    setDebouncedValue(value);
    if (value) {
      setIsSearchLoading(true);
      setTimeout(() => setIsSearchLoading(false), 500);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsDeleting(false);
    console.log("Deleted!");
  };

  const handleProgrammaticConfirm = async () => {
    const confirmed = await confirm({
      title: "작업을 진행하시겠습니까?",
      description: "이 작업은 되돌릴 수 없습니다.",
      variant: "warning",
      confirmText: "진행",
    });
    console.log("Programmatic confirm result:", confirmed);
  };

  const handleFilesSelected = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map((file) => ({
      id: `file-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      status: "pending" as const,
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);

    // Simulate upload
    newFiles.forEach((file) => {
      setTimeout(() => {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? { ...f, status: "uploading" as const, progress: 0 }
              : f
          )
        );
      }, 100);

      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? {
                  ...f,
                  progress,
                  status:
                    progress >= 100
                      ? ("success" as const)
                      : ("uploading" as const),
                }
              : f
          )
        );
        if (progress >= 100) clearInterval(interval);
      }, 200);
    });
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const simulateProgress = () => {
    setProgressSteps([
      { id: "1", label: "문서 저장", status: "complete" },
      { id: "2", label: "키워드 추출", status: "processing", info: "3/5" },
      { id: "3", label: "노드 생성", status: "pending" },
      { id: "4", label: "관계 연결", status: "pending" },
    ]);

    const timers = [
      setTimeout(() => {
        setProgressSteps((prev) =>
          prev.map((s) =>
            s.id === "2" ? { ...s, status: "complete", info: undefined } : s
          )
        );
      }, 1000),
      setTimeout(() => {
        setProgressSteps((prev) =>
          prev.map((s) =>
            s.id === "3" ? { ...s, status: "processing" } : s
          )
        );
      }, 1200),
      setTimeout(() => {
        setProgressSteps((prev) =>
          prev.map((s) =>
            s.id === "3" ? { ...s, status: "complete" } : s
          )
        );
      }, 2200),
      setTimeout(() => {
        setProgressSteps((prev) =>
          prev.map((s) =>
            s.id === "4" ? { ...s, status: "processing" } : s
          )
        );
      }, 2400),
      setTimeout(() => {
        setProgressSteps((prev) =>
          prev.map((s) =>
            s.id === "4" ? { ...s, status: "complete" } : s
          )
        );
      }, 3400),
    ];

    return () => timers.forEach(clearTimeout);
  };

  const statusVariants: StatusBadgeStatus[] = [
    "draft",
    "in-review",
    "publish",
    "done",
    "error",
    "warning",
    "new",
    "existing",
  ];

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
            <h1 className="text-xl font-semibold">Shared Components</h1>
            <p className="text-sm text-muted-foreground">
              공통 유틸리티 컴포넌트 모음
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <Tabs defaultValue="status" className="space-y-6">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="status">StatusBadge</TabsTrigger>
            <TabsTrigger value="headers">Headers</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="actions">ActionList</TabsTrigger>
            <TabsTrigger value="search">SearchInput</TabsTrigger>
            <TabsTrigger value="confirm">ConfirmDialog</TabsTrigger>
            <TabsTrigger value="empty">EmptyState</TabsTrigger>
            <TabsTrigger value="upload">FileUploader</TabsTrigger>
          </TabsList>

          {/* StatusBadge */}
          <TabsContent value="status" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">StatusBadge</CardTitle>
                <CardDescription>
                  문서/작업 상태를 표시하는 배지 컴포넌트
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* All variants */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">모든 상태</label>
                  <div className="flex flex-wrap gap-2">
                    {statusVariants.map((status) => (
                      <StatusBadge key={status} status={status} />
                    ))}
                  </div>
                </div>

                {/* Sizes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">크기</label>
                  <div className="flex items-center gap-2">
                    <StatusBadge status="publish" size="sm" label="Small" />
                    <StatusBadge status="publish" size="default" label="Default" />
                    <StatusBadge status="publish" size="lg" label="Large" />
                  </div>
                </div>

                {/* Custom labels */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">커스텀 라벨</label>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status="draft" label="임시저장" />
                    <StatusBadge status="in-review" label="검토 중" />
                    <StatusBadge status="publish" label="배포됨" />
                    <StatusBadge status="done" label="완료" />
                  </div>
                </div>

                {/* Usage example */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">사용 예시</label>
                  <div className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Using Nodit with AI & LLM Tools</span>
                      <StatusBadge status="in-review" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">arbitrum-eth_blocknumber</span>
                      <StatusBadge status="publish" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Polygon Quickstart</span>
                      <StatusBadge status="draft" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Headers */}
          <TabsContent value="headers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">PageHeader</CardTitle>
                <CardDescription>
                  페이지 상단에 표시되는 헤더 컴포넌트
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border rounded-lg p-4 bg-accent/20">
                  <PageHeader
                    title="문서 대시보드"
                    description="문서 작업 현황을 한눈에 확인하세요"
                    actions={
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        문서 생성
                      </Button>
                    }
                  />
                </div>

                <div className="border rounded-lg p-4 bg-accent/20">
                  <PageHeader
                    title="문서 편집"
                    description="BNB Web3 Data API Quickstart"
                    onBack={() => console.log("Back clicked")}
                    icon={<FileText className="h-5 w-5" />}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">SectionHeader & SectionCard</CardTitle>
                <CardDescription>
                  섹션 구분을 위한 헤더 및 카드 컴포넌트
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border rounded-lg p-4 bg-accent/20">
                  <SectionHeader
                    title="최근 활동"
                    description="최근 수정되거나 생성된 문서"
                    onActionClick={() => console.log("View all")}
                  />
                </div>

                <SectionCard
                  title="AI 추천 작업"
                  description="AI가 분석한 개선 제안 사항"
                >
                  <div className="text-sm text-muted-foreground">
                    섹션 카드 내부 콘텐츠
                  </div>
                </SectionCard>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress */}
          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">CircularProgress</CardTitle>
                  <CardDescription>원형 진행률 차트</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-around">
                    <CircularProgress value={82} />
                    <CircularProgress value={45} size={100} progressColor="#10B981" />
                    <CircularProgress value={25} size={80} progressColor="#EF4444" />
                  </div>

                  <div className="flex items-center justify-around">
                    <ScoreCircle value={92} label="문서 건강도" />
                    <ScoreCircle value={65} label="연결 밀도" />
                    <ScoreCircle value={35} label="커버리지" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">ProgressSteps</CardTitle>
                  <CardDescription>진행 단계 표시</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ProgressSteps steps={progressSteps} />

                  <Button onClick={simulateProgress} variant="outline" size="sm">
                    시뮬레이션 재시작
                  </Button>

                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-2">개별 인디케이터</p>
                    <div className="space-y-2">
                      <ProgressIndicator status="complete" label="완료됨" />
                      <ProgressIndicator status="processing" label="진행 중" info="50%" />
                      <ProgressIndicator status="pending" label="대기 중" />
                      <ProgressIndicator status="error" label="오류 발생" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Metrics */}
          <TabsContent value="metrics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">MetricCard</CardTitle>
                <CardDescription>지표/통계 카드 컴포넌트</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <MetricCardGrid columns={4}>
                  <MetricCard
                    label="고립된 문서"
                    value={3}
                    icon={FileText}
                    status="warning"
                  />
                  <MetricCard
                    label="깨진 링크"
                    value={5}
                    icon={Link2}
                    status="error"
                    onClick={() => console.log("Navigate to broken links")}
                  />
                  <MetricCard
                    label="오래된 문서"
                    value={8}
                    icon={Clock}
                    status="warning"
                  />
                  <MetricCard
                    label="용어집 불일치"
                    value={2}
                    icon={CheckCircle}
                    status="success"
                  />
                </MetricCardGrid>

                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-4">StatItem & StatRow</p>
                  <div className="border rounded-lg p-4">
                    <StatRow>
                      <StatItem label="핵심 허브 문서" value={12} />
                      <StatItem label="평균 연결 밀도" value="4.8" />
                      <StatItem label="클러스터 수" value="5개" />
                    </StatRow>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ActionList */}
          <TabsContent value="actions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">ActionListItem</CardTitle>
                <CardDescription>AI 추천 작업 같은 액션 리스트 항목</CardDescription>
              </CardHeader>
              <CardContent>
                <ActionList>
                  <ActionListItem
                    icon={Link2}
                    title="용어 연결 필요"
                    description='"Elastic Node" 문서에 용어 연결이 필요할 수 있습니다'
                    actionLabel="검토하기"
                    onAction={() => console.log("Review terminology")}
                  />
                  <ActionListItem
                    icon={FileText}
                    title="중복 가능성 감지"
                    description='"시작하기"와 "개요" 문서 간 유사한 내용 발견'
                    actionLabel="비교하기"
                    onAction={() => console.log("Compare documents")}
                  />
                  <ActionListItem
                    icon={AlertTriangle}
                    title="용어집 불일치"
                    description='"API 엔드포인트" 용어가 4개 문서에서 일관되지 않게 사용됨'
                    action={
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          무시
                        </Button>
                        <Button size="sm">수정</Button>
                      </div>
                    }
                  />
                </ActionList>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SearchInput */}
          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">SearchInput</CardTitle>
                <CardDescription>
                  디바운스가 적용된 검색 입력 컴포넌트
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Default */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      기본 (300ms debounce)
                    </label>
                    <SearchInput
                      value={searchValue}
                      onChange={setSearchValue}
                      onSearch={handleSearch}
                      isLoading={isSearchLoading}
                    />
                    <div className="text-xs text-muted-foreground">
                      입력값: &quot;{searchValue}&quot;
                      <br />
                      디바운스 후: &quot;{debouncedValue}&quot;
                    </div>
                  </div>

                  {/* Sizes */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">사이즈</label>
                    <SearchInput size="sm" placeholder="Small" />
                    <SearchInput size="default" placeholder="Default" />
                    <SearchInput size="lg" placeholder="Large" />
                  </div>

                  {/* Disabled */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">비활성화</label>
                    <SearchInput disabled placeholder="검색할 수 없음" />
                  </div>

                  {/* No clear button */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">클리어 버튼 숨김</label>
                    <SearchInput showClear={false} defaultValue="초기값" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ConfirmDialog */}
          <TabsContent value="confirm" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">ConfirmDialog</CardTitle>
                <CardDescription>확인 다이얼로그 컴포넌트</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-4">
                  {/* Default */}
                  <ConfirmDialog
                    trigger={<Button variant="outline">기본 확인</Button>}
                    title="작업을 진행하시겠습니까?"
                    description="이 작업을 진행하면 변경사항이 저장됩니다."
                    onConfirm={() => console.log("Default confirmed")}
                  />

                  {/* Warning */}
                  <ConfirmDialog
                    trigger={
                      <Button variant="outline" className="text-yellow-600">
                        경고 확인
                      </Button>
                    }
                    title="주의가 필요합니다"
                    description="이 작업은 되돌리기 어려울 수 있습니다. 계속하시겠습니까?"
                    variant="warning"
                    confirmText="계속"
                    onConfirm={() => console.log("Warning confirmed")}
                  />

                  {/* Danger */}
                  <ConfirmDialog
                    trigger={
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        삭제
                      </Button>
                    }
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    title="정말 삭제하시겠습니까?"
                    description="이 항목을 삭제하면 복구할 수 없습니다. 관련된 모든 데이터가 영구적으로 제거됩니다."
                    variant="danger"
                    confirmText="삭제"
                    isLoading={isDeleting}
                    onConfirm={handleDelete}
                  />

                  {/* Programmatic */}
                  <Button variant="secondary" onClick={handleProgrammaticConfirm}>
                    프로그래매틱 확인
                  </Button>
                </div>
              </CardContent>
            </Card>
            {ProgrammaticDialog}
          </TabsContent>

          {/* EmptyState */}
          <TabsContent value="empty" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Empty */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Empty</CardTitle>
                </CardHeader>
                <CardContent>
                  <NoDataState
                    action={{
                      label: "새로 추가",
                      onClick: () => console.log("Add clicked"),
                    }}
                  />
                </CardContent>
              </Card>

              {/* No Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">No Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <NoResultsState
                    action={{
                      label: "필터 초기화",
                      onClick: () => console.log("Reset clicked"),
                      variant: "outline",
                    }}
                  />
                </CardContent>
              </Card>

              {/* Error */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Error</CardTitle>
                </CardHeader>
                <CardContent>
                  <ErrorState
                    action={{
                      label: "다시 시도",
                      onClick: () => console.log("Retry clicked"),
                    }}
                  />
                </CardContent>
              </Card>

              {/* Custom */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Custom (Small)</CardTitle>
                </CardHeader>
                <CardContent>
                  <EmptyState
                    size="sm"
                    title="커스텀 빈 상태"
                    description="원하는 내용을 표시할 수 있습니다."
                    icon={Plus}
                  >
                    <div className="text-xs text-muted-foreground mt-2">
                      추가 컨텐츠도 넣을 수 있어요
                    </div>
                  </EmptyState>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* FileUploader */}
          <TabsContent value="upload" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">FileUploader</CardTitle>
                  <CardDescription>
                    드래그 앤 드롭 파일 업로드 컴포넌트
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUploader
                    accept="image/*,.pdf,.doc,.docx"
                    multiple
                    maxSize={5 * 1024 * 1024}
                    maxFiles={5}
                    files={uploadedFiles}
                    onFilesSelected={handleFilesSelected}
                    onRemove={handleRemoveFile}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">이미지 전용</CardTitle>
                  <CardDescription>이미지 파일만 허용</CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUploader
                    accept="image/*"
                    maxSize={2 * 1024 * 1024}
                    onFilesSelected={(files) => console.log("Images:", files)}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">단일 파일</CardTitle>
                  <CardDescription>하나의 파일만 선택 가능</CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUploader
                    multiple={false}
                    onFilesSelected={(files) => console.log("Single file:", files)}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">비활성화</CardTitle>
                </CardHeader>
                <CardContent>
                  <FileUploader disabled />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
