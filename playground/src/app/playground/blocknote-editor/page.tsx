"use client";

import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with BlockNote (window is not defined)
const BlockNoteEditor = dynamic(() => import("./editor"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center">
      <div className="text-muted-foreground">Loading editor...</div>
    </div>
  ),
});

export default function BlockNoteEditorPage() {
  return <BlockNoteEditor />;
}
