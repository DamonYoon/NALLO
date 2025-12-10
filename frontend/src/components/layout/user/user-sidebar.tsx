"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, FileText, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

/* ============================================
   Types
   ============================================ */

interface SidebarItem {
  id: string;
  label: string;
  children?: SidebarItem[];
}

interface UserSidebarProps {
  className?: string;
  onItemClick?: (itemId: string) => void;
}

/* ============================================
   Mock Data - Chain 기반 문서 트리
   ============================================ */

const SIDEBAR_DATA: SidebarItem[] = [
  {
    id: "bnb-chain",
    label: "BNB CHAIN",
    children: [
      { id: "bnb-quickstart", label: "BNB Chain Quickstart" },
      { id: "bnb-node-api", label: "Node API" },
      { id: "bnb-web3-data-api", label: "Web3 Data API" },
    ],
  },
  {
    id: "chiliz",
    label: "CHILIZ",
    children: [
      { id: "chiliz-quickstart", label: "Chiliz Quickstart" },
      { id: "chiliz-web3", label: "Web3 Data API" },
    ],
  },
  {
    id: "dogecoin",
    label: "DOGECOIN",
    children: [
      { id: "doge-quickstart", label: "Dogecoin Quickstart" },
      { id: "doge-web3", label: "Web3 Data API" },
    ],
  },
  {
    id: "ethereum",
    label: "ETHEREUM",
    children: [
      {
        id: "quickstart",
        label: "Quickstart",
        children: [
          { id: "eth-quickstart-doc", label: "Ethereum Quickstart" },
          { id: "smart-contract", label: "Smart Contract Deployment" },
          { id: "hardhat-setup", label: "Hardhat Environment Setup" },
        ],
      },
      { id: "node-api-eth", label: "Node API" },
      { id: "web3-data-api-eth", label: "Web3 Data API" },
      { id: "webhook-api", label: "Webhook API" },
      { id: "stream-api", label: "Stream API" },
    ],
  },
  {
    id: "ethereum-classic",
    label: "ETHEREUM CLASSIC",
    children: [
      { id: "etc-quickstart", label: "Ethereum Classic Quickstart" },
      { id: "etc-web3", label: "Web3 Data API" },
    ],
  },
];

/* ============================================
   Subcomponents
   ============================================ */

interface TreeItemProps {
  item: SidebarItem;
  level?: number;
  expandedItems: string[];
  activeItemId?: string;
  onToggle: (id: string) => void;
  onClick?: (id: string) => void;
}

function TreeItem({
  item,
  level = 0,
  expandedItems,
  activeItemId,
  onToggle,
  onClick,
}: TreeItemProps) {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedItems.includes(item.id);
  const isActive = item.id === activeItemId;

  const handleClick = () => {
    if (hasChildren) {
      onToggle(item.id);
    } else {
      onClick?.(item.id);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-all",
          isActive
            ? "bg-emerald-50 text-emerald-700"
            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
          level === 0 && "font-medium text-[11px] text-gray-500 uppercase tracking-wide"
        )}
        style={{ paddingLeft: `${12 + level * 16}px` }}
      >
        {hasChildren ? (
          isExpanded ? (
            <ChevronDown size={14} className="flex-shrink-0" />
          ) : (
            <ChevronRight size={14} className="flex-shrink-0" />
          )
        ) : (
          <FileText size={14} className="flex-shrink-0 text-gray-400" />
        )}
        <span className="flex-1 text-left truncate">{item.label}</span>
      </button>

      {hasChildren && isExpanded && (
        <div className="mt-0.5">
          {item.children!.map((child) => (
            <TreeItem
              key={child.id}
              item={child}
              level={level + 1}
              expandedItems={expandedItems}
              activeItemId={activeItemId}
              onToggle={onToggle}
              onClick={onClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================
   Main Component
   ============================================ */

export function UserSidebar({ className, onItemClick }: UserSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItems, setExpandedItems] = useState<string[]>([
    "ethereum",
    "quickstart",
  ]);
  const [activeItemId, setActiveItemId] = useState<string>("eth-quickstart-doc");

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleItemClick = (id: string) => {
    setActiveItemId(id);
    onItemClick?.(id);
  };

  return (
    <aside
      className={cn(
        "w-[280px] bg-white border-r border-gray-200 flex flex-col",
        className
      )}
    >
      <div className="p-4">
        {/* Search in sidebar */}
        <div className="relative mb-4">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            type="text"
            placeholder="Search in docs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-[13px]"
          />
        </div>
      </div>

      {/* Sidebar Items */}
      <ScrollArea className="flex-1">
        <div className="px-2 pb-4 space-y-1">
          {SIDEBAR_DATA.map((item) => (
            <TreeItem
              key={item.id}
              item={item}
              expandedItems={expandedItems}
              activeItemId={activeItemId}
              onToggle={toggleExpand}
              onClick={handleItemClick}
            />
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}

