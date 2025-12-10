"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck, Share2, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

/* ============================================
   Mock Document Data
   ============================================ */

const MOCK_DOCUMENT = {
  id: "eth-quickstart",
  title: "Ethereum Quickstart",
  description: "Take your first steps with the Ethereum API on NODIT.",
  breadcrumb: ["ETHEREUM", "Quickstart"],
  lastUpdated: "2024-12-09",
  readTime: "5 min read",
  tags: ["Ethereum", "Quickstart", "API"],
  content: `
이더리움(Ethereum)은 블록체인 기술을 기반으로 한 탈중앙 플랫폼으로, 스마트 컨트랙트를 실행할 수 있는 환경을 제공합니다.

## Introduction

The Ethereum API provides a simple interface to state-of-the-art blockchain technology for decentralized applications, smart contracts, and more.

### What you'll learn

- How to create an Ethereum API key
- How to make your first API request
- How to deploy a smart contract

## Prerequisites

Before you begin, make sure you have:

- A NODIT account
- Basic knowledge of JavaScript or Python
- Node.js installed (version 16 or higher)

## Create and Export an API Key

Before you begin, create an API key in the dashboard.

\`\`\`bash
# Add to your .env file
NODIT_API_KEY="your_api_key_here"
ETHEREUM_NETWORK="mainnet"
\`\`\`

## Install the SDK

\`\`\`javascript
import { NoditClient } from '@nodit/sdk';

const client = new NoditClient({
  apiKey: process.env.NODIT_API_KEY,
  network: 'ethereum-mainnet'
});

async function getLatestBlock() {
  const block = await client.ethereum.getLatestBlock();
  console.log('Latest Block:', block.number);
  return block;
}

getLatestBlock();
\`\`\`

## Next Steps

- **Smart Contract Deployment** - Learn advanced deployment techniques
- **Hardhat Environment Setup** - Set up a complete development environment
- **Web3 Data API** - Query blockchain data efficiently
  `,
  tableOfContents: [
    { id: "introduction", label: "Introduction", level: 1 },
    { id: "prerequisites", label: "Prerequisites", level: 1 },
    { id: "create-api-key", label: "Create API Key", level: 1 },
    { id: "install-sdk", label: "Install SDK", level: 1 },
    { id: "next-steps", label: "Next Steps", level: 1 },
  ],
};

/* ============================================
   Component
   ============================================ */

interface DocsPageProps {
  params: Promise<{ slug?: string[] }>;
}

export default function DocsPage({ params }: DocsPageProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: 실제 즐겨찾기 로직 구현
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[840px] mx-auto px-12 py-12">
          {/* Document Header */}
          <div className="mb-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[13px] text-gray-500 mb-4">
              {MOCK_DOCUMENT.breadcrumb.map((item, index) => (
                <span key={item}>
                  {index > 0 && <span className="mx-2">/</span>}
                  {item}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-4xl font-semibold text-gray-900 mb-3">
              {MOCK_DOCUMENT.title}
            </h1>

            {/* Description */}
            <p className="text-base text-gray-600 mb-5">
              {MOCK_DOCUMENT.description}
            </p>

            {/* Meta Info */}
            <div className="flex items-center gap-4 mb-5">
              <div className="flex items-center gap-1.5 text-[13px] text-gray-500">
                <Clock size={14} />
                <span>{MOCK_DOCUMENT.readTime}</span>
              </div>
              <div className="text-[13px] text-gray-500">
                Last updated: {MOCK_DOCUMENT.lastUpdated}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {MOCK_DOCUMENT.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                >
                  <Tag size={12} className="mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
              <Button
                variant={isBookmarked ? "brand" : "outline"}
                size="sm"
                onClick={handleBookmark}
                className="gap-2"
              >
                {isBookmarked ? (
                  <BookmarkCheck size={16} />
                ) : (
                  <Bookmark size={16} />
                )}
                <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
              </Button>

              <Button variant="outline" size="sm" className="gap-2">
                <Share2 size={16} />
                <span>Share</span>
              </Button>
            </div>
          </div>

          {/* Markdown Content */}
          <div className="prose prose-gray max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {MOCK_DOCUMENT.content}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Table of Contents */}
      <aside className="w-60 border-l border-gray-200 bg-gray-50/50 flex-shrink-0">
        <ScrollArea className="h-full">
          <div className="p-6 sticky top-0">
            <h3 className="text-xs text-gray-500 uppercase tracking-wide mb-3">
              Table of Contents
            </h3>
            <nav className="space-y-2">
              {MOCK_DOCUMENT.tableOfContents.map((item, index) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`block text-[13px] transition-colors ${
                    index === 0
                      ? "text-emerald-600 hover:text-emerald-700"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </ScrollArea>
      </aside>
    </div>
  );
}

