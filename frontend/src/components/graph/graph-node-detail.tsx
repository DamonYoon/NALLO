"use client";

/**
 * GraphNodeDetail - 노드 상세 정보 패널
 *
 * 선택된 노드의 상세 정보와 연결 정보 표시
 */

import {
  FileText,
  BookOpen,
  X,
  Edit3,
  ExternalLink,
  Plus,
  Hash,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { GraphNode, TagColor, NODE_COLORS } from "./types";

// ========================================
// Props
// ========================================

interface GraphNodeDetailProps {
  node: GraphNode;
  tagColors: TagColor[];
  connectedDocuments: GraphNode[];
  connectedConcepts: GraphNode[];
  onClose: () => void;
  onOpenDocument?: (nodeId: string) => void;
  onEditNode?: (nodeId: string) => void;
  onCreateConnection?: (fromNodeId: string) => void;
  /** 연결된 노드 클릭 시 해당 노드 선택 */
  onSelectNode?: (nodeId: string) => void;
}

// ========================================
// Status Badge Component
// ========================================

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;

  const colorMap: Record<string, string> = {
    Publish: "text-[#10b981]",
    Done: "text-[#60a5fa]",
    "In Review": "text-[#fbbf24]",
    Draft: "text-[#9ca3af]",
  };

  return (
    <span className={cn("text-[11px]", colorMap[status] || "text-[#9ca3af]")}>
      {status}
    </span>
  );
}

// ========================================
// Connected Node Item
// ========================================

interface ConnectedNodeItemProps {
  node: GraphNode;
  onClick?: () => void;
}

function ConnectedNodeItem({ node, onClick }: ConnectedNodeItemProps) {
  return (
    <div
      onClick={onClick}
      className="p-2.5 bg-[#2a2a2a] rounded-md hover:bg-[#333333] transition-colors cursor-pointer group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            {node.type === "document" ? (
              <FileText size={14} className="text-[#fc8658]" />
            ) : (
              <BookOpen size={14} className="text-[#a855f7]" />
            )}
            <span className="text-[13px] text-[#e5e5e5]">{node.label}</span>
          </div>
          {node.status && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[#9ca3af]">
                {node.type === "document" ? "Document" : "Concept"}
              </span>
              <span className="text-[11px] text-[#6b7280]">•</span>
              <StatusBadge status={node.status} />
            </div>
          )}
        </div>
        <ExternalLink
          size={14}
          className="text-[#9ca3af] opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>
    </div>
  );
}

// ========================================
// Main Component
// ========================================

export function GraphNodeDetail({
  node,
  tagColors,
  connectedDocuments,
  connectedConcepts,
  onClose,
  onOpenDocument,
  onEditNode,
  onCreateConnection,
  onSelectNode,
}: GraphNodeDetailProps) {
  const getTagColor = (tag: string) => {
    return tagColors.find((tc) => tc.tag === tag)?.color || NODE_COLORS.tag;
  };

  const isDocument = node.type === "document";
  const isTag = node.type === "tag";
  const typeLabel = isDocument ? "문서" : isTag ? "태그" : "용어";

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="w-[380px] h-full bg-[#1e1e1e] border-l border-[#2a2a2a] overflow-hidden flex flex-col flex-shrink-0"
    >
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-5">
          {/* 헤더 */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {isDocument ? (
                  <FileText size={20} className="text-[#fc8658]" />
                ) : isTag ? (
                  <Hash size={20} className="text-[#f97316]" />
                ) : (
                  <BookOpen size={20} className="text-[#a855f7]" />
                )}
                <h2 className="text-lg text-[#e5e5e5] font-medium">
                  {node.label}
                </h2>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-[12px]",
                    isDocument
                      ? "bg-[#fc8658]/20 text-[#fc8658]"
                      : isTag
                      ? "bg-[#f97316]/20 text-[#f97316]"
                      : "bg-[#a855f7]/20 text-[#a855f7]"
                  )}
                >
                  {typeLabel}
                </Badge>
                {node.isNew && (
                  <Badge
                    variant="secondary"
                    className="bg-[#fef3c7]/20 text-[#fbbf24] text-[12px]"
                  >
                    NEW
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-[#9ca3af] hover:text-[#d1d5db] hover:bg-[#2a2a2a]"
                onClick={() => onEditNode?.(node.id)}
              >
                <Edit3 size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-[#9ca3af] hover:text-[#d1d5db] hover:bg-[#2a2a2a]"
                onClick={onClose}
              >
                <X size={18} />
              </Button>
            </div>
          </div>

          <hr className="border-t border-[#2a2a2a]" />

          {/* 메타데이터 */}
          <div className="space-y-2">
            <div className="flex justify-between text-[13px]">
              <span className="text-[#9ca3af]">생성일</span>
              <span className="text-[#d1d5db]">{node.createdAt || "-"}</span>
            </div>
            {node.updatedAt && (
              <div className="flex justify-between text-[13px]">
                <span className="text-[#9ca3af]">수정일</span>
                <span className="text-[#d1d5db]">{node.updatedAt}</span>
              </div>
            )}
          </div>

          {/* 설명 */}
          <div>
            <h3 className="text-[13px] text-[#9ca3af] mb-2">설명</h3>
            <p className="text-[14px] text-[#d1d5db] leading-relaxed">
              {node.description || "설명이 없습니다."}
            </p>
          </div>

          {/* 태그 */}
          {node.tags && node.tags.length > 0 && (
            <div>
              <h3 className="text-[13px] text-[#9ca3af] mb-2">태그</h3>
              <div className="flex flex-wrap gap-1.5">
                {node.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-md bg-[#2a2a2a] text-[12px] text-[#9ca3af] flex items-center gap-1.5"
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getTagColor(tag) }}
                    />
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <hr className="border-t border-[#2a2a2a]" />

          {/* 액션 버튼 */}
          <div className="flex gap-2">
            {isDocument ? (
              <>
                <Button
                  className="flex-1 bg-[#fc8658] hover:bg-[#e67847] text-white"
                  onClick={() => onOpenDocument?.(node.id)}
                >
                  <ExternalLink size={16} className="mr-2" />
                  문서 열기
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-[#fc8658] text-[#fc8658] hover:bg-[#fc8658]/10"
                  onClick={() => onCreateConnection?.(node.id)}
                >
                  <Plus size={16} className="mr-2" />
                  연결 노드 생성
                </Button>
              </>
            ) : isTag ? (
              <>
                <Button
                  variant="outline"
                  className="flex-1 border-[#f97316] text-[#f97316] hover:bg-[#f97316]/10"
                  onClick={() => onCreateConnection?.(node.id)}
                >
                  <Plus size={16} className="mr-2" />
                  연결 추가
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1 text-[#9ca3af] hover:text-[#d1d5db] hover:bg-[#2a2a2a]"
                  onClick={() => onEditNode?.(node.id)}
                >
                  <Edit3 size={16} className="mr-2" />
                  태그 편집
                </Button>
              </>
            ) : (
              <>
                <Button
                  className="flex-1 bg-[#fc8658] hover:bg-[#e67847] text-white"
                  onClick={() => onEditNode?.(node.id)}
                >
                  <Edit3 size={16} className="mr-2" />
                  용어 편집
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-[#fc8658] text-[#fc8658] hover:bg-[#fc8658]/10"
                  onClick={() => onCreateConnection?.(node.id)}
                >
                  <Plus size={16} className="mr-2" />
                  연결 노드 생성
                </Button>
              </>
            )}
          </div>

          <hr className="border-t border-[#2a2a2a]" />

          {/* 연결 정보 탭 */}
          <Tabs defaultValue="documents" className="w-full">
            <TabsList className="w-full bg-transparent border-b border-[#2a2a2a] rounded-none p-0">
              <TabsTrigger
                value="documents"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-[#fc8658] data-[state=active]:text-[#fc8658] data-[state=active]:bg-transparent text-[#9ca3af] text-[13px]"
              >
                연결된 문서 ({connectedDocuments.length})
              </TabsTrigger>
              <TabsTrigger
                value="concepts"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-[#fc8658] data-[state=active]:text-[#fc8658] data-[state=active]:bg-transparent text-[#9ca3af] text-[13px]"
              >
                연결된 용어 ({connectedConcepts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="documents" className="mt-3 space-y-1.5">
              {connectedDocuments.length > 0 ? (
                connectedDocuments.map((doc) => (
                  <ConnectedNodeItem
                    key={doc.id}
                    node={doc}
                    onClick={() => onSelectNode?.(doc.id)}
                  />
                ))
              ) : (
                <p className="text-[13px] text-[#6b7280] py-4 text-center">
                  연결된 문서가 없습니다.
                </p>
              )}
            </TabsContent>

            <TabsContent value="concepts" className="mt-3 space-y-1.5">
              {connectedConcepts.length > 0 ? (
                connectedConcepts.map((concept) => (
                  <ConnectedNodeItem
                    key={concept.id}
                    node={concept}
                    onClick={() => onSelectNode?.(concept.id)}
                  />
                ))
              ) : (
                <p className="text-[13px] text-[#6b7280] py-4 text-center">
                  연결된 용어가 없습니다.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </motion.div>
  );
}

