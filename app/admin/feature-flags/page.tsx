"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Select";
import { ToggleLeft, CheckCircle2, ShieldAlert } from "lucide-react";

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  tier: "General" | "Experimental" | "Security";
}

export default function AdminFeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([
    {
      id: "ff_1",
      name: "Strict MCA Registration Validation",
      description: "Require active Ministry of Corporate Affairs CIN validation before employer listing activation.",
      enabled: true,
      tier: "Security",
    },
    {
      id: "ff_2",
      name: "Semantic Match Scoring v2 (pgvector)",
      description: "Enable hybrid keyword and pgvector cosine distance calculation in criteria alignment breakdown.",
      enabled: true,
      tier: "General",
    },
    {
      id: "ff_3",
      name: "Candidate Stealth Visibility Mode",
      description: "Allow candidates to obscure current employer from search discovery automatically.",
      enabled: true,
      tier: "General",
    },
    {
      id: "ff_4",
      name: "Automated Salary Calibration Insights",
      description: "Present Indian tech market benchmark percentiles during Job Builder compensation steps.",
      enabled: false,
      tier: "Experimental",
    },
  ]);

  const [savedNotice, setSavedNotice] = useState(false);

  const handleToggle = (id: string) => {
    setFlags(flags.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)));
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-16">
      <div className="flex flex-col gap-1 pb-4 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Platform Feature Flags & Governance
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          Control progressive rollouts, algorithm parameters, and trust enforcement gates.
        </p>
      </div>

      {savedNotice && (
        <div className="p-3.5 rounded-xl bg-success text-white text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Feature flag state updated across cluster.</span>
        </div>
      )}

      <Card className="p-6 bg-surface border-border flex flex-col gap-5">
        <div className="flex flex-col gap-4">
          {flags.map((flag) => (
            <div
              key={flag.id}
              className="p-4 rounded-xl bg-background border border-border-subtle flex items-center justify-between gap-4"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-text-primary">{flag.name}</h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-border text-text-muted">
                    {flag.tier}
                  </span>
                </div>
                <p className="text-xs text-text-muted max-w-xl">{flag.description}</p>
              </div>

              <Switch
                checked={flag.enabled}
                onChange={() => handleToggle(flag.id)}
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
