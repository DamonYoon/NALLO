"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ui/icon-button";
import {
  X,
  Sparkles,
  CheckCircle2,
  Network,
  Settings,
  Send,
  Zap,
  Paperclip,
  Code2,
  Lightbulb,
  FileText,
  AlertCircle,
  AlertTriangle,
  Edit3,
  GitBranch,
  Target,
  Layers,
  Brain,
} from "lucide-react";

/* ============================================
   Types
   ============================================ */

type AIPanelTab = "assistant" | "linter" | "graph" | "settings";
type AIModel = "gpt-4" | "gpt-3.5-turbo" | "claude-3.5-sonnet" | "gemini-pro";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface PromptCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  prompt: string;
}

interface AdminAIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentDocumentPath?: string;
}

/* ============================================
   Constants
   ============================================ */

const TABS: { id: AIPanelTab; label: string; icon: React.ReactNode }[] = [
  { id: "assistant", label: "Assistant", icon: <Sparkles size={14} /> },
  { id: "linter", label: "Linter", icon: <CheckCircle2 size={14} /> },
  { id: "graph", label: "Graph", icon: <Network size={14} /> },
  { id: "settings", label: "Settings", icon: <Settings size={14} /> },
];

const PROMPT_CARDS: PromptCard[] = [
  {
    icon: <Sparkles size={18} className="text-brand" />,
    title: "Quickstart 예제 생성",
    description: "API 기능에 적합한 Quickstart 예제를 만들어줘",
    prompt: "API 기능에 적합한 Quickstart 예제를 만들어줘",
  },
  {
    icon: <Lightbulb size={18} className="text-brand" />,
    title: "주요 개념 정리",
    description: "이 기능을 설명할 때 필요한 주요 개념을 먼저 정리해줘",
    prompt: "이 기능을 설명할 때 필요한 주요 개념을 먼저 정리해줘",
  },
  {
    icon: <Code2 size={18} className="text-brand" />,
    title: "다중 언어 코드 생성",
    description: "Python과 JavaScript 버전의 예제 코드를 동시에 생성해줘",
    prompt: "Python과 JavaScript 버전의 예제 코드를 동시에 생성해줘",
  },
];

const AI_MODELS: { value: AIModel; label: string }[] = [
  { value: "gpt-4", label: "GPT-4" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  { value: "claude-3.5-sonnet", label: "Claude 3.5" },
  { value: "gemini-pro", label: "Gemini Pro" },
];

/* ============================================
   Component
   ============================================ */

export function AdminAIPanel({
  isOpen,
  onClose,
  currentDocumentPath,
}: AdminAIPanelProps) {
  const [activeTab, setActiveTab] = useState<AIPanelTab>("assistant");
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState<AIModel>("gpt-4");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showGreeting, setShowGreeting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // Show greeting with delay when panel opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const timer = setTimeout(() => setShowGreeting(true), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, messages.length]);

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages([...messages, { role: "user", content: input.trim() }]);
    setInput("");
    setIsLoading(true);

    // TODO(TASK-XXX): AI API 연동 구현
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "답변을 생성하고 있습니다. 문서 구조와 용어 온톨로지를 분석 중입니다...",
        },
      ]);
      setIsLoading(false);
    }, 1500);
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div
      className={cn(
        "bg-global rounded-lg shadow-xl flex flex-col flex-shrink-0 overflow-hidden",
        "transition-all duration-300 ease-out",
        isOpen
          ? "w-[440px] opacity-100 translate-x-0"
          : "w-0 opacity-0 translate-x-full pointer-events-none"
      )}
    >
      <div className="w-[440px] h-full flex flex-col">
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-[15px] text-white font-medium">NALLO AI</h2>
              <p className="text-[11px] text-white/50">Document Intelligence</p>
            </div>
          </div>
          <IconButton
            variant="muted"
            size="sm"
            onClick={onClose}
            tooltip="닫기"
          >
            <X size={18} className="text-white" />
          </IconButton>
        </div>

        {/* Tabs */}
        <div className="flex items-center px-4 pt-3 gap-1 border-b border-[rgba(255,255,255,0.08)]">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-t-md text-xs transition-all relative",
                activeTab === tab.id
                  ? "text-white"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              )}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeTab === "assistant" && (
            <AssistantTab
              messages={messages}
              isLoading={isLoading}
              showGreeting={showGreeting}
              messagesEndRef={messagesEndRef}
              onPromptClick={handlePromptClick}
            />
          )}
          {activeTab === "linter" && <LinterTab />}
          {activeTab === "graph" && <GraphTab />}
          {activeTab === "settings" && <SettingsTab />}
        </div>

        {/* Input Bar - Only for Assistant Tab */}
        {activeTab === "assistant" && (
          <div className="border-t border-[rgba(255,255,255,0.08)] px-3 py-2.5">
            <div className="relative rounded-xl border border-[rgba(255,255,255,0.15)] px-4 py-3.5 focus-within:border-brand transition-colors min-h-[120px]">
              {/* Top Row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-[11px] text-white/40 min-h-[18px]">
                  {currentDocumentPath && (
                    <>
                      <FileText size={12} />
                      <span>{currentDocumentPath}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors">
                    <Zap size={14} className="text-white/50" />
                  </button>
                  <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors">
                    <Paperclip size={14} className="text-white/50" />
                  </button>
                  <button
                    className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                    onClick={() => setActiveTab("settings")}
                  >
                    <Settings size={14} className="text-white/50" />
                  </button>
                </div>
              </div>

              {/* Input */}
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  // 한글 IME 조합 중에는 Enter 무시 (중복 입력 방지)
                  if (e.nativeEvent.isComposing) return;
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="질문을 입력하거나 문서 생성을 요청하세요…"
                className="w-full bg-transparent text-[13px] text-white placeholder:text-white/40 focus:outline-none resize-none min-h-[40px] max-h-[120px] mb-2.5"
                rows={2}
              />

              {/* Bottom Row */}
              <div className="flex items-center justify-between">
                <div className="relative group">
                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/8 hover:bg-white/12 transition-colors">
                    <Brain size={14} className="text-white/60" />
                    <span className="text-xs text-white/70">
                      {AI_MODELS.find((m) => m.value === selectedModel)?.label}
                    </span>
                  </button>
                  {/* pb-2로 hover 영역 확장하여 버튼과 연결 */}
                  <div className="absolute bottom-full left-0 pb-2 hidden group-hover:block z-10">
                    <div className="bg-[#3b3b3b] rounded-lg p-1.5 shadow-xl flex flex-col gap-0.5 min-w-[120px]">
                      {AI_MODELS.map((model) => (
                        <button
                          key={model.value}
                          onClick={() => setSelectedModel(model.value)}
                          className={cn(
                            "px-3 py-1.5 rounded-md text-xs text-left transition-colors",
                            selectedModel === model.value
                              ? "bg-brand text-white"
                              : "text-white/80 hover:bg-white/10"
                          )}
                        >
                          {model.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 rounded-lg bg-brand hover:bg-brand/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send size={16} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================
   Sub Components
   ============================================ */

function AssistantTab({
  messages,
  isLoading,
  showGreeting,
  messagesEndRef,
  onPromptClick,
}: {
  messages: Message[];
  isLoading: boolean;
  showGreeting: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onPromptClick: (prompt: string) => void;
}) {
  return (
    <>
      {/* Prompt Cards & Greeting */}
      {messages.length === 0 && (
        <div className="px-5 py-5 overflow-auto">
          <p className="text-xs text-white/60 mb-4">빠른 시작</p>
          <div className="grid grid-cols-1 gap-2.5 mb-6">
            {PROMPT_CARDS.map((card, idx) => (
              <button
                key={idx}
                onClick={() => onPromptClick(card.prompt)}
                className="group text-left px-4 py-3 rounded-[10px] bg-white/8 border border-white/12 hover:border-brand hover:bg-brand/12 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{card.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-white mb-1">
                      {card.title}
                    </div>
                    <div className="text-[11px] text-white/50 leading-relaxed">
                      {card.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Greeting */}
          {showGreeting && (
            <div className="px-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <h4 className="text-[15px] text-white mb-2.5 leading-normal">
                안녕하세요! 저는 NALLO AI Assistant입니다.
              </h4>
              <p className="text-[13px] text-white/80 leading-relaxed mb-3">
                문서 생성부터 구조 제안, 내용 개선, 용어 연결까지 문서 작업을 더
                똑똑하게 할 수 있도록 도와드릴게요.
              </p>
              <p className="text-[13px] text-white/80 leading-relaxed">
                제가 제안하는 변경사항은 승인 전까지 문서에 반영되지 않으니
                편하게 요청해보세요. 어떤 문서를 만들어볼까요?
              </p>
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div className="flex-1 overflow-auto px-5 py-5">
          <div className="flex flex-col gap-6">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex flex-col",
                  message.role === "user" ? "items-end" : "items-start"
                )}
              >
                {message.role === "user" ? (
                  <div className="px-4 py-3 rounded-xl bg-transparent border-2 border-white/20 text-white max-w-[90%]">
                    <p className="text-[13px] leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <div className="w-5 h-5 rounded-full bg-brand flex items-center justify-center">
                        <Sparkles size={11} className="text-white" />
                      </div>
                      <span className="text-[11px] text-white/50">
                        AI Assistant
                      </span>
                    </div>
                    <p className="text-[13px] leading-relaxed text-white/90">
                      {message.content}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {/* Loading */}
            {isLoading && (
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <div className="w-5 h-5 rounded-full bg-brand flex items-center justify-center">
                    <Sparkles size={11} className="text-white" />
                  </div>
                  <span className="text-[11px] text-white/50">
                    AI Assistant
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                  <span className="text-xs text-white/50">생성 중...</span>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>
      )}
    </>
  );
}

function LinterTab() {
  return (
    <div className="flex-1 overflow-auto px-5 py-5">
      <div className="space-y-5">
        {/* Header */}
        <div>
          <h3 className="text-[15px] text-white mb-1.5">AI Linter</h3>
          <p className="text-xs text-white/50 leading-relaxed">
            문장 스타일, 용어 일관, 오류/경고 항목을 검사합니다.
          </p>
        </div>

        {/* Run Button */}
        <button className="w-full px-4 py-3 bg-brand hover:bg-brand/90 text-white rounded-[10px] text-[13px] transition-colors flex items-center justify-center gap-2">
          <CheckCircle2 size={16} />
          전체 문서 검사 실행
        </button>

        {/* Style Guide */}
        <Section
          icon={<Edit3 size={16} className="text-blue-400" />}
          title="Style Guide"
          bgColor="bg-blue-400/15"
          borderColor="border-blue-400/30"
        >
          <p className="text-xs text-white/70 leading-relaxed mb-3">
            관리자가 설정한 문서 작성 규칙을 기반으로 스타일을 검사합니다.
          </p>
          <div className="space-y-2">
            {[
              "• 경어체/반말체 통일",
              "• 설명 문장 스타일 일관성",
              "• 문단 길이 적정성",
              "• 용어 표기법 준수",
            ].map((item, idx) => (
              <div key={idx} className="text-[11px] text-white/60">
                {item}
              </div>
            ))}
          </div>
        </Section>

        {/* Errors */}
        <Section
          icon={<AlertCircle size={16} className="text-red-400" />}
          title="Errors"
          bgColor="bg-red-400/15"
          borderColor="border-red-400/30"
        >
          <p className="text-xs text-white/70 mb-3">
            반드시 수정해야 할 중요한 문제들입니다.
          </p>
          <div className="space-y-2.5">
            {[
              {
                line: 23,
                issue: '정의되지 않은 용어 사용: "WebSocket Handshake"',
              },
              { line: 45, issue: "온톨로지 연결 오류: 잘못된 개념 참조" },
              { line: 78, issue: "문법 오류: 불완전한 문장 구조" },
            ].map((error, idx) => (
              <LinterItem key={idx} line={error.line} issue={error.issue} />
            ))}
          </div>
        </Section>

        {/* Warnings */}
        <Section
          icon={<AlertTriangle size={16} className="text-yellow-400" />}
          title="Warnings"
          bgColor="bg-yellow-400/15"
          borderColor="border-yellow-400/30"
        >
          <p className="text-xs text-white/70 mb-3">
            개선을 권장하는 항목들입니다.
          </p>
          <div className="space-y-2.5">
            {[
              { line: 12, issue: "중복된 설명: 이전 섹션과 90% 유사" },
              {
                line: 34,
                issue: '중요 개념 누락 가능성: "인증 토큰" 연결 권장',
              },
              { line: 56, issue: "문장이 너무 김: 간결하게 분리 권장" },
              { line: 89, issue: "스타일 불일치: 다른 섹션과 어조 상이" },
            ].map((warning, idx) => (
              <LinterItem key={idx} line={warning.line} issue={warning.issue} />
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

function GraphTab() {
  return (
    <div className="flex-1 overflow-auto px-5 py-5">
      <div className="space-y-5">
        {/* Header */}
        <div>
          <h3 className="text-[15px] text-white mb-1.5">Graph Intelligence</h3>
          <p className="text-xs text-white/50 leading-relaxed">
            문서 네트워크 구조를 분석하고 연결 품질을 개선합니다.
          </p>
        </div>

        {/* Coverage Card */}
        <div className="bg-white/8 border border-white/12 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3.5">
            <Layers size={16} className="text-brand" />
            <h4 className="text-[13px] text-white">문서 연결 커버리지</h4>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3.5">
            <StatItem value="87%" label="전체 연결률" />
            <StatItem value="12" label="연결된 문서" color="text-blue-400" />
            <StatItem value="3" label="고아 문서" color="text-yellow-400" />
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-brand h-full rounded-full"
              style={{ width: "87%" }}
            />
          </div>
        </div>

        {/* Orphan Nodes */}
        <Section
          icon={<AlertTriangle size={16} className="text-yellow-400" />}
          title="고아 노드 (Orphan Nodes)"
          bgColor="bg-yellow-400/15"
          borderColor="border-yellow-400/30"
        >
          <p className="text-[11px] text-white/60 mb-3">
            다른 문서와 연결되지 않은 고립된 문서들입니다.
          </p>
          <div className="space-y-2">
            {[
              { doc: "Advanced Webhook Configuration", suggested: 2 },
              { doc: "Legacy API Migration Guide", suggested: 3 },
              { doc: "Custom Authentication Flows", suggested: 1 },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-3 py-2.5 bg-black/20 rounded-lg"
              >
                <span className="text-xs text-white flex-1">{item.doc}</span>
                <button className="px-2.5 py-1 bg-brand text-white text-[10px] rounded-md hover:bg-brand/90 transition-colors whitespace-nowrap ml-2">
                  {item.suggested}개 연결 제안
                </button>
              </div>
            ))}
          </div>
        </Section>

        {/* Cluster Analysis */}
        <Section
          icon={<GitBranch size={16} className="text-blue-400" />}
          title="문서 클러스터 분석"
          bgColor="bg-blue-400/15"
          borderColor="border-blue-400/30"
        >
          <p className="text-[11px] text-white/60 mb-3">
            주제별로 밀집된 문서 그룹을 식별합니다.
          </p>
          <div className="space-y-2">
            {[
              { cluster: "Authentication & Security", docs: 8, density: 92 },
              { cluster: "API Endpoints", docs: 15, density: 78 },
              { cluster: "Getting Started", docs: 5, density: 85 },
            ].map((item, idx) => (
              <ClusterItem key={idx} {...item} />
            ))}
          </div>
        </Section>

        {/* Missing Links */}
        <Section
          icon={<Target size={16} className="text-purple-400" />}
          title="연결 격차 (Missing Links)"
          bgColor="bg-purple-400/15"
          borderColor="border-purple-400/30"
        >
          <p className="text-[11px] text-white/60 mb-3">
            AI가 감지한 누락된 문서 간 연결을 제안합니다.
          </p>
          <div className="space-y-2">
            {[
              {
                from: "API Authentication",
                to: "OAuth 2.0 Guide",
                confidence: 95,
              },
              { from: "Rate Limiting", to: "Best Practices", confidence: 88 },
              { from: "Webhooks", to: "Event Types", confidence: 92 },
            ].map((item, idx) => (
              <MissingLinkItem key={idx} {...item} />
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="flex-1 overflow-auto px-5 py-5">
      <div className="space-y-6">
        {/* Model & Style */}
        <SettingsGroup
          icon={<Sparkles size={16} className="text-brand" />}
          title="모델 & 생성 스타일"
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/60 mb-2 block">
                AI 모델
              </label>
              <select className="w-full px-3 py-2.5 bg-white/8 border border-white/12 rounded-lg text-[13px] text-white focus:outline-none focus:border-brand transition-colors">
                <option>GPT-4 (추천)</option>
                <option>GPT-3.5 Turbo</option>
                <option>Claude 3</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-white/60 mb-2.5 block">
                생성 스타일
              </label>
              <div className="space-y-2">
                {["전문적", "친근한", "기술적", "간결한"].map((style, idx) => (
                  <label
                    key={idx}
                    className="flex items-center gap-2.5 cursor-pointer px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <input
                      type="radio"
                      name="style"
                      defaultChecked={idx === 0}
                      className="w-4 h-4 accent-brand"
                    />
                    <span className="text-[13px] text-white">{style}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </SettingsGroup>

        {/* Document Options */}
        <SettingsGroup
          icon={<FileText size={16} className="text-blue-400" />}
          title="문서 생성 옵션"
        >
          <div className="space-y-3">
            <ToggleOption
              title="용어 자동 연결"
              description="문서 생성 시 용어 자동 연결"
              defaultChecked
            />

            <div>
              <label className="text-xs text-white/60 mb-2 block">
                코드 생성 기본 언어
              </label>
              <select className="w-full px-3 py-2.5 bg-white/8 border border-white/12 rounded-lg text-[13px] text-white focus:outline-none focus:border-brand transition-colors">
                <option>Python</option>
                <option>JavaScript</option>
                <option>Go</option>
                <option>TypeScript</option>
                <option>Java</option>
              </select>
            </div>

            <ToggleOption
              title="제목/요약 자동 생성"
              description="문서 작성 시 자동으로 제목과 요약 생성"
              defaultChecked
            />
          </div>
        </SettingsGroup>

        {/* Advanced */}
        <SettingsGroup
          icon={<Settings size={16} className="text-purple-400" />}
          title="고급 설정"
        >
          <div className="space-y-3">
            <ToggleOption
              title="실시간 AI 제안"
              description="입력하는 동안 AI 제안 표시"
            />
            <ToggleOption
              title="문맥 기반 추천"
              description="이전 문서를 참고하여 추천"
              defaultChecked
            />
          </div>
        </SettingsGroup>
      </div>
    </div>
  );
}

/* ============================================
   Helper Components
   ============================================ */

function Section({
  icon,
  title,
  bgColor,
  borderColor,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  bgColor: string;
  borderColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h4 className="text-[13px] text-white">{title}</h4>
      </div>
      <div className={cn(bgColor, borderColor, "border rounded-[10px] p-4")}>
        {children}
      </div>
    </div>
  );
}

function LinterItem({ line, issue }: { line: number; issue: string }) {
  return (
    <div className="flex items-start gap-2.5 px-3 py-2.5 bg-black/20 rounded-lg">
      <span className="text-[11px] text-white/40 mt-0.5">L{line}</span>
      <span className="text-xs text-white/80 flex-1">{issue}</span>
    </div>
  );
}

function StatItem({
  value,
  label,
  color = "text-white",
}: {
  value: string;
  label: string;
  color?: string;
}) {
  return (
    <div className="text-center">
      <div className={cn("text-lg mb-1", color)}>{value}</div>
      <div className="text-[10px] text-white/50">{label}</div>
    </div>
  );
}

function ClusterItem({
  cluster,
  docs,
  density,
}: {
  cluster: string;
  docs: number;
  density: number;
}) {
  return (
    <div className="px-3 py-2.5 bg-black/20 rounded-lg">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-white">{cluster}</span>
        <span className="text-[10px] text-white/50">{docs}개 문서</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-white/10 rounded-full h-1 overflow-hidden">
          <div
            className="bg-blue-400 h-full rounded-full"
            style={{ width: `${density}%` }}
          />
        </div>
        <span className="text-[10px] text-white/50">{density}%</span>
      </div>
    </div>
  );
}

function MissingLinkItem({
  from,
  to,
  confidence,
}: {
  from: string;
  to: string;
  confidence: number;
}) {
  return (
    <div className="px-3 py-2.5 bg-black/20 rounded-lg">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[11px] text-white">{from}</span>
        <span className="text-white/30">→</span>
        <span className="text-[11px] text-white">{to}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-white/50">신뢰도 {confidence}%</span>
        <button className="px-2 py-1 bg-purple-400 text-white text-[10px] rounded hover:bg-purple-500 transition-colors">
          연결 추가
        </button>
      </div>
    </div>
  );
}

function SettingsGroup({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-white/10">
        {icon}
        <h4 className="text-[13px] text-white">{title}</h4>
      </div>
      {children}
    </div>
  );
}

function ToggleOption({
  title,
  description,
  defaultChecked,
}: {
  title: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-3 bg-white/6 border border-white/8 rounded-[10px]">
      <div className="flex-1">
        <div className="text-[13px] text-white mb-0.5">{title}</div>
        <div className="text-[11px] text-white/50">{description}</div>
      </div>
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        className="w-[18px] h-[18px] accent-brand"
      />
    </div>
  );
}
