"use client";

import { useRouter } from "next/navigation";
import { DocumentList } from "@/components/documents";

export default function DocumentListPage() {
  const router = useRouter();

  return (
    <DocumentList
      onViewDocument={(docId) => router.push(`/documents/${docId}`)}
      onCreateDocument={() => router.push("/documents/new")}
    />
  );
}

