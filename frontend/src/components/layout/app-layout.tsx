"use client";

/**
 * AppLayout - Legacy compatibility wrapper
 *
 * 이 컴포넌트는 이전 버전과의 호환성을 위해 유지됩니다.
 * 새 코드에서는 직접 AdminLayout 또는 UserLayout을 사용하세요.
 *
 * URL 기반 라우팅:
 * - /admin/* → AdminLayout
 * - / (기타) → UserLayout
 */

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { UserLayout } from "./user-layout";
import { AdminLayout, TabType } from "./admin-layout";

/* ============================================
   Types
   ============================================ */

interface AppLayoutProps {
  children: ReactNode;
  showSidebarForTabs?: TabType[];
  darkModeForTabs?: TabType[];
  showUserSidebar?: boolean;
}

/* ============================================
   Component
   ============================================ */

export function AppLayout({
  children,
  showSidebarForTabs = ["문서"],
  darkModeForTabs = ["그래프"],
  showUserSidebar = true,
}: AppLayoutProps) {
  const pathname = usePathname();

  // URL 기반으로 레이아웃 결정
  const isAdminPath = pathname.startsWith("/admin");

  if (isAdminPath) {
    return (
      <AdminLayout
        showSidebarForTabs={showSidebarForTabs}
        darkModeForTabs={darkModeForTabs}
      >
        {children}
      </AdminLayout>
    );
  }

  return <UserLayout showSidebar={showUserSidebar}>{children}</UserLayout>;
}

// Re-export types for convenience
export type { TabType };
