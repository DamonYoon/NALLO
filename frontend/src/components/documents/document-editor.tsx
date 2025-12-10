"use client";

import { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconButton } from "@/components/ui/icon-button";
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
import {
  mockGlossaryTerms,
  mockExistingDocument,
  defaultDocumentData,
  documentTypeOptions,
  documentStatusOptions,
  type LinkedTerm,
  type GlossaryTermSuggestion,
  type DocumentFormData,
} from "@/lib/mocks/editor";

// BlockNote 에디터는 클라이언트 전용이므로 동적 import
const BlockNoteEditor = dynamic(
  () => import("@/components/editor").then((mod) => mod.BlockNoteEditor),
  { ssr: false }
);

/* ============================================
   Types
   ============================================ */

interface DocumentEditorProps {
  documentId?: string;
  onBack: () => void;
  onSave?: (data: DocumentFormData) => void;
}

/* ============================================
   Subcomponents
   ============================================ */

interface ViewModeToggleProps {
  mode: "edit" | "preview";
  onChange: (mode: "edit" | "preview") => void;
}

function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
      <button
        onClick={() => onChange("edit")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] transition-colors",
          mode === "edit"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Edit3 size={14} />
        Edit
      </button>
      <button
        onClick={() => onChange("preview")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] transition-colors",
          mode === "preview"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Eye size={14} />
        Preview
      </button>
    </div>
  );
}

interface TagChipProps {
  tag: string;
  onRemove: () => void;
}

function TagChip({ tag, onRemove }: TagChipProps) {
  return (
    <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-brand text-white text-xs">
      <Hash size={11} />
      {tag}
      <button
        onClick={onRemove}
        className="ml-0.5 text-white/80 hover:text-white transition-colors"
      >
        <X size={13} />
      </button>
    </div>
  );
}

interface LinkedTermChipProps {
  term: LinkedTerm;
  onRemove: () => void;
}

function LinkedTermChip({ term, onRemove }: LinkedTermChipProps) {
  return (
    <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-accent border border-brand/20 text-[13px] text-brand">
      <Link2 size={12} />
      {term.name}
      <button
        onClick={onRemove}
        className="ml-0.5 text-brand hover:text-brand-hover transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}

interface TermSuggestionDropdownProps {
  suggestions: GlossaryTermSuggestion[];
  onSelect: (term: GlossaryTermSuggestion) => void;
}

function TermSuggestionDropdown({
  suggestions,
  onSelect,
}: TermSuggestionDropdownProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="absolute z-10 w-full bg-card border border-border rounded-lg shadow-lg mt-1 max-h-[180px] overflow-auto">
      {suggestions.map((term) => (
        <button
          key={term.id}
          onClick={() => onSelect(term)}
          className="w-full px-3 py-2 text-left hover:bg-surface-hover transition-colors border-b border-border/50 last:border-b-0"
        >
          <div className="text-xs text-foreground">{term.name}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {term.description}
          </div>
        </button>
      ))}
    </div>
  );
}

interface AITermSuggestionCardProps {
  term: GlossaryTermSuggestion;
  onAdd: () => void;
}

function AITermSuggestionCard({ term, onAdd }: AITermSuggestionCardProps) {
  return (
    <div className="flex items-center justify-between p-2.5 bg-muted rounded-md border border-border hover:border-brand transition-colors cursor-pointer">
      <div className="flex-1">
        <div className="text-xs text-foreground">{term.name}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">
          {term.description}
        </div>
      </div>
      <Button size="xs" variant="brand" onClick={onAdd}>
        추가
      </Button>
    </div>
  );
}

/* ============================================
   Main Component
   ============================================ */

export function DocumentEditor({
  documentId,
  onBack,
  onSave,
}: DocumentEditorProps) {
  // Initialize with existing document or default
  const initialData = documentId ? mockExistingDocument : defaultDocumentData;

  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [documentType, setDocumentType] = useState(initialData.type);
  const [documentStatus, setDocumentStatus] = useState(initialData.status);
  const [documentLocation] = useState(initialData.location);

  const [title, setTitle] = useState(initialData.title);
  const [content, setContent] = useState(initialData.content);

  const [tags, setTags] = useState<string[]>(initialData.tags);
  const [tagInput, setTagInput] = useState("");

  const [linkedTerms, setLinkedTerms] = useState<LinkedTerm[]>(
    initialData.linkedTerms
  );
  const [termInput, setTermInput] = useState("");
  const [showTermDropdown, setShowTermDropdown] = useState(false);

  const [isRightPanelOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter term suggestions based on input
  const termSuggestions = useMemo(() => {
    if (!termInput.trim()) return [];
    return mockGlossaryTerms.filter(
      (term) =>
        (term.name.toLowerCase().includes(termInput.toLowerCase()) ||
          term.description.toLowerCase().includes(termInput.toLowerCase())) &&
        !linkedTerms.find((t) => t.id === term.id)
    );
  }, [termInput, linkedTerms]);

  // Handlers
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleTermInputChange = (value: string) => {
    setTermInput(value);
    setShowTermDropdown(!!value.trim());
  };

  const handleSelectTerm = (term: GlossaryTermSuggestion) => {
    if (!linkedTerms.find((t) => t.id === term.id)) {
      setLinkedTerms([
        ...linkedTerms,
        { id: term.id, name: term.name, description: term.description },
      ]);
    }
    setTermInput("");
    setShowTermDropdown(false);
  };

  const handleRemoveTerm = (index: number) => {
    setLinkedTerms(linkedTerms.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave?.({
      title,
      content,
      type: documentType,
      status: documentStatus,
      location: documentLocation,
      tags,
      linkedTerms,
    });
  };

  // Location breadcrumb parts
  const locationParts = documentLocation.split(" > ");

  return (
    <div className="flex-1 flex overflow-hidden bg-card">
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
                  <IconButton variant="muted" size="sm" onClick={onBack}>
                    <ArrowLeft size={16} />
                  </IconButton>

                  <button className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-brand transition-colors">
                    <MapPin size={14} />
                    {locationParts.map((part, idx) => (
                      <span key={idx} className="flex items-center gap-1.5">
                        {idx > 0 && <ChevronRight size={12} />}
                        <span>{part}</span>
                      </span>
                    ))}
                  </button>
                </div>

                {/* Document Type & Status */}
                <div className="flex items-center gap-2 ml-10">
                  <Select
                    value={documentType}
                    onValueChange={(v) =>
                      setDocumentType(v as typeof documentType)
                    }
                  >
                    <SelectTrigger className="w-[120px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={documentStatus}
                    onValueChange={(v) =>
                      setDocumentStatus(v as typeof documentStatus)
                    }
                  >
                    <SelectTrigger className="w-[110px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {documentStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Right Side - Edit/Preview Toggle */}
              <ViewModeToggle mode={viewMode} onChange={setViewMode} />
            </div>

            {/* Title */}
            <div className="mb-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="문서 제목을 입력하세요"
                className="w-full text-[32px] font-bold text-foreground placeholder:text-muted-foreground/50 focus:outline-none pb-4 border-b border-border bg-transparent"
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
                {showTermDropdown && (
                  <TermSuggestionDropdown
                    suggestions={termSuggestions}
                    onSelect={handleSelectTerm}
                  />
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {linkedTerms.map((term, index) => (
                  <LinkedTermChip
                    key={term.id}
                    term={term}
                    onRemove={() => handleRemoveTerm(index)}
                  />
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
            <Button variant="brand" onClick={handleSave}>
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
            <section>
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
                  <TagChip
                    key={index}
                    tag={tag}
                    onRemove={() => handleRemoveTag(index)}
                  />
                ))}
              </div>
            </section>

            <Separator />

            {/* AI Recommended Terms */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-brand" />
                <h3 className="text-sm font-medium text-foreground">
                  AI 추천 용어
                </h3>
              </div>
              <div className="bg-card rounded-lg p-4 border border-border">
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
                    {mockGlossaryTerms.slice(0, 3).map((term) => (
                      <AITermSuggestionCard
                        key={term.id}
                        term={term}
                        onAdd={() => handleSelectTerm(term)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Knowledge Graph Preview */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Network size={16} className="text-brand" />
                <h3 className="text-sm font-medium text-foreground">
                  지식 그래프
                </h3>
              </div>
              <div className="bg-card rounded-lg p-4 border border-border">
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
                          const x = Math.cos((angle * Math.PI) / 180) * radius;
                          const y = Math.sin((angle * Math.PI) / 180) * radius;

                          return (
                            <div
                              key={term.id}
                              className="absolute top-1/2 left-1/2 w-12 h-12 rounded-full bg-card border-2 border-brand flex items-center justify-center text-[9px] text-foreground text-center shadow-md"
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
                      <button className="flex items-center gap-1.5 text-xs text-brand hover:text-brand-hover transition-colors">
                        <ExternalLink size={14} />
                        그래프에서 보기
                      </button>
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
