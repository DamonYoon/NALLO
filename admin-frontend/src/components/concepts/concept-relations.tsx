"use client";

import { useState } from "react";
import { X, Plus, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Relation types matching backend
export type RelationType = "SUBTYPE_OF" | "SYNONYM_OF" | "PART_OF";

export interface ConceptRelation {
  id: string;
  targetId: string;
  targetTerm: string;
  relationType: RelationType;
}

export interface ConceptSummary {
  id: string;
  term: string;
  lang: string;
}

// Relation type options for dropdown
const relationTypeOptions: {
  value: RelationType;
  label: string;
  description: string;
}[] = [
  {
    value: "SUBTYPE_OF",
    label: "상위 관계",
    description: "이 용어가 속하는 상위 개념",
  },
  {
    value: "PART_OF",
    label: "구성 요소",
    description: "이 용어가 일부분인 전체 개념",
  },
  {
    value: "SYNONYM_OF",
    label: "동의어",
    description: "같은 의미의 다른 용어",
  },
];

// Get badge variant by relation type
const getRelationBadgeVariant = (
  relationType: RelationType
): "default" | "secondary" | "outline" => {
  switch (relationType) {
    case "SUBTYPE_OF":
      return "default";
    case "SYNONYM_OF":
      return "secondary";
    case "PART_OF":
      return "outline";
    default:
      return "secondary";
  }
};

// Get relation type label
const getRelationTypeLabel = (relationType: RelationType): string => {
  const option = relationTypeOptions.find((o) => o.value === relationType);
  return option?.label || relationType;
};

interface RelationRowFormProps {
  availableConcepts: ConceptSummary[];
  conceptLang: string;
  onAdd: (targetId: string, relationType: RelationType) => void;
  disabled?: boolean;
}

function RelationRowForm({
  availableConcepts,
  conceptLang,
  onAdd,
  disabled = false,
}: RelationRowFormProps) {
  const [selectedConcept, setSelectedConcept] = useState<ConceptSummary | null>(
    null
  );
  const [selectedRelationType, setSelectedRelationType] =
    useState<RelationType | null>(null);
  const [conceptPopoverOpen, setConceptPopoverOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter concepts based on selected relation type
  const filteredConcepts = availableConcepts.filter((c) => {
    // For SYNONYM_OF, only show same language concepts
    if (selectedRelationType === "SYNONYM_OF" && c.lang !== conceptLang) {
      return false;
    }
    return c.term.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleAdd = () => {
    if (selectedConcept && selectedRelationType) {
      onAdd(selectedConcept.id, selectedRelationType);
      setSelectedConcept(null);
      setSelectedRelationType(null);
      setSearchQuery("");
    }
  };

  const canAdd = selectedConcept && selectedRelationType && !disabled;

  return (
    <div className="flex items-end gap-2 p-3 border rounded-lg bg-muted/30">
      {/* Concept Selection */}
      <div className="flex-1 space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          용어 선택
        </label>
        <Popover open={conceptPopoverOpen} onOpenChange={setConceptPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              className="w-full justify-start font-normal"
              disabled={disabled}
            >
              {selectedConcept ? (
                <span>{selectedConcept.term}</span>
              ) : (
                <span className="text-muted-foreground">용어 검색...</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-0" align="start">
            <Command>
              <CommandInput
                placeholder="용어 검색..."
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                <CommandEmpty>검색 결과가 없습니다</CommandEmpty>
                <CommandGroup>
                  {filteredConcepts.slice(0, 10).map((concept) => (
                    <CommandItem
                      key={concept.id}
                      value={concept.term}
                      onSelect={() => {
                        setSelectedConcept(concept);
                        setConceptPopoverOpen(false);
                        setSearchQuery("");
                      }}
                    >
                      <span>{concept.term}</span>
                      <Badge variant="outline" className="ml-auto text-xs">
                        {concept.lang}
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Relation Type Selection */}
      <div className="flex-1 space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          관계 선택
        </label>
        <Select
          value={selectedRelationType || ""}
          onValueChange={(value) =>
            setSelectedRelationType(value as RelationType)
          }
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="관계 선택" />
          </SelectTrigger>
          <SelectContent>
            {relationTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Add Button */}
      <Button
        type="button"
        size="icon"
        onClick={handleAdd}
        disabled={!canAdd}
        className="shrink-0"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}

interface ConceptRelationsProps {
  /** Current concept ID (null for new concepts) */
  conceptId?: string | null;
  /** Current concept's language */
  conceptLang?: string;
  /** Current relations */
  relations: ConceptRelation[];
  /** Available concepts to link */
  availableConcepts: ConceptSummary[];
  /** Callback when relation is added */
  onAddRelation: (targetId: string, relationType: RelationType) => void;
  /** Callback when relation is removed */
  onRemoveRelation: (relationId: string) => void;
  /** Disable editing */
  disabled?: boolean;
}

export function ConceptRelations({
  conceptId,
  conceptLang = "ko",
  relations,
  availableConcepts,
  onAddRelation,
  onRemoveRelation,
  disabled = false,
}: ConceptRelationsProps) {
  // Filter out already related concepts
  const availableForRelation = availableConcepts.filter(
    (c) => !relations.some((r) => r.targetId === c.id)
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">용어 관계 설정</CardTitle>
        <CardDescription>
          이 용어와 연결된 다른 용어와의 의미적 관계를 설정하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new relation form */}
        {!disabled && (
          <RelationRowForm
            availableConcepts={availableForRelation}
            conceptLang={conceptLang}
            onAdd={onAddRelation}
            disabled={disabled}
          />
        )}

        {/* Existing relations */}
        {relations.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              설정된 관계 ({relations.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {relations.map((relation) => (
                <Badge
                  key={relation.id}
                  variant={getRelationBadgeVariant(relation.relationType)}
                  className="gap-1.5 pr-1.5 py-1"
                >
                  <span className="text-xs opacity-70">
                    {getRelationTypeLabel(relation.relationType)}:
                  </span>
                  <span>{relation.targetTerm}</span>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => onRemoveRelation(relation.id)}
                      className="ml-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {relations.length === 0 && disabled && (
          <div className="text-sm text-muted-foreground text-center py-4">
            설정된 관계가 없습니다
          </div>
        )}

        {/* Help text */}
        <div className="text-xs text-muted-foreground pt-2 border-t space-y-1">
          <p>
            <strong>상위 관계:</strong> &quot;REST API&quot; → &quot;API&quot;의
            하위 유형
          </p>
          <p>
            <strong>구성 요소:</strong> &quot;엔진&quot; → &quot;자동차&quot;의
            일부
          </p>
          <p>
            <strong>동의어:</strong> &quot;액세스 토큰&quot; ↔
            &quot;접근 토큰&quot; (같은 언어)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
