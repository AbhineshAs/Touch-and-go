import React from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { ShieldCheck, Target, Users, Sparkles, Scale, Lock } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <PublicNavbar />

      <section className="py-16 lg:py-24 bg-surface border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary font-semibold text-xs border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>White Track Technologies</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text-primary">
            Engineering trust in talent discovery.
          </h1>
          <p className="text-sm sm:text-base text-text-secondary max-w-2xl leading-relaxed mt-2">
            TAG (Touch And Go) was founded on a simple realization: hiring fails when candidate data is unstructured, recruiters are overwhelmed by noisy resumes, and AI is treated as an opaque black box.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col gap-12 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-text-primary">Candidate Control</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Job seekers own their data. Every extracted resume block requires confirmation, and profile visibility remains in the candidate&apos;s hands.
            </p>
          </Card>

          <Card className="p-6 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-text-primary">Explainable Assistance</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              No black-box rejection algorithms. Every recommendation shows transparent evidence citations across Matched, Missing, and Unknown criteria.
            </p>
          </Card>

          <Card className="p-6 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-text-primary">Verified Marketplace</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Zero ghost jobs, unauthorized profile scraping, or predatory staffing agencies. All participating employers are verified Indian corporations.
            </p>
          </Card>
        </div>

        <div className="p-8 rounded-2xl bg-surface border border-border flex flex-col gap-4">
          <h2 className="text-xl font-bold text-text-primary">Our Indian Market Focus</h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            India is one of the world&apos;s most dynamic software and technology markets, with over 5 million engineering professionals. Yet recruitment processes often remain fragmented between WhatsApp groups, spam-heavy portals, and unresponsive ATS systems.
          </p>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            TAG provides the infrastructure layer for technology hubs across Bengaluru, Hyderabad, Pune, Mumbai, Chennai, Kochi, Trivandrum, Nagercoil, and remote teams.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
