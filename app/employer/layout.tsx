import React from "react";
import { EmployerShell } from "@/components/layout/EmployerShell";

export const metadata = {
  title: "Employer Portal | TAG — Touch And Go",
};

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  return <EmployerShell>{children}</EmployerShell>;
}
