"use client";

import { useState } from "react";
import { ArrowLeft, Plus, RefreshCw } from "lucide-react";

import { cn } from "@/lib/utils";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PageTree, type PageNode } from "@/components/pages/page-tree";

// Mock data for testing
const mockPageTree: PageNode[] = [
  {
    id: "p1",
    slug: "getting-started",
    title: "시작하기",
    order: 0,
    visible: true,
    documentId: "d1",
    documentTitle: "Getting Started Guide",
    children: [
      {
        id: "p1-1",
        slug: "installation",
        title: "설치 방법",
        order: 0,
        visible: true,
        documentId: "d1-1",
        documentTitle: "Installation",
      },
      {
        id: "p1-2",
        slug: "quick-start",
        title: "빠른 시작",
        order: 1,
        visible: true,
        documentId: "d1-2",
        documentTitle: "Quick Start",
      },
      {
        id: "p1-3",
        slug: "configuration",
        title: "설정",
        order: 2,
        visible: false, // Hidden page
        documentId: "d1-3",
        documentTitle: "Configuration Guide",
      },
    ],
  },
  {
    id: "p2",
    slug: "concepts",
    title: "핵심 개념",
    order: 1,
    visible: true,
    children: [
      {
        id: "p2-1",
        slug: "architecture",
        title: "아키텍처",
        order: 0,
        visible: true,
        documentId: "d2-1",
        documentTitle: "Architecture Overview",
        children: [
          {
            id: "p2-1-1",
            slug: "frontend",
            title: "프론트엔드",
            order: 0,
            visible: true,
            documentId: "d2-1-1",
            documentTitle: "Frontend Architecture",
          },
          {
            id: "p2-1-2",
            slug: "backend",
            title: "백엔드",
            order: 1,
            visible: true,
            documentId: "d2-1-2",
            documentTitle: "Backend Architecture",
          },
          {
            id: "p2-1-3",
            slug: "database",
            title: "데이터베이스",
            order: 2,
            visible: true,
          },
        ],
      },
      {
        id: "p2-2",
        slug: "data-model",
        title: "데이터 모델",
        order: 1,
        visible: true,
        documentId: "d2-2",
        documentTitle: "Data Model Reference",
      },
    ],
  },
  {
    id: "p3",
    slug: "api-reference",
    title: "API 레퍼런스",
    order: 2,
    visible: true,
    children: [
      {
        id: "p3-1",
        slug: "documents",
        title: "Documents API",
        order: 0,
        visible: true,
        documentId: "d3-1",
        documentTitle: "Documents API",
      },
      {
        id: "p3-2",
        slug: "concepts",
        title: "Concepts API",
        order: 1,
        visible: true,
        documentId: "d3-2",
        documentTitle: "Concepts API",
      },
      {
        id: "p3-3",
        slug: "versions",
        title: "Versions API",
        order: 2,
        visible: false,
        documentId: "d3-3",
        documentTitle: "Versions API",
      },
    ],
  },
  {
    id: "p4",
    slug: "changelog",
    title: "변경 이력",
    order: 3,
    visible: true,
    documentId: "d4",
    documentTitle: "Changelog",
  },
];

export default function PageTreePlayground() {
  const [selectedPage, setSelectedPage] = useState<PageNode | null>(null);
  const [pages, setPages] = useState<PageNode[]>(mockPageTree);
  const [actionLog, setActionLog] = useState<string[]>([]);

  // Options
  const [showActions, setShowActions] = useState(true);
  const [showVisibility, setShowVisibility] = useState(true);
  const [showDocumentLink, setShowDocumentLink] = useState(true);
  const [enableReorder, setEnableReorder] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const logAction = (action: string) => {
    setActionLog((prev) => [
      `[${new Date().toLocaleTimeString()}] ${action}`,
      ...prev.slice(0, 9),
    ]);
  };

  const handleSelect = (page: PageNode) => {
    setSelectedPage(page);
    logAction(`선택: ${page.title} (${page.slug})`);
  };

  const handleToggleVisibility = (page: PageNode) => {
    // Update visibility in tree
    const updateVisibility = (nodes: PageNode[]): PageNode[] => {
      return nodes.map((node) => {
        if (node.id === page.id) {
          return { ...node, visible: !node.visible };
        }
        if (node.children) {
          return { ...node, children: updateVisibility(node.children) };
        }
        return node;
      });
    };
    setPages(updateVisibility(pages));
    logAction(`표시 전환: ${page.title} → ${page.visible ? "숨김" : "표시"}`);
  };

  const handleEdit = (page: PageNode) => {
    logAction(`편집: ${page.title}`);
  };

  const handleDelete = (page: PageNode) => {
    logAction(`삭제 요청: ${page.title}`);
  };

  const handleAddChild = (parentPage: PageNode) => {
    logAction(`하위 페이지 추가: ${parentPage.title}의 하위에`);
  };

  const handleReset = () => {
    setPages(mockPageTree);
    setSelectedPage(null);
    setActionLog([]);
    logAction("데이터 초기화");
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
            <h1 className="text-xl font-semibold">PageTree</h1>
            <p className="text-sm text-muted-foreground">
              페이지 트리 구조 컴포넌트
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            초기화
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 p-6 overflow-auto">
        {/* Left column - Options */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">표시 옵션</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="showActions">액션 메뉴</Label>
                <Switch
                  id="showActions"
                  checked={showActions}
                  onCheckedChange={setShowActions}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showVisibility">표시 여부 아이콘</Label>
                <Switch
                  id="showVisibility"
                  checked={showVisibility}
                  onCheckedChange={setShowVisibility}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showDocumentLink">문서 링크 뱃지</Label>
                <Switch
                  id="showDocumentLink"
                  checked={showDocumentLink}
                  onCheckedChange={setShowDocumentLink}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="enableReorder">드래그 핸들</Label>
                <Switch
                  id="enableReorder"
                  checked={enableReorder}
                  onCheckedChange={setEnableReorder}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="disabled">비활성화</Label>
                <Switch
                  id="disabled"
                  checked={disabled}
                  onCheckedChange={setDisabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* Selected Page Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">선택된 페이지</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedPage ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID</span>
                    <code className="text-xs bg-muted px-1 rounded">
                      {selectedPage.id}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Title</span>
                    <span>{selectedPage.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Slug</span>
                    <code className="text-xs bg-muted px-1 rounded">
                      /{selectedPage.slug}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Visible</span>
                    <Badge variant={selectedPage.visible ? "default" : "secondary"}>
                      {selectedPage.visible ? "표시" : "숨김"}
                    </Badge>
                  </div>
                  {selectedPage.documentTitle && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Document</span>
                      <Badge variant="outline">{selectedPage.documentTitle}</Badge>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  페이지를 선택하세요
                </p>
              )}
            </CardContent>
          </Card>

          {/* Action Log */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">액션 로그</CardTitle>
            </CardHeader>
            <CardContent>
              {actionLog.length > 0 ? (
                <div className="space-y-1 text-xs font-mono">
                  {actionLog.map((log, i) => (
                    <div
                      key={i}
                      className={cn(
                        "p-1 rounded",
                        i === 0 && "bg-accent"
                      )}
                    >
                      {log}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  액션이 없습니다
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Center/Right column - Tree */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                페이지 트리
                <Badge variant="outline" className="font-normal">
                  v1.0.0
                </Badge>
              </CardTitle>
              <CardDescription>
                문서 버전의 페이지 계층 구조를 표시합니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PageTree
                data={pages}
                selectedId={selectedPage?.id}
                onSelect={handleSelect}
                onToggleVisibility={handleToggleVisibility}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddChild={handleAddChild}
                showActions={showActions}
                showVisibility={showVisibility}
                showDocumentLink={showDocumentLink}
                enableReorder={enableReorder}
                disabled={disabled}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tips */}
      <div className="border-t p-4 bg-muted/30">
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <span className="font-medium">💡 Tips:</span>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>클릭</strong>으로 페이지 선택
            </li>
            <li>
              <strong>화살표</strong>로 트리 확장/축소
            </li>
            <li>
              <strong>⋯ 버튼</strong>으로 편집/삭제/하위 추가 (호버 시 표시)
            </li>
            <li>
              <strong>눈 아이콘</strong>: 공개 여부 표시
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

