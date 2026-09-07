"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type Quest = {
  id: string;
  title: string;
  description: string;
  status: string;
  xpReward: number;
  createdBy: string;
};

const STATUS_STYLE: Record<string, string> = {
  pending_approval: "text-brass",
  available: "text-verdant",
  active: "text-crimson-bright",
  completed: "text-parchment/50",
  rejected: "text-crimson",
};

export default function DMQuestQueue({ refreshKey }: { refreshKey?: number }) {
  const { data: authSession } = useSession();
  const { t } = useLanguage();
  const [quests, setQuests] = useState<Quest[]>([]);

  const STATUS_LABEL: Record<string, string> = {
    pending_approval: t("statusPendingApproval"),
    available: t("statusApprovedAvailable"),
    active: t("statusActiveLong"),
    completed: t("statusCompleted"),
    rejected: t("statusRejected"),
  };

  async function load() {
    const res = await fetch("/api/quests");
    const data = await res.json();
    const myId = (authSession?.user as any)?.id;
    setQuests((data.quests ?? []).filter((q: Quest) => q.createdBy === myId));
  }

  useEffect(() => {
    if (authSession) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authSession, refreshKey]);

  async function advance(id: string, status: string) {
    await fetch(`/api/quests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  return (
    <section className="rounded-lg bg-ink-panel border border-brass/30 p-5">
      <h2 className="font-display text-lg text-brass-bright mb-3">{t("mySubmittedQuests")}</h2>
      <ul className="space-y-2">
        {quests.length === 0 && <li className="text-sm text-parchment/60">{t("noQuestsSubmittedYet")}</li>}
        {quests.map((q) => (
          <li key={q.id} className="border-l-2 border-brass/40 pl-3 py-1 flex justify-between items-start gap-3">
            <div>
              <p className="font-medium">{q.title}</p>
              <p className={`text-xs font-mono ${STATUS_STYLE[q.status]}`}>{STATUS_LABEL[q.status] ?? q.status}</p>
            </div>
            {q.status === "available" && (
              <button onClick={() => advance(q.id, "active")} className="text-xs rounded bg-brass px-2 py-1 text-ink900">
                {t("markActive")}
              </button>
            )}
            {q.status === "active" && (
              <button onClick={() => advance(q.id, "completed")} className="text-xs rounded bg-verdant px-2 py-1 text-ink900">
                {t("markCompleted")}
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
