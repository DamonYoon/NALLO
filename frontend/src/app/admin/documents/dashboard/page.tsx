"use client";

import { useRouter } from "next/navigation";
import { Dashboard } from "@/components/dashboard";

export default function DocumentsDashboardPage() {
  const router = useRouter();

  return (
    <Dashboard
      onViewDocuments={() => router.push("/admin/documents")}
      onCreateDocument={() => router.push("/admin/documents/new")}
    />
  );
}
