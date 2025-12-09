'use client';

import { useState, ReactNode } from 'react';
import { GlobalHeader } from './global-header';
import { FunctionHeader } from './function-header';
import { Sidebar } from './sidebar';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('문서');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const showSidebar = activeTab === '문서';
  const isDarkContent = activeTab === '그래프';

  return (
    <div className="size-full bg-global pt-0 px-5 pb-5 flex flex-col gap-[2px]">
      {/* Global Header - Dark Background Area */}
      <div className="bg-global">
        <GlobalHeader onAskAIClick={() => setIsAIPanelOpen(!isAIPanelOpen)} />
      </div>

      {/* Main Horizontal Container */}
      <div className="flex-1 flex gap-[2px] overflow-hidden">
        {/* White Main Content Area */}
        <div
          className={cn(
            'flex-1 rounded-lg overflow-hidden shadow-xl flex flex-col min-w-0 transition-all duration-300 ease-in-out',
            isDarkContent ? 'bg-[#1e1e1e]' : 'bg-white'
          )}
        >
          {/* Function Header (Tabs) */}
          <FunctionHeader activeTab={activeTab} onTabChange={handleTabChange} />

          {/* Sidebar + Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar - Only show for 문서 tab */}
            {showSidebar && <Sidebar />}

            {/* Main Content Area */}
            <main
              className={cn(
                'flex-1 overflow-auto',
                isDarkContent ? 'bg-[#1e1e1e]' : 'bg-muted'
              )}
            >
              {children}
            </main>
          </div>
        </div>

        {/* AI Panel Placeholder - Future Implementation */}
        {isAIPanelOpen && (
          <div className="w-[400px] bg-white rounded-lg shadow-xl flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="font-medium">ASK AI</span>
              <button
                onClick={() => setIsAIPanelOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 p-4">
              <p className="text-sm text-muted-foreground">
                AI 기능은 추후 구현 예정입니다.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

