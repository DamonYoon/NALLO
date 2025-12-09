'use client';

import { Settings, User, Sparkles, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GlobalHeaderProps {
  onAskAIClick?: () => void;
}

export function GlobalHeader({ onAskAIClick }: GlobalHeaderProps) {
  return (
    <header className="h-[39px] bg-transparent flex items-center justify-between px-[14px]">
      {/* Left Side - Logo & Project */}
      <div className="flex items-center gap-[17px]">
        {/* NALLO Logo */}
        <div className="flex items-center gap-[6px]">
          <div className="relative w-[11px] h-[15px]">
            <svg
              className="block size-full"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 16 22"
            >
              <path
                d="M8 0C3.58 0 0 3.58 0 8c0 6.5 8 14 8 14s8-7.5 8-14c0-4.42-3.58-8-8-8z"
                fill="#FC8658"
              />
              <ellipse cx="8" cy="8.4" fill="#FEF4F2" rx="1.75" ry="1.75" />
            </svg>
          </div>
          <span className="text-[14px] font-semibold text-white tracking-wide">
            NALLO
          </span>
        </div>

        {/* Project Selector */}
        <button className="flex items-center gap-[6px] px-[11px] py-[4px] rounded-full bg-white/10 hover:bg-[#ececec] transition-colors group">
          <span className="text-[10px] text-white group-hover:text-[#594b45]">
            Nodit
          </span>
          <ChevronDown
            size={10}
            className="text-white group-hover:text-[#594b45]"
          />
        </button>
      </div>

      {/* Right Side - Action Buttons */}
      <div className="flex items-center gap-[8px]">
        {/* 관리자 설정 */}
        <button className="flex items-center gap-[4px] px-[8px] py-[4px] rounded-full bg-white/10 hover:bg-[#ececec] transition-colors group">
          <Settings
            size={11}
            className="text-white group-hover:text-[#594b45]"
          />
          <span className="text-[10px] text-white group-hover:text-[#594b45]">
            관리자 설정
          </span>
        </button>

        {/* 계정 관리 */}
        <button className="flex items-center gap-[4px] px-[8px] py-[4px] rounded-full bg-white/10 hover:bg-[#ececec] transition-colors group">
          <User size={11} className="text-white group-hover:text-[#594b45]" />
          <span className="text-[10px] text-white group-hover:text-[#594b45]">
            계정 관리
          </span>
        </button>

        {/* ASK AI */}
        <Button
          onClick={onAskAIClick}
          variant="ghost"
          size="sm"
          className="flex items-center gap-[4px] px-[10px] py-[4px] h-auto rounded-full bg-white/10 hover:bg-[#ececec] transition-colors group"
        >
          <Sparkles
            size={11}
            className="text-white group-hover:text-[#594b45]"
          />
          <span className="text-[10px] text-white group-hover:text-[#594b45]">
            ASK AI
          </span>
        </Button>
      </div>
    </header>
  );
}

