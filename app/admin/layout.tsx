import React from "react";
import { AdminShell } from "@/components/layout/AdminShell";

export const metadata = {
  title: "Admin Console | TAG — Touch And Go",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
