"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Save, MoreVertical, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ============================================
   Mock Data
   ============================================ */

const MOCK_NOTE = {
  id: "note-1",
  title: "Nodit + Hardhat 배포 가이드",
  content: `# Nodit + Hardhat 배포 가이드

Nodit API와 Hardhat을 사용하여 스마트 컨트랙트를 Ethereum 메인넷에 배포하는 방법을 정리합니다.

## 준비물

- Nodit API Key
- Hardhat 설치
- 배포할 컨트랙트

## 환경 설정

\`\`\`javascript
// hardhat.config.js
require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.20",
  networks: {
    ethereum: {
      url: "https://api.nodit.io/ethereum-mainnet",
      accounts: [process.env.PRIVATE_KEY],
    }
  }
};
\`\`\`

## 배포 스크립트

\`\`\`javascript
const hre = require("hardhat");

async function main() {
  const Contract = await hre.ethers.getContractFactory("MyContract");
  const contract = await Contract.deploy();
  await contract.deployed();
  console.log("Deployed to:", contract.address);
}

main();
\`\`\`

## 참고 문서

- Ethereum Quickstart
- Hardhat Environment Setup
`,
  updatedAt: "2024-12-09T10:30:00",
  tags: ["Ethereum", "Hardhat", "배포"],
  linkedDocs: [
    { id: "eth-quickstart", title: "Ethereum Quickstart" },
    { id: "hardhat-setup", title: "Hardhat Environment Setup" },
  ],
};

/* ============================================
   Component
   ============================================ */

interface NoteDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function NoteDetailPage({ params }: NoteDetailPageProps) {
  const router = useRouter();

  return (
    <div className="flex-1 bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/my-space/notes")}
            className="text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft size={16} className="mr-2" />
            노트 목록
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <MoreVertical size={16} />
          </Button>
          <Button variant="brand" size="sm">
            <Save size={16} className="mr-2" />
            저장
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-8 py-8">
            {/* Title */}
            <input
              type="text"
              defaultValue={MOCK_NOTE.title}
              className="w-full text-3xl font-semibold text-gray-900 border-none outline-none mb-4 placeholder:text-gray-300"
              placeholder="제목 없음"
            />

            {/* Tags */}
            <div className="flex items-center gap-2 mb-6">
              {MOCK_NOTE.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
              <button className="px-2 py-1 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                + 태그 추가
              </button>
            </div>

            {/* Content */}
            <div className="prose prose-gray max-w-none">
              <textarea
                defaultValue={MOCK_NOTE.content}
                className="w-full min-h-[500px] text-gray-700 leading-relaxed border-none outline-none resize-none"
                placeholder="내용을 입력하세요..."
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar - Linked Documents */}
        <aside className="w-64 border-l border-gray-200 bg-gray-50 flex-shrink-0 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-xs text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Link2 size={14} />
              연결된 문서
            </h3>
            <div className="space-y-2">
              {MOCK_NOTE.linkedDocs.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => router.push(`/docs/${doc.id}`)}
                  className="w-full text-left p-3 rounded-lg bg-white border border-gray-200 hover:border-emerald-300 hover:shadow-sm transition-all"
                >
                  <p className="text-sm font-medium text-gray-900">
                    {doc.title}
                  </p>
                </button>
              ))}
            </div>

            <button className="w-full mt-4 p-3 rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors">
              + 문서 연결
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

