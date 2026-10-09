"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/ui/States";

export default function LegacyDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/candidate/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <LoadingState message="Opening candidate dashboard..." />
    </div>
  );
}
