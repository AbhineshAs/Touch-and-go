import React from "react";
import { CandidateShell } from "@/components/layout/CandidateShell";

export const metadata = {
  title: "Candidate Portal | TAG — Touch And Go",
};

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  return <CandidateShell>{children}</CandidateShell>;
}
