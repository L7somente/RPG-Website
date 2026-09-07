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
    <section className="rounded-lg bg-parchment text-parchmentText p-5 shadow-lg">
      <h2 className="font-display text-lg tracking-wide mb-3">{t("missionLog")}</h2>
      <ol className="space-y-3 border-l border-parchment-line pl-4">
        {entries.length === 0 && <li className="text-sm text-parchmentText/60">{t("noCompletedQuests")}</li>}
        {entries.map((e) => (
          <li key={e.id} className="relative">
            <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-brass" />
            <p className="font-medium">{e.title}</p>
            <p className="text-sm text-parchmentText/70">{e.summary}</p>
            <p className="text-xs font-mono text-parchmentText/40">
              {new Date(e.completedAt).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
