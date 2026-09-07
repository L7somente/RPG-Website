"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type Announcement = {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: string;
};

export default function NoticeBoard() {
  const { t } = useLanguage();
  const [notices, setNotices] = useState<Announcement[]>([]);

  useEffect(() => {
    fetch("/api/announcements")
      .then((r) => r.json())
      .then((d) => setNotices(d.announcements ?? []));
  }, []);

  return (
    <section className="rounded-lg bg-ink-panel border border-brass/30 p-5">
      <h2 className="font-display text-lg tracking-wide mb-3 text-brass-bright">{t("dmNoticeBoard")}</h2>
      <ul className="space-y-3">
        {notices.length === 0 && <li className="text-sm text-parchment/60">{t("noAnnouncementsYet")}</li>}
        {notices.map((n) => (
          <li key={n.id} className="border-l-2 border-brass/60 pl-3">
            <div className="flex items-center gap-2">
              {n.pinned && <span className="text-xs font-mono text-crimson-bright">{t("pinned")}</span>}
              <p className="font-medium">{n.title}</p>
            </div>
            <p className="text-sm text-parchment/70">{n.content}</p>
            <p className="text-xs font-mono text-parchment/40 mt-1">
              {new Date(n.createdAt).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
