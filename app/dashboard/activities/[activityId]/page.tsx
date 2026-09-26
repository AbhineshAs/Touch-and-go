"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ACTIVITIES_CATALOGUE } from "@/lib/candidate/activities/catalogue";
import { useCandidate } from "@/lib/candidate/context/CandidateContext";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  BookOpen,
  Send,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const activityId = (params?.activityId as string) || "";
  const activity = ACTIVITIES_CATALOGUE[activityId];

  const { plan, markTaskComplete, undoTaskComplete } = useCandidate();

  // Local interactive state for inputs and reflections
  const [reflectionText, setReflectionText] = useState("");
  const [starForm, setStarForm] = useState({ s: "", t: "", a: "", r: "" });
  const [checklistChecks, setChecklistChecks] = useState<Record<string, boolean>>({});

  if (!activity) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12">
        <div className="max-w-md w-full p-8 rounded-2xl bg-surface border border-border text-center flex flex-col items-center gap-4">
          <h2 className="text-xl font-bold text-text-primary">Activity Not Found</h2>
          <p className="text-xs text-text-muted">
            The requested activity does not exist in the catalogue.
          </p>
          <Link href="/dashboard">
            <Button size="md" variant="primary">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Find plan tasks corresponding to this activity
  const activityTasks = plan.tasks.filter((t) => t.activityId === activity.id);
  const isTaskCompleted = (stepId: string) => {
    return activityTasks.some((t) => t.stepId === stepId && t.status === "completed");
  };

  const handleToggleStep = (stepId: string) => {
    const matchingTask = activityTasks.find((t) => t.stepId === stepId);
    const taskId = matchingTask ? matchingTask.id : `${activity.id}:default:${stepId}`;

    if (isTaskCompleted(stepId)) {
      undoTaskComplete(taskId);
    } else {
      markTaskComplete(taskId);
    }
  };

  const handleMarkAllComplete = () => {
    for (const step of activity.steps) {
      const matchingTask = activityTasks.find((t) => t.stepId === step.id);
      const taskId = matchingTask ? matchingTask.id : `${activity.id}:default:${step.id}`;
      markTaskComplete(taskId);
    }
  };

  const toggleChecklistItem = (key: string) => {
    setChecklistChecks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const allCompleted = activity.steps.every((s) => isTaskCompleted(s.id));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-border px-4 py-3 sm:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="text-xs font-semibold text-text-secondary capitalize">
            {activity.category.replace(/_/g, " ")}
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-10 flex flex-col gap-6">
        {/* Activity Banner */}
        <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-xs flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
              Working Local Activity
            </span>
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>Total duration: ~{activity.totalMinutes} minutes</span>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
            {activity.title}
          </h1>

          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            {activity.description}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-xs">
            <span className="text-text-muted">
              {activity.steps.filter((s) => isTaskCompleted(s.id)).length} of {activity.steps.length} steps completed
            </span>
            {allCompleted && (
              <span className="inline-flex items-center gap-1 text-success font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Activity Completed!</span>
              </span>
            )}
          </div>
        </div>

        {/* Steps and Interactive Content */}
        <div className="flex flex-col gap-5">
          {activity.steps.map((step, idx) => {
            const completed = isTaskCompleted(step.id);
            return (
              <Card
                key={step.id}
                className={cn(
                  "p-5 sm:p-6 bg-surface border-border shadow-xs flex flex-col gap-4 transition-all",
                  completed && "border-success/40 bg-success-soft/20"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleStep(step.id)}
                      className="mt-0.5 cursor-pointer text-primary hover:opacity-80 transition-opacity"
                    >
                      {completed ? (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      ) : (
                        <Circle className="w-5 h-5 text-border-strong hover:text-primary" />
                      )}
                    </button>
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                        Step {idx + 1} • ~{step.estimatedMinutes} mins
                      </span>
                      <h3
                        className={cn(
                          "text-sm sm:text-base font-bold text-text-primary",
                          completed && "line-through text-text-muted font-normal"
                        )}
                      >
                        {step.title}
                      </h3>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={completed ? "outline" : "primary"}
                    onClick={() => handleToggleStep(step.id)}
                  >
                    {completed ? "Undo" : "Mark Complete"}
                  </Button>
                </div>

                {/* Dedicated Interactive Widgets per Activity Type */}
                {activity.interactiveType === "cv_checklist" && (
                  <div className="p-3.5 rounded-xl bg-background border border-border-subtle flex flex-col gap-2.5 text-xs text-text-primary">
                    <span className="font-semibold text-text-muted uppercase text-[10px] tracking-wider">
                      Interactive Checkpoints
                    </span>
                    {[
                      "Each bullet begins with an active verb (engineered, optimized, designed)",
                      "Includes at least one quantifiable outcome (e.g. reduced load time by 30%)",
                      "Consistent formatting, legible font, and no spelling mistakes",
                    ].map((item, i) => (
                      <label key={i} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(checklistChecks[`${step.id}_${i}`])}
                          onChange={() => toggleChecklistItem(`${step.id}_${i}`)}
                          className="w-4 h-4 rounded text-primary border-border focus:ring-primary"
                        />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                )}

                {activity.interactiveType === "interview_prompts" && idx === 1 && (
                  <div className="p-4 rounded-xl bg-background border border-border-subtle flex flex-col gap-3 text-xs">
                    <span className="font-bold text-text-primary">
                      STAR Story Builder (Draft your response)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[11px] text-text-muted font-semibold">Situation</label>
                        <input
                          type="text"
                          placeholder="What was the challenge or project context?"
                          value={starForm.s}
                          onChange={(e) => setStarForm({ ...starForm, s: e.target.value })}
                          className="w-full h-8 px-2.5 rounded-lg border border-border bg-surface text-xs mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-text-muted font-semibold">Task</label>
                        <input
                          type="text"
                          placeholder="What was your specific responsibility?"
                          value={starForm.t}
                          onChange={(e) => setStarForm({ ...starForm, t: e.target.value })}
                          className="w-full h-8 px-2.5 rounded-lg border border-border bg-surface text-xs mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-text-muted font-semibold">Action</label>
                        <input
                          type="text"
                          placeholder="What technical steps did you execute?"
                          value={starForm.a}
                          onChange={(e) => setStarForm({ ...starForm, a: e.target.value })}
                          className="w-full h-8 px-2.5 rounded-lg border border-border bg-surface text-xs mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-text-muted font-semibold">Result</label>
                        <input
                          type="text"
                          placeholder="What was the measurable outcome or impact?"
                          value={starForm.r}
                          onChange={(e) => setStarForm({ ...starForm, r: e.target.value })}
                          className="w-full h-8 px-2.5 rounded-lg border border-border bg-surface text-xs mt-1"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activity.interactiveType === "skill_exercise" && idx === 2 && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-text-primary">
                      Your key takeaway or implementation note:
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Write down any mental model insight or edge case you discovered..."
                      value={reflectionText}
                      onChange={(e) => setReflectionText(e.target.value)}
                      className="p-2.5 rounded-xl border border-border bg-background text-xs text-text-primary resize-none"
                    />
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="p-6 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/dashboard">
            <Button size="md" variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Dashboard
            </Button>
          </Link>

          {!allCompleted && (
            <Button size="md" variant="primary" onClick={handleMarkAllComplete}>
              Mark Entire Activity Complete
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
