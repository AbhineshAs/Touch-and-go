"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { NotificationItem } from "@/types";
import { MOCK_NOTIFICATIONS } from "@/lib/mocks/data";
import { formatRelativeTime } from "@/lib/utils";
import { Bell, Calendar, Sparkles, CheckCheck, ShieldCheck, ArrowRight } from "lucide-react";

export default function CandidateNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    MOCK_NOTIFICATIONS.filter((n) => n.userId === "usr_cand_01")
  );

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const toggleRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "interview":
        return <Calendar className="w-4 h-4 text-primary" />;
      case "match":
        return <Sparkles className="w-4 h-4 text-primary" />;
      default:
        return <Bell className="w-4 h-4 text-text-muted" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Notifications</h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Updates on your active applications, interview schedules, and new matching jobs.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          leftIcon={<CheckCheck className="w-3.5 h-3.5" />}
          onClick={handleMarkAllRead}
        >
          Mark all as read
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {notifications.map((notif) => (
          <Card
            key={notif.id}
            className={`p-4 sm:p-5 flex items-start justify-between gap-4 border transition-all ${
              notif.read ? "bg-surface border-border" : "bg-primary-soft/20 border-primary/30 shadow-xs"
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  notif.read ? "bg-background text-text-muted" : "bg-primary-soft text-primary"
                }`}
              >
                {getIcon(notif.type)}
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-text-primary">{notif.title}</h3>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  )}
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{notif.message}</p>
                <span className="text-[11px] text-text-muted mt-1">
                  {formatRelativeTime(notif.createdAt)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {notif.link && (
                <Link href={notif.link}>
                  <Button size="sm" variant="secondary" rightIcon={<ArrowRight className="w-3 h-3" />}>
                    View
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
