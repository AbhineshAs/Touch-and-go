"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Select";
import { CheckCircle2, Bell, Shield, Mail } from "lucide-react";

export default function EmployerSettingsPage() {
  const [notifyNewApplicant, setNotifyNewApplicant] = useState(true);
  const [notifyShortlist, setNotifyShortlist] = useState(true);
  const [notifyInterview, setNotifyInterview] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-16">
      <div className="flex flex-col gap-1 pb-4 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Employer Settings
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          Configure hiring team notifications and pipeline preferences.
        </p>
      </div>

      {isSaved && (
        <div className="p-3.5 rounded-xl bg-success text-white text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Employer preferences saved.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <Card className="p-6 bg-surface border-border flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-text-primary">Pipeline Notification Alerts</h2>
          </div>

          <div className="flex flex-col gap-4">
            <Switch
              label="New Candidate Applications"
              description="Receive email when a verified candidate applies with >75% criteria match."
              checked={notifyNewApplicant}
              onChange={(e) => setNotifyNewApplicant(e.target.checked)}
            />

            <div className="pt-3 border-t border-border-subtle">
              <Switch
                label="Interview Feedback Submissions"
                description="Notify hiring team when an interviewer submits an evaluation scorecard."
                checked={notifyInterview}
                onChange={(e) => setNotifyInterview(e.target.checked)}
              />
            </div>

            <div className="pt-3 border-t border-border-subtle">
              <Switch
                label="Legal Verification & Compliance Alerts"
                description="Updates on MCA renewal notices or quarterly compliance checks."
                checked={notifyShortlist}
                onChange={(e) => setNotifyShortlist(e.target.checked)}
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="md" variant="primary">
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
}
