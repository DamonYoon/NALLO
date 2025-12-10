// Shared Components - NALLO Admin Frontend
// 이 파일은 프로젝트 전반에서 사용되는 공통 컴포넌트들을 내보냅니다.

// Dialog & Modal
export { ConfirmDialog, useConfirmDialog } from "./confirm-dialog";
export type { ConfirmVariant } from "./confirm-dialog";

// Data Display
export { DataTable } from "./data-table";
export { DataTableColumnHeader } from "./data-table-column-header";
export { EmptyState } from "./empty-state";

// Input & Upload
export { FileUploader } from "./file-uploader";
export { SearchInput } from "./search-input";

// Status & Badges
export {
  StatusBadge,
  statusBadgeVariants,
  getStatusFromString,
} from "./status-badge";
export type { StatusBadgeStatus, StatusBadgeProps } from "./status-badge";

// Headers
export { PageHeader, PageContainer } from "./page-header";
export type { PageHeaderProps, PageContainerProps } from "./page-header";

export { SectionHeader, SectionCard } from "./section-header";
export type { SectionHeaderProps, SectionCardProps } from "./section-header";

// Charts & Metrics
export { CircularProgress, ScoreCircle } from "./circular-progress";
export type { CircularProgressProps, ScoreCircleProps } from "./circular-progress";

export {
  MetricCard,
  MetricCardGrid,
  StatItem,
  StatRow,
} from "./metric-card";
export type {
  MetricCardProps,
  MetricCardGridProps,
  MetricStatus,
  StatItemProps,
  StatRowProps,
} from "./metric-card";

// Action Items
export { ActionListItem, ActionList } from "./action-list-item";
export type { ActionListItemProps, ActionListProps } from "./action-list-item";

// Progress
export { ProgressSteps, ProgressIndicator } from "./progress-steps";
export type {
  ProgressStepsProps,
  ProgressIndicatorProps,
  Step,
  StepStatus,
} from "./progress-steps";

