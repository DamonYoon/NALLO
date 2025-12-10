"use client";

import { ReactNode, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { UserGlobalBar } from "./user/user-global-bar";
import { ServiceNavigation } from "./user/service-navigation";
import { UserSidebar } from "./user/user-sidebar";
import { UserAskAIPanel } from "./user/user-ask-ai-panel";
import { cn } from "@/lib/utils";

/* ============================================
   Types
   ============================================ */

type ViewType = "document" | "graph";

interface UserLayoutProps {
  children: ReactNode;
  className?: string;
  showSidebar?: boolean;
  showServiceNavigation?: boolean;
}

/* ============================================
   Component
   ============================================ */

export function UserLayout({
  children,
  className,
  showSidebar = true,
  showServiceNavigation = true,
}: UserLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);

  // 현재 뷰 타입 결정
  const isGraphView = pathname.startsWith("/my-space/graph");
  const currentView: ViewType = isGraphView ? "graph" : "document";

  // /my-space/* 경로에서는 사이드바와 ServiceNavigation 숨김
  const isMySpacePath = pathname.startsWith("/my-space");
  const shouldShowSidebar = showSidebar && !isMySpacePath;
  const shouldShowServiceNav = showServiceNavigation && !isMySpacePath;

  return (
    <div
      className={cn(
        "size-full bg-input pt-0 px-5 pb-5 flex flex-col gap-0.5",
        className
      )}
    >
      {/* 1층: Global Platform Bar (라이트 테마) */}
      <div className="bg-input">
        <UserGlobalBar
          onSearchClick={() => console.log("Search")}
          onGraphClick={() => router.push("/my-space/graph")}
          onAskAIClick={() => setIsAIPanelOpen(!isAIPanelOpen)}
          currentView={currentView}
        />
      </div>

      {/* 2층: Main Horizontal Container */}
      <div className="flex-1 flex gap-0.5 overflow-hidden">
        {/* 메인 콘텐츠 카드 영역 */}
        <div
          className={cn(
            "flex-1 bg-card rounded-lg overflow-hidden shadow-xl flex flex-col min-w-0 transition-all duration-300 ease-in-out"
          )}
        >
          {/* Service Navigation - 문서 뷰에서만 표시 */}
          {shouldShowServiceNav && (
            <ServiceNavigation activeItem="Getting Started" />
          )}

          {/* Sidebar + Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Document Sidebar */}
            {shouldShowSidebar && (
              <UserSidebar
                onItemClick={(itemId) => router.push(`/docs/${itemId}`)}
              />
            )}

            {/* Main Content */}
            <main className="flex-1 bg-muted overflow-auto">{children}</main>
          </div>
        </div>

        {/* Ask AI Panel - Push Layout */}
        <AnimatePresence>
          {isAIPanelOpen && (
            <UserAskAIPanel
              isOpen={isAIPanelOpen}
              onClose={() => setIsAIPanelOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
