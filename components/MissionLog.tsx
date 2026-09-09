"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type Entry = {
  id: string;
  title: string;
  summary: string;
  completedAt: string;
};

export default function MissionLog() {
  const { t } = useLanguage();
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    fetch("/api/mission-log")
      .then((r) => r.json())
      .then((d) => setEntries(d.entries ?? []));
  }, []);

  return (
    <section className="rounded-lg bg-ink-panel text-parchment p-5 shadow-lg">
      <h2 className="font-display text-lg tracking-wide mb-3">{t("missionLog")}</h2>
      <ol className="space-y-3 border-l border-white/10 pl-4">
        {entries.length === 0 && <li className="text-sm text-parchment/60">{t("noCompletedQuests")}</li>}
        {entries.map((e) => (
          <li key={e.id} className="relative">
            <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-brass" />
            <p className="font-medium">{e.title}</p>
            <p className="text-sm text-parchment/70">{e.summary}</p>
            <p className="text-xs font-mono text-parchment/60">
              {new Date(e.completedAt).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
