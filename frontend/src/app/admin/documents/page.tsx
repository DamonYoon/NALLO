"use client";

import { useRouter } from "next/navigation";
import { DocumentList } from "@/components/documents";
import { Dashboard } from "@/components/dashboard";

export default function DocumentsPage() {
  const router = useRouter();

  return (
    <Dashboard
      onViewDocuments={() => router.push("/admin/documents")}
      onCreateDocument={() => router.push("/admin/documents/new")}
    />
    // <DocumentList
    //   onViewDocument={(docId) => router.push(`/admin/documents/${docId}`)}
    //   onEditDocument={(docId) => router.push(`/admin/documents/${docId}/edit`)}
    //   onCreateDocument={() => router.push("/admin/documents/new")}
    // />
  );
}
