"use client";

import { useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  AdminHeader,
  AdminFunctionHeader,
  AdminSidebar,
  AdminAIPanel,
} from "./admin";
import { cn } from "@/lib/utils";

/* ============================================
   Types
   ============================================ */

export type TabType = "문서" | "용어집" | "배포" | "그래프";

// URL과 탭 매핑 (admin prefix 포함)
const TAB_TO_PATH: Record<TabType, string> = {
  문서: "/admin/documents",
  용어집: "/admin/glossary",
  배포: "/admin/deploy",
  그래프: "/admin/graph",
};

// pathname에서 탭 추출 (admin prefix 고려)
function getTabFromPathname(pathname: string): TabType {
  if (pathname.startsWith("/admin/documents")) return "문서";
  if (pathname.startsWith("/admin/glossary")) return "용어집";
  if (pathname.startsWith("/admin/deploy")) return "배포";
  if (pathname.startsWith("/admin/graph")) return "그래프";
  return "문서"; // 기본값
}

interface AdminLayoutProps {
  children: ReactNode;
  showSidebarForTabs?: TabType[];
  darkModeForTabs?: TabType[];
}

/* ============================================
   Component
   ============================================ */

export function AdminLayout({
  children,
  showSidebarForTabs = ["문서"],
  darkModeForTabs = ["그래프"],
}: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);

  // URL에서 현재 탭 결정
  const activeTab = getTabFromPathname(pathname);

  const handleTabChange = (tab: string) => {
    const newPath = TAB_TO_PATH[tab as TabType];
    if (newPath) {
      router.push(newPath);
    }
  };

  const showSidebar = showSidebarForTabs.includes(activeTab);
  const isDarkContent = darkModeForTabs.includes(activeTab);

  return (
    <div className="size-full bg-global pt-0 px-5 pb-5 flex flex-col gap-0.5">
      {/* Global Header - Dark Background Area */}
      <div className="bg-global">
        <AdminHeader onAskAIClick={() => setIsAIPanelOpen(!isAIPanelOpen)} />
      </div>

      {/* Main Horizontal Container */}
      <div className="flex-1 flex gap-0.5 overflow-hidden">
        {/* Main Content Area */}
        <div
          className={cn(
            "flex-1 rounded-lg overflow-hidden shadow-xl flex flex-col min-w-0 transition-colors duration-300",
            isDarkContent ? "dark bg-background" : "bg-card"
          )}
        >
          {/* Function Header (Tabs) */}
          <AdminFunctionHeader
            activeTab={activeTab}
            onTabChange={handleTabChange}
            variant={isDarkContent ? "dark" : "light"}
          />

          {/* Sidebar + Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar - Conditional based on tab */}
            {showSidebar && <AdminSidebar />}

            {/* Main Content Area */}
            <main
              className={cn(
                "flex-1 overflow-auto",
                isDarkContent ? "bg-background" : "bg-muted"
              )}
            >
              {children}
            </main>
          </div>
        </div>

        {/* AI Panel */}
        <AdminAIPanel
          isOpen={isAIPanelOpen}
          onClose={() => setIsAIPanelOpen(false)}
        />
      </div>
    </div>
  );
}
