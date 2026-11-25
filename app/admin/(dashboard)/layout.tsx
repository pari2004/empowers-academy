import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth(); // middleware guarantees this exists for everything under this group

  return (
    <AdminShell
      name={session!.user.name ?? session!.user.email ?? "Admin"}
      role={session!.user.role}
      permissions={session!.user.permissions}
    >
      {children}
    </AdminShell>
  );
}
