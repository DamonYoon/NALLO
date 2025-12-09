'use client';

import { FileText, BookOpen, Rocket, Network } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FunctionHeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const tabs = [
  { name: '문서', icon: FileText },
  { name: '용어집', icon: BookOpen },
  { name: '배포', icon: Rocket },
  { name: '그래프', icon: Network },
];

export function FunctionHeader({
  activeTab = '문서',
  onTabChange,
}: FunctionHeaderProps) {
  const isDarkMode = activeTab === '그래프';

  return (
    <div
      className={cn(
        'border-b h-[45px] flex items-center px-5',
        isDarkMode
          ? 'bg-[#1e1e1e] border-[#2a2a2a]'
          : 'bg-transparent border-border'
      )}
    >
      <div className="flex items-center gap-1 h-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.name;

          return (
            <button
              key={tab.name}
              onClick={() => onTabChange?.(tab.name)}
              className={cn(
                'relative flex items-center gap-2 px-5 h-full transition-colors',
                isDarkMode
                  ? isActive
                    ? 'text-brand'
                    : 'text-[#9ca3af] hover:text-[#d1d5db]'
                  : isActive
                    ? 'text-brand'
                    : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon size={16} />
              <span className="text-sm">{tab.name}</span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

