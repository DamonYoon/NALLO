'use client';

import { useState } from 'react';
import { AppLayout, TabType } from '@/components/layout';
import { Dashboard } from '@/components/dashboard';
import { DocumentList } from '@/components/documents';

// 임시 플레이스홀더 컴포넌트들
function GlossaryPlaceholder() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <p className="text-2xl text-muted-foreground mb-2">📖</p>
        <p className="text-muted-foreground">용어집 페이지 (구현 예정)</p>
      </div>
    </div>
  );
}

function DeployPlaceholder() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <p className="text-2xl text-muted-foreground mb-2">🚀</p>
        <p className="text-muted-foreground">배포 페이지 (구현 예정)</p>
      </div>
        </div>
  );
}

function GraphPlaceholder() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <p className="text-2xl text-white/50 mb-2">📊</p>
        <p className="text-white/50">그래프 뷰 (구현 예정)</p>
        </div>
    </div>
  );
}

export default function Home() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'list'>('dashboard');

  const renderContent = (activeTab: TabType) => {
    switch (activeTab) {
      case '문서':
        // 문서 탭에서는 대시보드 또는 문서 목록 표시
        return currentView === 'dashboard' ? (
          <Dashboard onViewDocuments={() => setCurrentView('list')} />
        ) : (
          <DocumentList />
        );
      case '용어집':
        return <GlossaryPlaceholder />;
      case '배포':
        return <DeployPlaceholder />;
      case '그래프':
        return <GraphPlaceholder />;
      default:
        return <Dashboard />;
    }
  };

  return <AppLayout renderContent={renderContent} />;
}
