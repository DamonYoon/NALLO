"use client";

import { useRouter } from "next/navigation";
import { GlossaryList } from "@/components/glossary";

export default function GlossaryPage() {
  const router = useRouter();

  return (
    <GlossaryList
      onCreateTerm={() => console.log("Create term")}
      onViewTerm={(termId) => router.push(`/glossary/${termId}`)}
    />
  );
}

