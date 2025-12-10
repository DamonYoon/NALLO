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
      className="w-panel bg-card rounded-lg flex flex-col h-full shadow-xl flex-shrink-0 overflow-hidden"
    >
      {/* Header */}
      <div className="h-14 border-b border-border flex items-center justify-between px-5 bg-gradient-to-r from-brand to-brand-hover">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">Ask NALLO AI</h3>
            <p className="text-2xs text-white/80">Context-aware coding guide</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Context Info */}
      {(selectedDocument || connectedDocuments.length > 0) && (
        <div className="border-b border-border p-4 bg-accent">
          <p className="text-2xs text-text-secondary uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
            <FileText size={12} />
            Current Context
          </p>

          {selectedDocument && (
            <div className="mb-2 text-xs text-text-primary flex items-start gap-2 bg-card/60 rounded-md p-2">
              <Bookmark size={14} className="mt-0.5 flex-shrink-0 text-brand" />
              <span className="flex-1">{selectedDocument}</span>
            </div>
          )}

          {connectedDocuments.length > 0 && (
            <div className="text-xs text-text-secondary">
              <div className="flex items-center gap-1.5 mb-2">
                <Link2 size={12} />
                <span>{connectedDocuments.length} connected documents</span>
              </div>
              <div className="space-y-1">
                {connectedDocuments.slice(0, 3).map((doc, idx) => (
                  <div
                    key={idx}
                    className="text-2xs text-text-secondary bg-card/40 rounded-md px-2 py-1"
                  >
                    • {doc}
                  </div>
                ))}
                {connectedDocuments.length > 3 && (
                  <div className="text-2xs text-text-tertiary px-2">
                    +{connectedDocuments.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-muted">
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
                "max-w-[88%] rounded-lg px-3.5 py-2.5",
                message.role === "user"
                  ? "bg-gradient-to-r from-brand to-brand-hover text-white shadow-lg shadow-brand/20"
                  : "bg-card text-text-primary border border-border shadow-sm"
              )}
            >
              <div className="text-xs whitespace-pre-wrap leading-relaxed">
                {message.content}
              </div>
              <div
                className={cn(
                  "text-2xs mt-1.5",
                  message.role === "user" ? "text-white/70" : "text-text-tertiary"
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
            <div className="bg-card border border-border rounded-lg px-3.5 py-2.5 shadow-sm">
              <div className="flex gap-1.5">
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-brand"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-brand"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-brand"
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
      <div className="border-t border-border p-4 bg-card">
        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <div className="mb-3">
            <p className="text-2xs text-text-tertiary uppercase tracking-wide mb-2">
              Quick Actions
            </p>
            <div className="space-y-1.5">
              {QUICK_PROMPTS.map((prompt, idx) => {
                const Icon = prompt.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => setInputValue(prompt.query)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-muted text-text-primary text-xs hover:bg-surface-hover transition-colors text-left"
                  >
                    <Icon size={14} className="text-brand flex-shrink-0" />
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
            className="w-full h-20 px-3 py-2.5 pr-12 rounded-lg border border-border text-xs resize-none outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            variant="brand"
            size="icon"
            className="absolute bottom-2 right-2 w-8 h-8 rounded-md"
          >
            <Send size={14} />
          </Button>
        </div>

        <p className="text-2xs text-text-tertiary mt-2.5 text-center">
          AI analyzes your selected documents to provide contextual guides
        </p>
      </div>
    </motion.div>
  );
}

