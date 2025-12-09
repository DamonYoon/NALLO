"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Hash,
  Link2,
  MapPin,
  ChevronRight,
  X,
  Sparkles,
  Network,
  ExternalLink,
  Save,
  Edit3,
  Eye,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// BlockNote 에디터는 클라이언트 전용이므로 동적 import
const BlockNoteEditor = dynamic(
  () => import("@/components/editor").then((mod) => mod.BlockNoteEditor),
  { ssr: false }
);

interface DocumentEditorProps {
  documentId?: string;
  onBack: () => void;
}

const mockGlossaryTerms = [
  { name: "Web3 Data API", description: "Web3 블록체인 데이터를 조회하는 API" },
  { name: "API Key", description: "API 인증을 위한 고유 키" },
  { name: "Endpoint", description: "API 요청을 받는 URL 경로" },
  { name: "Event Log", description: "블록체인에서 발생한 이벤트 기록" },
  { name: "SDK", description: "소프트웨어 개발 키트" },
];

export function DocumentEditor({ documentId, onBack }: DocumentEditorProps) {
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [documentType, setDocumentType] = useState("api-guide");
  const [documentStatus, setDocumentStatus] = useState<
    "Draft" | "In Review" | "Done" | "Publish"
  >("Draft");
  const [documentLocation, setDocumentLocation] = useState(
    "Getting Started > Features"
  );

  const [title, setTitle] = useState(
    documentId ? "Web3 Data API Quickstart" : ""
  );
  const [content, setContent] = useState(
    documentId
      ? `BNB Chain의 온체인 데이터를 빠르게 조회할 수 있는 Web3 Data API의 기본 사용법을 안내합니다.`
      : ""
  );

  const [tags, setTags] = useState<string[]>(
    documentId ? ["Quickstart", "beginner"] : []
  );
  const [tagInput, setTagInput] = useState("");

  const [linkedTerms, setLinkedTerms] = useState<
    Array<{ name: string; description: string }>
  >(documentId ? mockGlossaryTerms.slice(0, 3) : []);
  const [termInput, setTermInput] = useState("");
  const [termSuggestions, setTermSuggestions] = useState<
    Array<{ name: string; description: string }>
  >([]);
  const [showTermDropdown, setShowTermDropdown] = useState(false);

  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleTermInputChange = (value: string) => {
    setTermInput(value);
    if (value.trim()) {
      const filtered = mockGlossaryTerms.filter(
        (term) =>
          term.name.toLowerCase().includes(value.toLowerCase()) ||
          term.description.toLowerCase().includes(value.toLowerCase())
      );
      setTermSuggestions(filtered);
      setShowTermDropdown(true);
    } else {
      setTermSuggestions([]);
      setShowTermDropdown(false);
    }
  };

  const handleSelectTerm = (term: { name: string; description: string }) => {
    if (!linkedTerms.find((t) => t.name === term.name)) {
      setLinkedTerms([...linkedTerms, term]);
    }
    setTermInput("");
    setShowTermDropdown(false);
  };

  const handleRemoveTerm = (index: number) => {
    setLinkedTerms(linkedTerms.filter((_, i) => i !== index));
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-white">
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Main Content Area */}
        <ScrollArea className="flex-1">
          <div className="px-10 py-5 max-w-[900px] mx-auto">
            {/* Meta Bar */}
            <div className="mb-6 flex items-start justify-between gap-4">
              {/* Left Side - Location, Type, Status */}
              <div className="flex-1 space-y-3">
                {/* Back Button + Document Location */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onBack}
                    className="h-8 px-2"
                  >
                    <ArrowLeft size={16} />
                  </Button>

                  <button className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-brand transition-colors">
                    <MapPin size={14} />
                    {documentLocation.split(" > ").map((part, idx, arr) => (
                      <span key={idx} className="flex items-center gap-1.5">
                        {idx > 0 && <ChevronRight size={12} />}
                        <span>{part}</span>
                      </span>
                    ))}
                  </button>
                </div>

                {/* Document Type & Status */}
                <div className="flex items-center gap-2 ml-10">
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger className="w-[120px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="api-guide">API Guide</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="tutorial">Tutorial</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={documentStatus}
                    onValueChange={(v) =>
                      setDocumentStatus(
                        v as "Draft" | "In Review" | "Done" | "Publish"
                      )
                    }
                  >
                    <SelectTrigger className="w-[110px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="In Review">In Review</SelectItem>
                      <SelectItem value="Done">Done</SelectItem>
                      <SelectItem value="Publish">Publish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Right Side - Edit/Preview Toggle */}
              <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
                <button
                  onClick={() => setViewMode("edit")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] transition-colors",
                    viewMode === "edit"
                      ? "bg-white text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Edit3 size={14} />
                  Edit
                </button>
                <button
                  onClick={() => setViewMode("preview")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] transition-colors",
                    viewMode === "preview"
                      ? "bg-white text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Eye size={14} />
                  Preview
                </button>
              </div>
            </div>

            {/* Editor Tips - Only show in edit mode */}
            {viewMode === "edit" && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-emerald-900 mb-1">
                      💡 에디터 사용법
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-emerald-700 text-xs">
                      <div>
                        <span className="font-medium">/</span> 슬래시 커맨드로
                        블록 추가
                      </div>
                      <div>
                        <span className="font-medium">@</span> 멘션으로 용어/문서
                        연결
                      </div>
                      <div>
                        <span className="font-medium">드래그</span>로 블록 순서
                        변경
                      </div>
                      <div>
                        <span className="font-medium">```ts</span> + Enter로
                        코드 블록
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Title */}
            <div className="mb-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="문서 제목을 입력하세요"
                className="w-full text-[32px] font-bold text-foreground placeholder:text-muted-foreground/50 focus:outline-none pb-4 border-b border-border"
                readOnly={viewMode === "preview"}
              />
            </div>

            {/* BlockNote Editor */}
            <div className="min-h-[400px] mb-10">
              {isMounted && (
                <BlockNoteEditor
                  editable={viewMode === "edit"}
                  onChange={setContent}
                  className="min-h-[400px]"
                />
              )}
            </div>

            {/* Term Connection Section */}
            <div className="mb-20 pt-8 border-t border-border">
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Link2 size={16} className="text-brand" />
                  <h3 className="text-sm font-medium text-foreground">
                    용어 연결
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    ({linkedTerms.length})
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  용어를 연결하면 문서 간 관계가 자동으로 구성됩니다. 에디터에서{" "}
                  <code className="bg-muted px-1 rounded">@</code>로 직접 연결할
                  수도 있습니다.
                </p>
              </div>

              <div className="relative mb-3">
                <Input
                  type="text"
                  value={termInput}
                  onChange={(e) => handleTermInputChange(e.target.value)}
                  onFocus={() => termInput && setShowTermDropdown(true)}
                  placeholder="용어를 검색하세요"
                  className="h-9"
                />

                {/* Autocomplete Dropdown */}
                {showTermDropdown && termSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-border rounded-lg shadow-lg mt-1 max-h-[180px] overflow-auto">
                    {termSuggestions.map((term, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectTerm(term)}
                        className="w-full px-3 py-2 text-left hover:bg-muted transition-colors border-b border-border/50 last:border-b-0"
                      >
                        <div className="text-xs text-foreground">
                          {term.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {term.description}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {linkedTerms.map((term, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-accent border border-brand/20 text-[13px] text-brand"
                  >
                    <Link2 size={12} />
                    {term.name}
                    <button
                      onClick={() => handleRemoveTerm(index)}
                      className="ml-0.5 text-brand hover:text-brand-dark transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Fixed Bottom Action Bar */}
        <div className="bg-muted border-t border-border px-10 py-2 flex items-center justify-between">
          <p className="text-[13px] text-muted-foreground">
            작성 중인 문서입니다. 변경 사항은 저장 시 반영됩니다.
          </p>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onBack}>
              취소
            </Button>
            <Button className="bg-brand hover:bg-brand-dark text-white">
              <Save size={16} className="mr-1.5" />
              저장하기
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel - Tags & AI Suggestions */}
      {isRightPanelOpen && (
        <div className="w-[320px] bg-muted border-l border-border overflow-auto flex-shrink-0">
          <div className="p-5 space-y-6">
            {/* Tags Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Hash size={16} className="text-brand" />
                <h3 className="text-sm font-medium text-foreground">태그</h3>
              </div>
              <Input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="태그를 입력하고 Enter"
                className="h-9 mb-3"
              />
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-brand text-white text-xs"
                  >
                    <Hash size={11} />
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(index)}
                      className="ml-0.5 text-white/80 hover:text-white transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* AI Recommended Terms */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-brand" />
                <h3 className="text-sm font-medium text-foreground">
                  AI 추천 용어
                </h3>
              </div>
              <div className="bg-white rounded-lg p-4 border border-border">
                {content.length === 0 ? (
                  <div className="text-center py-8">
                    <Sparkles
                      size={32}
                      className="text-muted-foreground/30 mx-auto mb-3"
                    />
                    <p className="text-xs text-muted-foreground">
                      문서를 작성하면
                      <br />
                      중요한 키워드를 자동 추출합니다.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {mockGlossaryTerms.slice(0, 3).map((term, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 bg-muted rounded-md border border-border hover:border-brand transition-colors cursor-pointer"
                      >
                        <div className="flex-1">
                          <div className="text-xs text-foreground">
                            {term.name}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            {term.description}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleSelectTerm(term)}
                          className="h-6 px-2 text-[11px] bg-brand hover:bg-brand-dark"
                        >
                          추가
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Knowledge Graph Preview */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Network size={16} className="text-brand" />
                <h3 className="text-sm font-medium text-foreground">
                  지식 그래프
                </h3>
              </div>
              <div className="bg-white rounded-lg p-4 border border-border">
                {linkedTerms.length === 0 ? (
                  <div className="text-center py-8">
                    <Network
                      size={32}
                      className="text-muted-foreground/30 mx-auto mb-3"
                    />
                    <p className="text-xs text-muted-foreground">
                      용어를 연결하면
                      <br />
                      문서와의 관계가 표시됩니다
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Simple Graph Visualization */}
                    <div className="relative h-[160px] flex items-center justify-center">
                      <div className="relative w-full h-full">
                        {/* Center Node - Document */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-brand flex items-center justify-center text-white text-[11px] shadow-lg z-10">
                          문서
                        </div>

                        {/* Connected Term Nodes */}
                        {linkedTerms.slice(0, 4).map((term, idx) => {
                          const angle =
                            (idx * 360) / Math.min(linkedTerms.length, 4);
                          const radius = 60;
                          const x =
                            Math.cos((angle * Math.PI) / 180) * radius;
                          const y =
                            Math.sin((angle * Math.PI) / 180) * radius;

                          return (
                            <div
                              key={idx}
                              className="absolute top-1/2 left-1/2 w-12 h-12 rounded-full bg-white border-2 border-brand flex items-center justify-center text-[9px] text-foreground text-center shadow-md"
                              style={{
                                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                              }}
                            >
                              {term.name.length > 8
                                ? term.name.slice(0, 8) + "..."
                                : term.name}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex justify-center pt-4 border-t border-border mt-4">
                      <button className="flex items-center gap-1.5 text-xs text-brand hover:text-brand-dark transition-colors">
                        <ExternalLink size={14} />
                        그래프에서 보기
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
