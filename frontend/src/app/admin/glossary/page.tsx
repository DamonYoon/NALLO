"use client";

import { useRouter } from "next/navigation";
import { GlossaryList } from "@/components/glossary";

export default function GlossaryPage() {
  const router = useRouter();

  return (
    <GlossaryList
      onCreateTerm={() => router.push("/admin/glossary/new")}
      onViewTerm={(termId) => router.push(`/admin/glossary/${termId}`)}
      onEditTerm={(termId) => router.push(`/admin/glossary/${termId}/edit`)}
    />
  );
}

