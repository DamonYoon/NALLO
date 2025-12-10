"use client";

import { useState } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowLeft,
  FileText,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { DataTable } from "@/components/shared/data-table";
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";

// Mock document data type
interface Document {
  id: string;
  title: string;
  type: "api" | "general" | "tutorial";
  status: "draft" | "in_review" | "done" | "published";
  lang: string;
  updatedAt: string;
}

// Mock data generator
const generateMockDocuments = (count: number): Document[] => {
  const types: Document["type"][] = ["api", "general", "tutorial"];
  const statuses: Document["status"][] = [
    "draft",
    "in_review",
    "done",
    "published",
  ];
  const langs = ["ko", "en", "ja"];
  const titles = [
    "시작 가이드",
    "API 레퍼런스",
    "인증 가이드",
    "데이터 모델",
    "에러 처리",
    "웹훅 설정",
    "SDK 사용법",
    "마이그레이션 가이드",
    "보안 가이드",
    "성능 최적화",
    "디버깅 팁",
    "FAQ",
    "릴리즈 노트",
    "변경 로그",
    "아키텍처 개요",
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `doc-${i + 1}`,
    title: titles[i % titles.length] + (i >= titles.length ? ` ${Math.floor(i / titles.length) + 1}` : ""),
    type: types[i % types.length],
    status: statuses[i % statuses.length],
    lang: langs[i % langs.length],
    updatedAt: new Date(
      Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
    ).toISOString(),
  }));
};

// Status badge component
const StatusBadge = ({ status }: { status: Document["status"] }) => {
  const variants: Record<Document["status"], { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
    draft: { label: "초안", variant: "secondary" },
    in_review: { label: "검토중", variant: "outline" },
    done: { label: "완료", variant: "default" },
    published: { label: "배포됨", variant: "default" },
  };

  const { label, variant } = variants[status];
  return <Badge variant={variant}>{label}</Badge>;
};

// Type badge component
const TypeBadge = ({ type }: { type: Document["type"] }) => {
  const variants: Record<Document["type"], { label: string; className: string }> = {
    api: { label: "API", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
    general: { label: "일반", className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
    tutorial: { label: "튜토리얼", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  };

  const { label, className } = variants[type];
  return <Badge className={className} variant="outline">{label}</Badge>;
};

// Column definitions
const columns: ColumnDef<Document>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="전체 선택"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="행 선택"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="제목" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{row.getValue("title")}</span>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="타입" />
    ),
    cell: ({ row }) => <TypeBadge type={row.getValue("type")} />,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="상태" />
    ),
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "lang",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="언어" />
    ),
    cell: ({ row }) => (
      <span className="uppercase text-muted-foreground">
        {row.getValue("lang")}
      </span>
    ),
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="수정일" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("updatedAt"));
      return (
        <span className="text-muted-foreground">
          {date.toLocaleDateString("ko-KR")}
        </span>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const document = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">메뉴 열기</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>액션</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(document.id)}
            >
              ID 복사
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              보기
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Pencil className="mr-2 h-4 w-4" />
              편집
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function DataTablePlayground() {
  const [isLoading, setIsLoading] = useState(false);
  const [dataCount, setDataCount] = useState(50);
  const data = generateMockDocuments(dataCount);

  const handleToggleLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

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
            <h1 className="text-2xl font-bold">DataTable</h1>
            <p className="text-muted-foreground">
              범용 데이터 테이블 컴포넌트 (정렬, 필터, 페이지네이션)
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <Card className="mb-4">
        <CardHeader className="py-3">
          <CardTitle className="text-sm">테스트 컨트롤</CardTitle>
        </CardHeader>
        <CardContent className="py-3">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleToggleLoading}>
              로딩 상태 테스트 (2초)
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">데이터 개수:</span>
              {[10, 30, 50, 100].map((count) => (
                <Button
                  key={count}
                  variant={dataCount === count ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDataCount(count)}
                >
                  {count}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DataTable */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>문서 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={data}
            searchKey="title"
            searchPlaceholder="제목으로 검색..."
            loading={isLoading}
            emptyMessage="문서가 없습니다."
            pageSize={10}
          />
        </CardContent>
      </Card>

      {/* Feature list */}
      <Card className="mt-4">
        <CardHeader className="py-3">
          <CardTitle className="text-sm">🎯 구현된 기능</CardTitle>
        </CardHeader>
        <CardContent className="py-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-medium mb-1">정렬</p>
              <ul className="text-muted-foreground text-xs space-y-0.5">
                <li>• 컬럼 헤더 클릭으로 정렬</li>
                <li>• 오름차순/내림차순 토글</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">필터</p>
              <ul className="text-muted-foreground text-xs space-y-0.5">
                <li>• 검색 입력 필드</li>
                <li>• 실시간 필터링</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">페이지네이션</p>
              <ul className="text-muted-foreground text-xs space-y-0.5">
                <li>• 페이지 크기 선택</li>
                <li>• 페이지 네비게이션</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">기타</p>
              <ul className="text-muted-foreground text-xs space-y-0.5">
                <li>• 행 선택 (체크박스)</li>
                <li>• 컬럼 표시/숨김</li>
                <li>• 로딩/빈 상태</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

