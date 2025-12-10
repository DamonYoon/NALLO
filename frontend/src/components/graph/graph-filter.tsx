"use client";

/**
 * GraphFilter - 그래프 필터 사이드바
 *
 * 노드 타입, 관계 타입, 태그 필터링 및 스타일 설정
 */

import { useMemo, useState } from "react";
import { Search, FileText, BookOpen, Hash, X, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  GraphFilterState,
  GraphStyleConfig,
  TagColor,
  NODE_COLORS,
  AVAILABLE_TAGS,
  TAG_COLOR_PALETTE,
} from "./types";

// ========================================
// Props
// ========================================

interface GraphFilterProps {
  filters: GraphFilterState;
  onFiltersChange: (filters: GraphFilterState) => void;
  styleConfig: GraphStyleConfig;
  onStyleConfigChange: (config: GraphStyleConfig) => void;
  tagColors: TagColor[];
  onTagColorChange: (tag: string, color: string) => void;
  nodeStats: {
    documents: number;
    concepts: number;
    tags: number;
    pages: number;
  };
}

// ========================================
// Subcomponents
// ========================================

interface NodeTypeButtonProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

function NodeTypeButton({
  icon,
  label,
  count,
  isActive,
  onClick,
}: NodeTypeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors",
        isActive
          ? "bg-brand/20 border border-brand"
          : "bg-surface border border-border"
      )}
    >
      <div className="flex items-center gap-2">
        <span className={isActive ? "text-brand" : "text-text-tertiary"}>
          {icon}
        </span>
        <span
          className={cn(
            "text-[13px]",
            isActive ? "text-brand" : "text-text-secondary"
          )}
        >
          {label}
        </span>
      </div>
      <span
        className={cn(
          "text-[13px]",
          isActive ? "text-brand" : "text-text-tertiary"
        )}
      >
        {count}
      </span>
    </button>
  );
}

// ========================================
// Component
// ========================================

export function GraphFilter({
  filters,
  onFiltersChange,
  styleConfig,
  onStyleConfigChange,
  tagColors,
  onTagColorChange,
  nodeStats,
}: GraphFilterProps) {
  const [tagSearch, setTagSearch] = useState("");

  const updateFilter = <K extends keyof GraphFilterState>(
    key: K,
    value: GraphFilterState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const getTagColor = (tag: string) => {
    return tagColors.find((tc) => tc.tag === tag)?.color || NODE_COLORS.tag;
  };

  const filteredTags = useMemo(() => {
    const q = tagSearch.trim().toLowerCase();
    if (!q) return [];
    return AVAILABLE_TAGS.filter(
      (t) => t.toLowerCase().includes(q) && !filters.selectedTags.includes(t)
    );
  }, [tagSearch, filters.selectedTags]);

  const getRandomColor = () =>
    TAG_COLOR_PALETTE[Math.floor(Math.random() * TAG_COLOR_PALETTE.length)];

  const toggleTag = (tag: string) => {
    const isSelected = filters.selectedTags.includes(tag);
    if (isSelected) {
      const newTags = filters.selectedTags.filter((t) => t !== tag);
      updateFilter("selectedTags", newTags);
    } else {
      const existingColor = tagColors.find((tc) => tc.tag === tag)?.color;
      if (!existingColor) {
        onTagColorChange(tag, getRandomColor());
      }
      updateFilter("selectedTags", [...filters.selectedTags, tag]);
    }
  };

  return (
    <div className="w-filter bg-background border-r border-border overflow-y-auto flex-shrink-0">
      <div className="p-5 space-y-6">
        {/* 노드 검색 */}
        <section>
          <h4 className="text-[13px] text-text-primary mb-3">노드 검색</h4>
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
            />
            <Input
              type="text"
              placeholder="노드 이름으로 검색..."
              value={filters.searchQuery}
              onChange={(e) => updateFilter("searchQuery", e.target.value)}
              className="pl-9 bg-surface border-border text-text-secondary placeholder:text-text-disabled focus:border-brand"
            />
          </div>
        </section>

        <hr className="border-t border-border" />

        {/* 노드 타입 필터 */}
        <section>
          <h4 className="text-[13px] text-text-primary mb-3">노드 타입</h4>
          <div className="space-y-2">
            <NodeTypeButton
              icon={<Package size={14} />}
              label="페이지"
              count={nodeStats.pages}
              isActive={filters.showPages}
              onClick={() => updateFilter("showPages", !filters.showPages)}
            />
            <NodeTypeButton
              icon={<FileText size={14} />}
              label="문서"
              count={nodeStats.documents}
              isActive={filters.showDocuments}
              onClick={() =>
                updateFilter("showDocuments", !filters.showDocuments)
              }
            />
            <NodeTypeButton
              icon={<BookOpen size={14} />}
              label="용어"
              count={nodeStats.concepts}
              isActive={filters.showConcepts}
              onClick={() =>
                updateFilter("showConcepts", !filters.showConcepts)
              }
            />
            <NodeTypeButton
              icon={<Hash size={14} />}
              label="태그"
              count={nodeStats.tags}
              isActive={filters.showTags}
              onClick={() => updateFilter("showTags", !filters.showTags)}
            />
          </div>
        </section>

        <hr className="border-t border-border" />

        {/* 관계 타입 필터 */}
        <section>
          <h4 className="text-[13px] text-text-primary mb-3">관계 타입</h4>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-text-secondary">
                문서 간 관계 보기
              </span>
              <Switch
                checked={filters.showDocDocEdges}
                onCheckedChange={(v) => updateFilter("showDocDocEdges", v)}
                className="data-[state=checked]:bg-brand"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-text-secondary">
                문서가 사용하는 용어 보기
              </span>
              <Switch
                checked={filters.showDocConceptEdges}
                onCheckedChange={(v) => updateFilter("showDocConceptEdges", v)}
                className="data-[state=checked]:bg-brand"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-text-secondary">
                문서-태그 연결 보기
              </span>
              <Switch
                checked={filters.showDocTagEdges}
                onCheckedChange={(v) => updateFilter("showDocTagEdges", v)}
                className="data-[state=checked]:bg-brand"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-text-secondary">
                용어간 관계 보기
              </span>
              <Switch
                checked={filters.showConceptConceptEdges}
                onCheckedChange={(v) =>
                  updateFilter("showConceptConceptEdges", v)
                }
                className="data-[state=checked]:bg-brand"
              />
            </div>
          </div>
        </section>

        <hr className="border-t border-border" />

        {/* 태그 필터 & 색상 */}
        <section>
          <h4 className="text-[13px] text-text-primary mb-3">
            태그 필터 & 색상
          </h4>
          <div className="space-y-3">
            {/* 태그 검색 + 인풋 내 드롭다운 */}
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
              />
              <Input
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                placeholder="태그 검색 후 추가..."
                className="pl-9 bg-surface border-border text-text-secondary placeholder:text-text-disabled focus:border-brand"
              />
              {tagSearch.trim() !== "" && (
                <div className="absolute left-0 right-0 top-[110%] bg-surface-elevated border border-border rounded-lg shadow-lg z-30 max-h-48 overflow-y-auto">
                  {filteredTags.length === 0 ? (
                    <p className="px-3 py-2 text-[12px] text-text-disabled">
                      검색 결과가 없습니다.
                    </p>
                  ) : (
                    filteredTags.map((tag) => {
                      const color =
                        tagColors.find((tc) => tc.tag === tag)?.color ||
                        getRandomColor();
                      return (
                        <button
                          key={tag}
                          onClick={() => {
                            if (!tagColors.find((tc) => tc.tag === tag)) {
                              onTagColorChange(tag, color);
                            }
                            toggleTag(tag);
                            setTagSearch("");
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 text-left text-[13px] text-text-secondary hover:bg-surface-hover"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full border border-white/30"
                              style={{ backgroundColor: color }}
                            />
                            <span>#{tag}</span>
                          </div>
                          <span className="text-[12px] text-text-tertiary">
                            추가
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* 선택된 태그 */}
            {filters.selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 w-full">
                {filters.selectedTags.map((tag) => {
                  const tagColor = getTagColor(tag);
                  return (
                    <div
                      key={`selected-${tag}`}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12px] bg-brand/15 text-text-primary border border-brand/50 w-full"
                      title="선택된 태그"
                    >
                      {/* 단일 색상 버튼(팔레트 역할) */}
                      <div className="relative group">
                        <button
                          className="p-1 rounded-md hover:bg-surface-hover transition-colors"
                          title="색상 변경"
                        >
                          <div
                            className="w-4 h-4 rounded-full border border-white/30"
                            style={{ backgroundColor: tagColor }}
                          />
                        </button>
                        <div className="absolute top-full left-0 mt-1 bg-surface border border-border-strong rounded-lg p-3 shadow-lg z-30 hidden group-hover:block min-w-[180px]">
                          <p className="text-[12px] text-text-tertiary mb-2">
                            색상 선택
                          </p>
                          <div className="grid grid-cols-4 gap-1.5">
                            {TAG_COLOR_PALETTE.map((color) => (
                              <button
                                key={color}
                                onClick={() => onTagColorChange(tag, color)}
                                className={cn(
                                  "w-7 h-7 rounded-full border-2 transition-colors",
                                  tagColor === color
                                    ? "border-white"
                                    : "border-white/20 hover:border-white/60"
                                )}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="flex-1 min-w-0 truncate">#{tag}</span>
                      <button
                        onClick={() => toggleTag(tag)}
                        className="p-1 rounded-md hover:bg-surface-hover transition-colors"
                        title="필터에서 제거"
                      >
                        <X size={12} className="text-text-secondary" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <hr className="border-t border-border" />

        {/* 그래프 스타일 */}
        <section>
          <h4 className="text-[13px] text-text-primary mb-3">그래프 스타일</h4>
          <div className="space-y-4">
            {/* 노드 크기 */}
            <div>
              <label className="text-[12px] text-text-tertiary mb-1.5 block">
                노드 크기
              </label>
              <Slider
                value={[styleConfig.nodeSize]}
                min={50}
                max={150}
                step={10}
                onValueChange={([v]) =>
                  onStyleConfigChange({ ...styleConfig, nodeSize: v })
                }
                className="[&_[role=slider]]:bg-brand"
              />
            </div>

            {/* 엣지 굵기 */}
            <div>
              <label className="text-[12px] text-text-tertiary mb-1.5 block">
                엣지 굵기
              </label>
              <Slider
                value={[styleConfig.edgeWidth]}
                min={0.5}
                max={3}
                step={0.5}
                onValueChange={([v]) =>
                  onStyleConfigChange({ ...styleConfig, edgeWidth: v })
                }
                className="[&_[role=slider]]:bg-brand"
              />
            </div>

            {/* 라벨 표시 */}
            <div>
              <label className="text-[12px] text-text-tertiary mb-1.5 block">
                라벨 표시
              </label>
              <Select
                value={styleConfig.labelVisibility}
                onValueChange={(v) =>
                  onStyleConfigChange({
                    ...styleConfig,
                    labelVisibility: v as GraphStyleConfig["labelVisibility"],
                  })
                }
              >
                <SelectTrigger className="bg-surface border-border text-text-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface border-border-strong">
                  <SelectItem value="always">항상 표시</SelectItem>
                  <SelectItem value="hover">Hover 시 표시</SelectItem>
                  <SelectItem value="important">중요 노드만</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
