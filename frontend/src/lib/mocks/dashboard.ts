import {
  FileText,
  Link2,
  Clock,
  CheckCircle,
  AlertTriangle,
  LucideIcon,
} from "lucide-react";

/* ============================================
   Types
   ============================================ */

export type DocumentStatus = "Draft" | "In Review" | "Done" | "Publish";
export type MetricStatus = "success" | "warning" | "error";

export interface RecentDocument {
  id: string;
  title: string;
  editor: string;
  time: string;
  status: DocumentStatus;
  version: string;
}

export interface AITask {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface HealthMetric {
  id: string;
  label: string;
  value: number;
  status: MetricStatus;
  icon: LucideIcon;
}

export interface OntologyInsight {
  connectivityScore: number;
  hubDocuments: number;
  averageDensity: number;
  clusterCount: number;
}

/* ============================================
   Mock Data
   ============================================ */

export const mockRecentDocuments: RecentDocument[] = [
  {
    id: "1",
    title: "Using Nodit with AI & LLM Tools",
    editor: "Bailey",
    time: "2시간 전",
    status: "In Review",
    version: "v2.1.0",
  },
  {
    id: "2",
    title: "arbitrum-eth_blocknumber",
    editor: "Damon",
    time: "5시간 전",
    status: "Publish",
    version: "v1.3.2",
  },
  {
    id: "3",
    title: "Polygon Quickstart",
    editor: "Jonny",
    time: "1일 전",
    status: "Draft",
    version: "v0.8.1",
  },
  {
    id: "4",
    title: "Webhook Security & Reliability",
    editor: "Ben",
    time: "2025.12.04",
    status: "Done",
    version: "v1.3.5",
  },
];

export const mockAITasks: AITask[] = [
  {
    id: "1",
    title: "용어 연결 필요",
    description: '"Elastic Node" 문서에 용어 연결이 필요할 수 있습니다',
    icon: Link2,
  },
  {
    id: "2",
    title: "중복 가능성 감지",
    description: '"시작하기"와 "개요" 문서 간 유사한 내용 발견',
    icon: FileText,
  },
  {
    id: "3",
    title: "용어집 불일치",
    description: '"API 엔드포인트" 용어가 4개 문서에서 일관되지 않게 사용됨',
    icon: AlertTriangle,
  },
];

export const mockHealthMetrics: HealthMetric[] = [
  {
    id: "1",
    label: "고립된 문서",
    value: 3,
    status: "warning",
    icon: FileText,
  },
  { id: "2", label: "깨진 링크", value: 5, status: "error", icon: Link2 },
  { id: "3", label: "오래된 문서", value: 8, status: "warning", icon: Clock },
  {
    id: "4",
    label: "용어집 불일치",
    value: 2,
    status: "success",
    icon: CheckCircle,
  },
];

export const mockOntologyInsight: OntologyInsight = {
  connectivityScore: 82,
  hubDocuments: 12,
  averageDensity: 4.8,
  clusterCount: 5,
};
