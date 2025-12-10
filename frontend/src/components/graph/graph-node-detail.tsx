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
import { IconButton } from "@/components/ui/icon-button";
import { StatusBadge, type DocumentStatus } from "@/components/ui/status-badge";
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
      className="p-2.5 bg-surface rounded-md hover:bg-surface-hover transition-colors cursor-pointer group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            {node.type === "document" ? (
              <FileText size={14} className="text-node-document" />
            ) : (
              <BookOpen size={14} className="text-node-concept" />
            )}
            <span className="text-[13px] text-text-primary">{node.label}</span>
          </div>
          {node.status && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-text-tertiary">
                {node.type === "document" ? "Document" : "Concept"}
              </span>
              <span className="text-[11px] text-text-disabled">•</span>
              <StatusBadge status={node.status as DocumentStatus} className="text-[11px] px-1.5 py-0" />
            </div>
          )}
        </div>
        <ExternalLink
          size={14}
          className="text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity"
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
      className="w-panel h-full bg-background border-l border-border overflow-hidden flex flex-col flex-shrink-0"
    >
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-5">
          {/* 헤더 */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {isDocument ? (
                  <FileText size={20} className="text-node-document" />
                ) : isTag ? (
                  <Hash size={20} className="text-node-tag" />
                ) : (
                  <BookOpen size={20} className="text-node-concept" />
                )}
                <h2 className="text-lg text-text-primary font-medium">
                  {node.label}
                </h2>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge
                  variant={isDocument ? "document" : isTag ? "tag" : "concept"}
                  className="text-[12px]"
                >
                  {typeLabel}
                </Badge>
                {node.isNew && (
                  <Badge variant="in-review" className="text-[12px]">
                    NEW
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <IconButton
                variant="muted"
                size="sm"
                onClick={() => onEditNode?.(node.id)}
                tooltip="편집"
              >
                <Edit3 size={16} />
              </IconButton>
              <IconButton
                variant="muted"
                size="sm"
                onClick={onClose}
                tooltip="닫기"
              >
                <X size={18} />
              </IconButton>
            </div>
          </div>

          <hr className="border-t border-border" />

          {/* 메타데이터 */}
          <div className="space-y-2">
            <div className="flex justify-between text-[13px]">
              <span className="text-text-tertiary">생성일</span>
              <span className="text-text-secondary">{node.createdAt || "-"}</span>
            </div>
            {node.updatedAt && (
              <div className="flex justify-between text-[13px]">
                <span className="text-text-tertiary">수정일</span>
                <span className="text-text-secondary">{node.updatedAt}</span>
              </div>
            )}
          </div>

          {/* 설명 */}
          <div>
            <h3 className="text-[13px] text-text-tertiary mb-2">설명</h3>
            <p className="text-[14px] text-text-secondary leading-relaxed">
              {node.description || "설명이 없습니다."}
            </p>
          </div>

          {/* 태그 */}
          {node.tags && node.tags.length > 0 && (
            <div>
              <h3 className="text-[13px] text-text-tertiary mb-2">태그</h3>
              <div className="flex flex-wrap gap-1.5">
                {node.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-md bg-surface text-[12px] text-text-tertiary flex items-center gap-1.5"
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

          <hr className="border-t border-border" />

          {/* 액션 버튼 */}
          <div className="flex gap-2">
            {isDocument ? (
              <>
                <Button
                  variant="brand"
                  className="flex-1"
                  onClick={() => onOpenDocument?.(node.id)}
                >
                  <ExternalLink size={16} className="mr-2" />
                  문서 열기
                </Button>
                <Button
                  variant="brand-outline"
                  className="flex-1"
                  onClick={() => onCreateConnection?.(node.id)}
                >
                  <Plus size={16} className="mr-2" />
                  연결 노드 생성
                </Button>
              </>
            ) : isTag ? (
              <>
                <Button
                  variant="brand-outline"
                  className="flex-1"
                  onClick={() => onCreateConnection?.(node.id)}
                >
                  <Plus size={16} className="mr-2" />
                  연결 추가
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1 text-text-tertiary hover:text-text-secondary"
                  onClick={() => onEditNode?.(node.id)}
                >
                  <Edit3 size={16} className="mr-2" />
                  태그 편집
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="brand"
                  className="flex-1"
                  onClick={() => onEditNode?.(node.id)}
                >
                  <Edit3 size={16} className="mr-2" />
                  용어 편집
                </Button>
                <Button
                  variant="brand-outline"
                  className="flex-1"
                  onClick={() => onCreateConnection?.(node.id)}
                >
                  <Plus size={16} className="mr-2" />
                  연결 노드 생성
                </Button>
              </>
            )}
          </div>

          <hr className="border-t border-border" />

          {/* 연결 정보 탭 */}
          <Tabs defaultValue="documents" className="w-full">
            <TabsList className="w-full bg-transparent border-b border-border rounded-none p-0">
              <TabsTrigger
                value="documents"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-brand data-[state=active]:text-brand data-[state=active]:bg-transparent text-text-tertiary text-[13px]"
              >
                연결된 문서 ({connectedDocuments.length})
              </TabsTrigger>
              <TabsTrigger
                value="concepts"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-brand data-[state=active]:text-brand data-[state=active]:bg-transparent text-text-tertiary text-[13px]"
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
                <p className="text-[13px] text-text-disabled py-4 text-center">
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
                <p className="text-[13px] text-text-disabled py-4 text-center">
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
