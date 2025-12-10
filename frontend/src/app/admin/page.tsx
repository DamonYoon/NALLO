"use client";

import { useRouter } from "next/navigation";
import { Dashboard } from "@/components/dashboard";

export default function AdminDashboardPage() {
  const router = useRouter();

  return (
    <Dashboard
      onViewDocuments={() => router.push("/admin/documents/list")}
      onCreateDocument={() => router.push("/admin/documents/new")}
    />
  );
}

