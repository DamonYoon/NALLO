"use client";

import { useRouter, useParams } from "next/navigation";
import { DocumentEditor } from "@/components/documents";

export default function DocumentEditorPage() {
  const router = useRouter();
  const params = useParams();
  const documentId = params.id as string;

  return (
    <DocumentEditor
      documentId={documentId}
      onBack={() => router.push("/documents/list")}
    />
  );
}

