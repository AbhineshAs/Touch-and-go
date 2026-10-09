"use client";

import React, { useState } from "react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/Input";
import { ChevronDown, HelpCircle, Mail, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "How is TAG's criteria alignment calculated?",
    a: "TAG evaluates the candidate's confirmed technical competencies, commercial experience years, location preference, and work mode against published job requirements. It breaks down the evaluation into Matched, Missing, and Unknown categories. Unknown never penalizes your score.",
  },
  {
    q: "Why do extracted resume fields require confirmation?",
    a: "AI parsing models can misinterpret formatting, date ranges, or technical acronyms. TAG mandates that candidates inspect, correct, or accept all extracted fields before they become part of their searchable profile.",
  },
  {
    q: "How does employer verification work?",
    a: "Employers must provide a verified company domain, Ministry of Corporate Affairs CIN, and GST registration. TAG Trust & Safety administrators review these documents before approving job listings or candidate communication.",
  },
  {
    q: "Can candidates apply directly without recruitment agencies?",
    a: "Yes. TAG is a direct marketplace. Applications are delivered immediately into the verified employer's internal hiring pipeline with no third-party recruitment agency intermediaries.",
  },
  {
    q: "What file formats are supported for resume uploading?",
    a: "TAG accepts PDF (.pdf) and Microsoft Word (.docx) documents up to 10MB in file size.",
  },
];

export default function HelpPage() {
  const [search, setSearch] = useState("");
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const filteredFaqs = FAQS.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <PublicNavbar />

      <section className="py-16 lg:py-20 bg-surface border-b border-border text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex flex-col items-center gap-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
            Help Center & Support
          </h1>
          <p className="text-sm text-text-secondary max-w-xl leading-relaxed">
            Find answers to common questions about candidate profiles, resume extraction, explainable matching, and employer verification.
          </p>
          <div className="w-full max-w-lg mt-2">
            <SearchInput
              placeholder="Search help topics, matching logic, verification..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
            />
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-6 flex-1 w-full">
        <div className="flex flex-col gap-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <Card key={idx} className="overflow-hidden border border-border">
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-text-primary hover:bg-background transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-text-muted transition-transform shrink-0",
                      isOpen && "rotate-180 text-primary"
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-text-secondary leading-relaxed border-t border-border-subtle bg-background">
                    {faq.a}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Contact Support Banner */}
        <div className="mt-8 p-6 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-bold text-text-primary">Need personalized assistance?</h3>
              <p className="text-xs text-text-muted">Our India-based support desk responds within 24 hours.</p>
            </div>
          </div>
          <a href="mailto:support@tagjobs.in">
            <Button size="sm" variant="primary">
              Contact Support
            </Button>
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}
