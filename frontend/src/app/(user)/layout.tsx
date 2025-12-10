import { UserLayout } from "@/components/layout";

export default function UserRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserLayout>{children}</UserLayout>;
}

