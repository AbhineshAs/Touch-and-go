"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  Calendar,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  CheckCheck,
  Check,
  Search,
  X,
  Clock,
  Trash2,
  Mail,
  Smartphone,
  RotateCcw,
  Sliders,
} from "lucide-react";
import { NotificationItem } from "@/types";
import { MOCK_NOTIFICATIONS } from "@/lib/mocks/data";
import { formatRelativeTime, formatFullDateTime, formatDate, cn } from "@/lib/utils";

type FilterTab = "all" | "unread" | "interview" | "match" | "application";

interface NotificationPreferences {
  inApp: boolean;
  email: boolean;
  whatsapp: boolean;
  emailFrequency: "instant" | "daily" | "weekly";
  catInterviews: boolean;
  catMatches: boolean;
  catApplications: boolean;
  catSecurity: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  inApp: true,
  email: true,
  whatsapp: true,
  emailFrequency: "instant",
  catInterviews: true,
  catMatches: true,
  catApplications: true,
  catSecurity: true,
};

const STORAGE_NOTIFS_KEY = "tag_candidate_notifications_v2";
const STORAGE_PREFS_KEY = "tag_candidate_notification_prefs_v2";

export function NotificationsPage() {
  // Load candidate notifications from localStorage or fallback to MOCK_NOTIFICATIONS
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(STORAGE_NOTIFS_KEY);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (err) {
        console.warn("Could not read notifications from localStorage:", err);
      }
    }
    return MOCK_NOTIFICATIONS.filter((n) => n.userId === "usr_cand_01");
  });

  // Preferences state
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(STORAGE_PREFS_KEY);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (err) {
        console.warn("Could not read notification preferences from localStorage:", err);
      }
    }
    return DEFAULT_PREFERENCES;
  });

  // Filter & Search states
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  // Sync notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_NOTIFS_KEY, JSON.stringify(notifications));
    } catch (err) {
      console.warn("Could not write notifications to localStorage:", err);
    }
  }, [notifications]);

  // Sync preferences to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PREFS_KEY, JSON.stringify(preferences));
    } catch (err) {
      console.warn("Could not write notification preferences to localStorage:", err);
    }
  }, [preferences]);

  // Temporary notice helper
  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => {
      setNotice(null);
    }, 2800);
  };

  // Handlers for notifications
  const handleMarkAllRead = () => {
    const unreadCount = notifications.filter((n) => !n.read).length;
    if (unreadCount === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showNotice(`Marked ${unreadCount} ${unreadCount === 1 ? "notification" : "notifications"} as read.`);
  };

  const handleToggleRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const nextRead = !n.read;
          showNotice(nextRead ? "Marked as read." : "Marked as unread.");
          return { ...n, read: nextRead };
        }
        return n;
      })
    );
  };

  const handleArchive = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    showNotice("Notification removed from inbox.");
  };

  const handleResetNotifications = () => {
    const baseCandidateNotifs = MOCK_NOTIFICATIONS.filter((n) => n.userId === "usr_cand_01");
    setNotifications(baseCandidateNotifs);
    showNotice("Restored demo inbox notifications.");
  };

  // Preferences update helper
  const updatePreference = <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    showNotice("Delivery preference updated.");
  };

  // Tab count calculations
  const counts = useMemo(() => {
    return {
      all: notifications.length,
      unread: notifications.filter((n) => !n.read).length,
      interview: notifications.filter((n) => n.type === "interview").length,
      match: notifications.filter((n) => n.type === "match").length,
      application: notifications.filter((n) => n.type === "application" || n.type === "verification").length,
    };
  }, [notifications]);

  // Filtered and searched notifications
  const filteredNotifications = useMemo(() => {
    return notifications
      .filter((notif) => {
        // Tab filter
        if (activeTab === "unread" && notif.read) return false;
        if (activeTab === "interview" && notif.type !== "interview") return false;
        if (activeTab === "match" && notif.type !== "match") return false;
        if (activeTab === "application" && notif.type !== "application" && notif.type !== "verification") {
          return false;
        }

        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = notif.title.toLowerCase().includes(q);
          const matchMsg = notif.message.toLowerCase().includes(q);
          return matchTitle || matchMsg;
        }

        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications, activeTab, searchQuery]);

  // Extract contextual badges and CTA details
  const getCategoryDetails = (notif: NotificationItem) => {
    switch (notif.type) {
      case "interview":
        return {
          icon: <Calendar className="w-4 h-4 text-purple-600" />,
          iconBg: "bg-purple-50 text-purple-600 border border-purple-100",
          tagLabel: "Interview",
          tagStyle: "bg-purple-50 text-purple-700 border border-purple-200/60",
          actionLabel: "Review Schedule →",
        };
      case "match": {
        const matchPercent = notif.message.match(/(\d+)%/)?.[1];
        return {
          icon: <Sparkles className="w-4 h-4 text-blue-600" />,
          iconBg: "bg-blue-50 text-blue-600 border border-blue-100",
          tagLabel: matchPercent ? `${matchPercent}% Match` : "Job Match",
          tagStyle: "bg-blue-50 text-blue-700 border border-blue-200/60",
          actionLabel: "Review Job Match →",
        };
      }
      case "application":
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
          iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
          tagLabel: "Application Update",
          tagStyle: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
          actionLabel: "View Application →",
        };
      case "verification":
        return {
          icon: <ShieldCheck className="w-4 h-4 text-teal-600" />,
          iconBg: "bg-teal-50 text-teal-600 border border-teal-100",
          tagLabel: "Verified Credential",
          tagStyle: "bg-teal-50 text-teal-700 border border-teal-200/60",
          actionLabel: "View Credentials →",
        };
      default:
        return {
          icon: <Bell className="w-4 h-4 text-amber-600" />,
          iconBg: "bg-amber-50 text-amber-600 border border-amber-100",
          tagLabel: "System Notice",
          tagStyle: "bg-amber-50 text-amber-700 border border-amber-200/60",
          actionLabel: "Review Settings →",
        };
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Page Header (Left-aligned with breadcrumbs and workspace grid) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Notifications
            </h1>
            {counts.unread > 0 ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-600 text-white shadow-2xs">
                {counts.unread} New
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                <Check className="w-3 h-3 text-emerald-600" />
                All Caught Up
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
            Real-time activity inbox for interview schedules, verified role matches, and pipeline updates.
          </p>
        </div>

        {/* Global Header Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={counts.unread === 0}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="Mark all notifications as read"
          >
            <CheckCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>Mark all as read</span>
          </button>

          <a
            href="#notification-preferences"
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            title="Configure delivery channels and digest settings"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>Settings</span>
          </a>
        </div>
      </div>

      {/* Floating Notice Toast */}
      {notice && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notice}</span>
        </div>
      )}

      {/* 2. Main 12-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Unified Inbox Card (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Integrated Unified Container: Toolbar + Feed */}
          <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden flex flex-col">
            {/* Embedded Toolbar */}
            <div className="border-b border-slate-200/80 bg-slate-50/60 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Soft Segmented Tray Tabs */}
              <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl overflow-x-auto no-scrollbar">
                {[
                  { id: "all", label: "All", count: counts.all },
                  { id: "unread", label: "Unread", count: counts.unread },
                  { id: "interview", label: "Interviews", count: counts.interview },
                  { id: "match", label: "Job Matches", count: counts.match },
                  { id: "application", label: "Applications", count: counts.application },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as FilterTab)}
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer",
                        isActive
                          ? "bg-white text-slate-900 shadow-2xs font-semibold"
                          : "text-slate-600 hover:text-slate-900 font-medium"
                      )}
                    >
                      <span>{tab.label}</span>
                      {tab.count > 0 && (
                        <span
                          className={cn(
                            "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                            isActive
                              ? "bg-slate-100 text-slate-800 font-bold"
                              : "bg-slate-200/70 text-slate-600 font-medium"
                          )}
                        >
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Compact Search Input */}
              <div className="relative min-w-[200px] sm:w-56 shrink-0">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 w-full pl-8 pr-7 rounded-lg border border-slate-200/80 bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    title="Clear filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Notification Feed Rows */}
            <div className="divide-y divide-slate-100">
              {filteredNotifications.length === 0 ? (
                /* High-Fidelity Empty State */
                <div className="p-12 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mb-3">
                    {searchQuery ? (
                      <Search className="w-5 h-5 text-blue-600" />
                    ) : activeTab === "unread" ? (
                      <CheckCheck className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Bell className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {searchQuery
                      ? "No matching alerts found"
                      : activeTab === "unread"
                      ? "Inbox zero achieved"
                      : "No notifications in this category"}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1 mb-5 leading-relaxed">
                    {searchQuery
                      ? `No notifications matched "${searchQuery}". Clear your search term to see all activities.`
                      : activeTab === "unread"
                      ? "You are up to date on all interviews, matches, and application status updates."
                      : "As hiring teams advance your applications or schedule interviews, alerts will appear here."}
                  </p>

                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="h-8 px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                    >
                      Clear Filter
                    </button>
                  ) : activeTab !== "all" ? (
                    <button
                      type="button"
                      onClick={() => setActiveTab("all")}
                      className="h-8 px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                    >
                      View All Notifications
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResetNotifications}
                      className="h-8 px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3 h-3 text-slate-500" />
                      <span>Restore Demo Notifications</span>
                    </button>
                  )}
                </div>
              ) : (
                /* Notification Items List */
                filteredNotifications.map((notif) => {
                  const category = getCategoryDetails(notif);
                  const fullDateTooltip = formatFullDateTime(notif.createdAt);
                  const exactDateShort = formatDate(notif.createdAt);
                  const relativeTime = formatRelativeTime(notif.createdAt);

                  return (
                    <div
                      key={notif.id}
                      className={cn(
                        "p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-colors group",
                        notif.read
                          ? "bg-white hover:bg-slate-50/70"
                          : "bg-blue-50/25 hover:bg-blue-50/40"
                      )}
                    >
                      {/* Left: Icon Badge & Content */}
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        {/* Category Icon Badge */}
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs",
                            category.iconBg
                          )}
                        >
                          {category.icon}
                        </div>

                        {/* Content Block */}
                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                          {/* Title First, Badge Second, Unread Dot */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3
                              className={cn(
                                "text-sm tracking-tight",
                                notif.read
                                  ? "font-semibold text-slate-800"
                                  : "font-bold text-slate-900"
                              )}
                            >
                              {notif.title}
                            </h3>

                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-md text-[11px] font-medium tracking-normal",
                                category.tagStyle
                              )}
                            >
                              {category.tagLabel}
                            </span>

                            {/* Crisp Unread Indicator Dot */}
                            {!notif.read && (
                              <span
                                className="h-2 w-2 rounded-full bg-blue-600 ring-2 ring-blue-100 shrink-0"
                                title="Unread alert"
                              />
                            )}
                          </div>

                          {/* Description */}
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                            {notif.message}
                          </p>

                          {/* Metadata Footer: Relative Time + Exact Date Tooltip */}
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span
                              className="hover:text-slate-600 transition-colors cursor-help inline-flex items-center gap-1"
                              title={fullDateTooltip}
                            >
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{relativeTime}</span>
                              <span className="text-slate-300">•</span>
                              <span>{exactDateShort}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Crisp Action Controls */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        {/* Contextual Link Action */}
                        {notif.link && (
                          <Link href={notif.link}>
                            <button
                              type="button"
                              className="h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                            >
                              <span>{category.actionLabel}</span>
                            </button>
                          </Link>
                        )}

                        {/* Subtle Quick Action: Toggle Read */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleRead(notif.id, e)}
                          className={cn(
                            "h-8 w-8 rounded-lg flex items-center justify-center transition-all cursor-pointer opacity-40 group-hover:opacity-100",
                            notif.read
                              ? "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                              : "text-blue-600 hover:text-blue-700 hover:bg-blue-100/70"
                          )}
                          title={notif.read ? "Mark as unread" : "Mark as read"}
                        >
                          {notif.read ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <CheckCheck className="w-4 h-4" />
                          )}
                        </button>

                        {/* Subtle Quick Action: Archive */}
                        <button
                          type="button"
                          onClick={(e) => handleArchive(notif.id, e)}
                          className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all opacity-40 group-hover:opacity-100 cursor-pointer"
                          title="Archive notification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom In-Card Footer */}
            <div className="px-4 py-2.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Showing {filteredNotifications.length} of {notifications.length} alerts</span>
              <button
                type="button"
                onClick={handleResetNotifications}
                className="text-slate-500 hover:text-blue-600 transition-colors inline-flex items-center gap-1 cursor-pointer font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset demo state</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Preferences & Delivery Channels (4 cols) */}
        <div id="notification-preferences" className="lg:col-span-4 flex flex-col gap-5">
          {/* A. Inbox Overview Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Activity Digest
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/60 flex flex-col">
                <span className="text-2xl font-black text-slate-900 font-mono">
                  {counts.unread}
                </span>
                <span className="text-xs text-slate-500 font-medium">Unread Alerts</span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/60 flex flex-col">
                <span className="text-2xl font-black text-slate-900 font-mono">
                  {counts.interview}
                </span>
                <span className="text-xs text-slate-500 font-medium">Interview Items</span>
              </div>
            </div>

            {/* Upcoming Interview Callout */}
            <div className="rounded-xl border border-purple-200/80 bg-purple-50/50 p-3.5 flex items-start gap-3">
              <Calendar className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-xs font-bold text-purple-900">
                  Next Interview: 17 Sep, 03:00 PM
                </span>
                <span className="text-[11px] text-purple-700 leading-tight">
                  RazorWave Technologies • Technical Architecture
                </span>
                <Link
                  href="/candidate/applications/app_01"
                  className="text-[11px] font-semibold text-purple-800 hover:text-purple-900 underline mt-0.5"
                >
                  View Details &amp; Preparation Guide →
                </Link>
              </div>
            </div>
          </div>

          {/* B. Delivery Channels Settings */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col gap-3.5">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Delivery Channels</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed -mt-1.5">
              Choose how and where you want to receive time-sensitive hiring alerts.
            </p>

            <div className="flex flex-col divide-y divide-slate-100 text-xs">
              {/* In-App Notifications */}
              <div className="py-3.5 first:pt-1 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Bell className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-800 block">In-App Notifications</span>
                    <span className="text-slate-400 text-[11px]">Real-time bell badge and feed</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updatePreference("inApp", !preferences.inApp)}
                  className={cn(
                    "w-9 h-5 rounded-full transition-colors relative cursor-pointer shrink-0",
                    preferences.inApp ? "bg-blue-600" : "bg-slate-200"
                  )}
                >
                  <span
                    className={cn(
                      "w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-transform",
                      preferences.inApp ? "right-1" : "left-1"
                    )}
                  />
                </button>
              </div>

              {/* Email Notifications & Digest */}
              <div className="py-3.5 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-800 block">Email Alerts</span>
                      <span className="text-slate-400 text-[11px]">candidate@tagjobs.in</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updatePreference("email", !preferences.email)}
                    className={cn(
                      "w-9 h-5 rounded-full transition-colors relative cursor-pointer shrink-0",
                      preferences.email ? "bg-blue-600" : "bg-slate-200"
                    )}
                  >
                    <span
                      className={cn(
                        "w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-transform",
                        preferences.email ? "right-1" : "left-1"
                      )}
                    />
                  </button>
                </div>

                {/* Email frequency selector */}
                {preferences.email && (
                  <div className="flex items-center gap-1.5 pl-6.5 pt-1">
                    <span className="text-[11px] text-slate-400">Frequency:</span>
                    {(["instant", "daily", "weekly"] as const).map((freq) => (
                      <button
                        key={freq}
                        type="button"
                        onClick={() => updatePreference("emailFrequency", freq)}
                        className={cn(
                          "px-2.5 py-0.5 rounded-md text-[10px] font-medium transition-colors capitalize",
                          preferences.emailFrequency === freq
                            ? "bg-blue-50 text-blue-700 font-semibold border border-blue-200/80"
                            : "text-slate-500 hover:bg-slate-100"
                        )}
                      >
                        {freq}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* WhatsApp / SMS Alerts */}
              <div className="py-3.5 last:pb-1 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Smartphone className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-800 block">WhatsApp / SMS</span>
                    <span className="text-slate-400 text-[11px]">Critical interview confirmations</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updatePreference("whatsapp", !preferences.whatsapp)}
                  className={cn(
                    "w-9 h-5 rounded-full transition-colors relative cursor-pointer shrink-0",
                    preferences.whatsapp ? "bg-blue-600" : "bg-slate-200"
                  )}
                >
                  <span
                    className={cn(
                      "w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-transform",
                      preferences.whatsapp ? "right-1" : "left-1"
                    )}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* C. Subscribed Alert Categories */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col gap-3.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Subscribed Topics
            </span>

            <div className="flex flex-col gap-3.5 text-xs pt-0.5">
              <label className="flex items-center justify-between cursor-pointer group py-0.5">
                <span className="text-slate-700 group-hover:text-slate-900 transition-colors">
                  Interview Scheduling &amp; Reschedules
                </span>
                <input
                  type="checkbox"
                  checked={preferences.catInterviews}
                  onChange={(e) => updatePreference("catInterviews", e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group py-0.5">
                <span className="text-slate-700 group-hover:text-slate-900 transition-colors">
                  High-Alignment Job Matches (≥80%)
                </span>
                <input
                  type="checkbox"
                  checked={preferences.catMatches}
                  onChange={(e) => updatePreference("catMatches", e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group py-0.5">
                <span className="text-slate-700 group-hover:text-slate-900 transition-colors">
                  Application Stage Movements
                </span>
                <input
                  type="checkbox"
                  checked={preferences.catApplications}
                  onChange={(e) => updatePreference("catApplications", e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group py-0.5">
                <span className="text-slate-700 group-hover:text-slate-900 transition-colors">
                  Trust, Verification &amp; Security Alerts
                </span>
                <input
                  type="checkbox"
                  checked={preferences.catSecurity}
                  onChange={(e) => updatePreference("catSecurity", e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
