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

interface UserLayoutProps {
  children: ReactNode;
  className?: string;
  showSidebar?: boolean;
}

/* ============================================
   Component
   ============================================ */

export function UserLayout({
  children,
  className,
  showSidebar = true,
}: UserLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);

  // /my-space/* 경로에서는 사이드바 숨김
  const isMySpacePath = pathname.startsWith("/my-space");
  const shouldShowSidebar = showSidebar && !isMySpacePath;

  return (
    <div className={cn("size-full flex flex-col bg-white", className)}>
      {/* 1층: Global Platform Bar (다크) */}
      <UserGlobalBar
        onSearchClick={() => console.log("Search")}
        onGraphClick={() => router.push("/my-space/graph")}
        onAskAIClick={() => setIsAIPanelOpen(!isAIPanelOpen)}
      />

      {/* 2층: Service Navigation */}
      <ServiceNavigation activeItem="Getting Started" />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Document Sidebar */}
        {shouldShowSidebar && (
          <UserSidebar 
            onItemClick={(itemId) => router.push(`/docs/${itemId}`)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 bg-white overflow-hidden flex">
          {children}
        </main>

        {/* Ask AI Panel */}
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
