"use client";

import { useState } from "react";
import { ArrowLeft, Trash2, Plus } from "lucide-react";
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
import { ConfirmDialog, useConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  EmptyState,
  NoDataState,
  NoResultsState,
  ErrorState,
} from "@/components/shared/empty-state";
import { FileUploader, type UploadedFile } from "@/components/shared/file-uploader";

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
            f.id === file.id ? { ...f, status: "uploading" as const, progress: 0 } : f
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
                  status: progress >= 100 ? ("success" as const) : ("uploading" as const),
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
        <Tabs defaultValue="search" className="space-y-6">
          <TabsList>
            <TabsTrigger value="search">SearchInput</TabsTrigger>
            <TabsTrigger value="confirm">ConfirmDialog</TabsTrigger>
            <TabsTrigger value="empty">EmptyState</TabsTrigger>
            <TabsTrigger value="upload">FileUploader</TabsTrigger>
          </TabsList>

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
                    <label className="text-sm font-medium">기본 (300ms debounce)</label>
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

