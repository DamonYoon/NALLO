"use client";

import { useRouter } from "next/navigation";
import { DocumentEditor } from "@/components/documents";

export default function NewDocumentPage() {
  const router = useRouter();

  return (
    <DocumentEditor
      onBack={() => router.push("/documents/list")}
    />
  );
}

