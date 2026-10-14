"use client";

import React, { Suspense } from "react";
import { JobsView } from "@/components/candidate/JobsView";

export default function CandidateJobsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6 animate-pulse">
          <div className="h-10 bg-slate-200/60 rounded-xl w-64" />
          <div className="h-14 bg-slate-200/60 rounded-2xl w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-slate-200/60 rounded-2xl" />
            <div className="h-64 bg-slate-200/60 rounded-2xl" />
          </div>
        </div>
      }
    >
      <JobsView />
    </Suspense>
  );
}
