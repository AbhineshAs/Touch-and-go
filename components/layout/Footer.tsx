import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="col-span-2 flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-black text-base shadow-xs">
                T
              </div>
              <span className="font-bold text-lg text-text-primary">TAG</span>
            </Link>
            <p className="text-xs text-text-secondary leading-relaxed max-w-sm mt-1">
              Touch And Go is an AI-assisted recruitment marketplace connecting job seekers with verified employers through structured candidate profiles, job discovery, and explainable criteria matching.
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs text-text-muted">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Verified Employer Marketplace · India-First</span>
            </div>
          </div>

          {/* Candidates */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">For Candidates</h4>
            <ul className="flex flex-col gap-2 text-xs text-text-secondary">
              <li><Link href="/jobs" className="hover:text-primary transition-colors">Explore All Jobs</Link></li>
              <li><Link href="/candidate/recommended" className="hover:text-primary transition-colors">Recommended Matches</Link></li>
              <li><Link href="/candidate/profile/resume" className="hover:text-primary transition-colors">Upload & Structure Resume</Link></li>
              <li><Link href="/candidate/applications" className="hover:text-primary transition-colors">Track Applications</Link></li>
            </ul>
          </div>

          {/* Employers */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">For Employers</h4>
            <ul className="flex flex-col gap-2 text-xs text-text-secondary">
              <li><Link href="/employer/jobs/new" className="hover:text-primary transition-colors">Publish a Job</Link></li>
              <li><Link href="/employer/dashboard" className="hover:text-primary transition-colors">Applicant Pipelines</Link></li>
              <li><Link href="/employer/verification" className="hover:text-primary transition-colors">Employer Verification</Link></li>
              <li><Link href="/employer/team" className="hover:text-primary transition-colors">Team Collaboration</Link></li>
            </ul>
          </div>

          {/* Trust & Company */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">Platform & Trust</h4>
            <ul className="flex flex-col gap-2 text-xs text-text-secondary">
              <li><Link href="/trust" className="hover:text-primary transition-colors">Trust & Safety Charter</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">About White Track</Link></li>
              <li><Link href="/help" className="hover:text-primary transition-colors">Help & FAQ</Link></li>
              <li><Link href="/admin/dashboard" className="hover:text-primary transition-colors">Admin Console</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>© {new Date().getFullYear()} White Track Technologies Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/trust" className="hover:text-text-primary transition-colors">Privacy Policy</Link>
            <Link href="/trust" className="hover:text-text-primary transition-colors">Terms of Service</Link>
            <Link href="/trust" className="hover:text-text-primary transition-colors">Responsible AI Governance</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
