'use client';

import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarProps {
  className?: string;
}

const navigationItems = [
  'Getting Started',
  'Recipes',
  'API Reference',
  'GraphQL',
];

const documentTree = [
  {
    name: 'Welcome to Nodit',
    count: 14,
    expanded: true,
    children: [{ name: 'Overview' }],
  },
  {
    name: 'Features',
    count: 6,
    expanded: true,
    children: [
      { name: 'Elastic Node' },
      { name: 'Dedicated Node' },
      { name: 'Web3 Data API' },
    ],
  },
  {
    name: 'Learn & Run',
    count: 18,
    expanded: false,
    children: [],
  },
  {
    name: 'FAQ',
    count: 5,
    expanded: false,
    children: [],
  },
];

export function Sidebar({ className }: SidebarProps) {
  const [activeNav, setActiveNav] = useState('Getting Started');
  const [expandedItems, setExpandedItems] = useState<string[]>([
    'Welcome to Nodit',
    'Features',
  ]);

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  };

  return (
    <aside
      className={cn(
        'w-[260px] bg-white border-r border-sidebar-border flex flex-col',
        className
      )}
    >
      {/* Navigation Section */}
      <div className="px-4 py-[10px] border-b border-sidebar-border">
        <div className="mb-3">
          <span className="text-xs text-muted-foreground">Navigation</span>
        </div>

        <div className="flex flex-col gap-1">
          {navigationItems.map((item) => (
            <button
              key={item}
              onClick={() => setActiveNav(item)}
              className={cn(
                'relative text-[13px] text-left transition-colors px-2 py-[5px] rounded',
                activeNav === item
                  ? 'bg-accent text-brand'
                  : 'text-foreground hover:text-brand hover:bg-muted'
              )}
            >
              {activeNav === item && (
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-brand rounded-r" />
              )}
              <span className={activeNav === item ? 'ml-1' : ''}>
                {item}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Document Tree */}
      <ScrollArea className="flex-1">
        {/* Navigation Badge */}
        <div className="px-4 pt-[14px] pb-[10px]">
          <div className="inline-flex items-center px-2 py-[3px] bg-secondary rounded-full">
            <span className="text-[10px] text-muted-foreground">
              {activeNav}
            </span>
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="flex flex-col gap-2">
            {documentTree.map((item) => {
              const isExpanded = expandedItems.includes(item.name);

              return (
                <div key={item.name} className="flex flex-col gap-[6px]">
                  {/* Parent Item */}
                  <div
                    onClick={() => toggleExpand(item.name)}
                    className="flex items-center gap-[6px] hover:bg-muted rounded px-[6px] py-1 -mx-[6px] group cursor-pointer"
                  >
                    <div className="flex items-center gap-1 flex-1">
                      <span className="text-[13px] text-foreground group-hover:text-brand">
                        {item.name}
                      </span>
                      <span className="text-[11px] text-brand">
                        {item.count}
                      </span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-[2px]">
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-[2px] hover:bg-border rounded"
                      >
                        <Plus size={12} className="text-muted-foreground" />
                      </button>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-[2px] hover:bg-border rounded"
                      >
                        <MoreHorizontal
                          size={12}
                          className="text-muted-foreground"
                        />
                      </button>
                    </div>
                    {isExpanded ? (
                      <ChevronDown size={14} className="text-foreground" />
                    ) : (
                      <ChevronRight size={14} className="text-foreground" />
                    )}
                  </div>

                  {/* Children */}
                  {isExpanded && item.children.length > 0 && (
                    <div className="ml-[6px] pl-2 border-l border-border flex flex-col gap-1">
                      {item.children.map((child) => (
                        <div
                          key={child.name}
                          className="flex items-center justify-between group hover:bg-muted rounded px-1 py-[2px] -mx-1 cursor-pointer"
                        >
                          <span className="text-[13px] text-foreground text-left group-hover:text-brand flex-1">
                            {child.name}
                          </span>
                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-[2px]">
                            <button className="p-[2px] hover:bg-border rounded">
                              <Plus
                                size={12}
                                className="text-muted-foreground"
                              />
                            </button>
                            <button className="p-[2px] hover:bg-border rounded">
                              <MoreHorizontal
                                size={12}
                                className="text-muted-foreground"
                              />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>

      {/* Add Category */}
      <div className="h-12 bg-muted border-t border-border flex items-center justify-center">
        <button className="text-xs text-muted-foreground hover:text-foreground">
          + 카테고리 추가
        </button>
      </div>
    </aside>
  );
}

