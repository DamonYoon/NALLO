"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Send, Sparkles, FileText, Link2, Bookmark, Code, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ============================================
   Types
   ============================================ */

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface UserAskAIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDocument?: string | null;
  connectedDocuments?: string[];
}

/* ============================================
   Constants
   ============================================ */

const QUICK_PROMPTS = [
  {
    icon: Code,
    label: "Deploy contract with Hardhat",
    query: "How do I deploy a smart contract using Hardhat and NODIT?",
  },
  {
    icon: Zap,
    label: "Set up testing environment",
    query: "Set up a complete testing environment for Ethereum smart contracts",
  },
  {
    icon: FileText,
    label: "Integrate Web3 frontend",
    query: "How to integrate my smart contract with a React frontend?",
  },
];

const INITIAL_MESSAGE: Message = {
  id: "1",
  role: "assistant",
  content: `Welcome to NALLO AI! 👋

I'm your personal coding guide assistant. I analyze your bookmarked documents and their connections to provide you with accurate, contextual coding guides.

**What I can help you with:**
- Generate step-by-step deployment guides
- Create code examples combining multiple services
- Explain complex workflows across different tools
- Suggest best practices based on your selected documents

Select documents in your knowledge graph and ask me anything!`,
  timestamp: new Date(),
};

/* ============================================
   Component
   ============================================ */

export function UserAskAIPanel({
  isOpen,
  onClose,
  selectedDocument,
  connectedDocuments = [],
}: UserAskAIPanelProps) {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Based on your query, here's a helpful guide:

This is a placeholder response. In the actual implementation, this would be connected to an AI service that analyzes your bookmarked documents and provides contextual guidance.

**Key Points:**
- Your question has been received
- AI would analyze connected documents
- Provide step-by-step instructions
- Include relevant code examples

Would you like me to elaborate on any specific aspect?`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      initial={{ x: 500, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 500, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-[420px] bg-white border-l border-gray-200 flex flex-col h-full shadow-2xl flex-shrink-0"
    >
      {/* Header */}
      <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-gradient-to-r from-emerald-500 to-emerald-600">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-base font-medium text-white">Ask NALLO AI</h3>
            <p className="text-xs text-white/80">Context-aware coding guide</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Context Info */}
      {(selectedDocument || connectedDocuments.length > 0) && (
        <div className="border-b border-gray-200 p-5 bg-gradient-to-br from-blue-50 to-indigo-50">
          <p className="text-xs text-blue-900 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <FileText size={12} />
            Current Context
          </p>

          {selectedDocument && (
            <div className="mb-2.5 text-[13px] text-blue-800 flex items-start gap-2.5 bg-white/60 rounded-lg p-2.5">
              <Bookmark size={14} className="mt-0.5 flex-shrink-0" />
              <span className="flex-1">{selectedDocument}</span>
            </div>
          )}

          {connectedDocuments.length > 0 && (
            <div className="text-xs text-blue-700">
              <div className="flex items-center gap-1.5 mb-2">
                <Link2 size={12} />
                <span>{connectedDocuments.length} connected documents</span>
              </div>
              <div className="space-y-1.5">
                {connectedDocuments.slice(0, 3).map((doc, idx) => (
                  <div
                    key={idx}
                    className="text-[11px] text-blue-600 bg-white/40 rounded-md px-2 py-1"
                  >
                    • {doc}
                  </div>
                ))}
                {connectedDocuments.length > 3 && (
                  <div className="text-[11px] text-blue-500 px-2">
                    +{connectedDocuments.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[88%] rounded-xl px-4 py-3",
                message.role === "user"
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                  : "bg-white text-gray-900 border border-gray-200 shadow-sm"
              )}
            >
              <div className="text-sm whitespace-pre-wrap leading-relaxed">
                {message.content}
              </div>
              <div
                className={cn(
                  "text-[11px] mt-2",
                  message.role === "user" ? "text-white/70" : "text-gray-500"
                )}
              >
                {message.timestamp.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
              <div className="flex gap-2">
                <motion.div
                  className="w-2 h-2 rounded-full bg-emerald-500"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 rounded-full bg-emerald-500"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 rounded-full bg-emerald-500"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-5 bg-white">
        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <div className="mb-4">
            <p className="text-[11px] text-gray-500 uppercase tracking-wide mb-2.5">
              Quick Actions
            </p>
            <div className="space-y-2">
              {QUICK_PROMPTS.map((prompt, idx) => {
                const Icon = prompt.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => setInputValue(prompt.query)}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-gray-50 text-gray-700 text-[13px] hover:bg-gray-100 transition-colors text-left"
                  >
                    <Icon size={16} className="text-emerald-600 flex-shrink-0" />
                    <span>{prompt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="relative">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about your documents..."
            className="w-full h-24 px-4 py-3 pr-14 rounded-xl border-2 border-gray-200 text-sm resize-none outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            variant="brand"
            size="icon"
            className="absolute bottom-3 right-3 w-10 h-10 rounded-lg"
          >
            <Send size={16} />
          </Button>
        </div>

        <p className="text-[11px] text-gray-500 mt-3 text-center">
          AI analyzes your selected documents to provide contextual guides
        </p>
      </div>
    </motion.div>
  );
}

