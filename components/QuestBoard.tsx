"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type Voter = { userId: string; user: { id: string; username: string } };
type Quest = {
  id: string;
  title: string;
  description: string;
  status: "available" | "active" | "completed" | "pending_approval" | "rejected";
  xpReward: number;
  creator: { id: string; username: string };
  votes: Voter[];
};
type UpcomingSession = { id: string; createdBy: string };

export default function QuestBoard() {
  const { data: authSession } = useSession();
  const { t } = useLanguage();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [dmsWithUpcoming, setDmsWithUpcoming] = useState<Set<string>>(new Set());

  async function load() {
    const [qRes, sRes] = await Promise.all([fetch("/api/quests"), fetch("/api/sessions")]);
    const qData = await qRes.json();
    const sData = await sRes.json();
    setQuests(qData.quests ?? []);
    // /api/sessions already only returns sessions scheduled in the future ("Upcoming").
    const dmIds = new Set<string>((sData.sessions ?? []).map((s: UpcomingSession) => s.createdBy));
    setDmsWithUpcoming(dmIds);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleVote(questId: string) {
    if (!authSession) return;
    await fetch(`/api/quests/${questId}/vote`, { method: "POST" });
    load();
  }

  // A quest only appears here if its DM has at least one upcoming session scheduled.
  const visible = quests.filter(
    (q) => (q.status === "active" || q.status === "available") && dmsWithUpcoming.has(q.creator.id)
  );

  const byDM = new Map<string, { username: string; quests: Quest[] }>();
  for (const q of visible) {
    const entry = byDM.get(q.creator.id) ?? { username: q.creator.username, quests: [] };
    entry.quests.push(q);
    byDM.set(q.creator.id, entry);
  }

  const myId = (authSession?.user as any)?.id;

  return (
    <section className="rounded-lg bg-parchment text-parchmentText p-5 shadow-lg">
      <h2 className="font-display text-lg tracking-wide mb-1">{t("questBoard")}</h2>
      <p className="text-xs text-parchmentText/60 mb-3">{t("questBoardHint")}</p>

      {byDM.size === 0 && <p className="text-sm text-parchmentText/60">{t("noQuestsAvailable")}</p>}

      <div className="space-y-5">
        {[...byDM.entries()].map(([dmId, group]) => (
          <div key={dmId}>
            <h3 className="font-mono text-xs uppercase tracking-widest text-brass mb-2">
              {t("masterLabel")}: {group.username}
            </h3>
            <ul className="space-y-3">
              {group.quests.map((q) => {
                const iVoted = !!myId && q.votes.some((v) => v.userId === myId);
                return (
                  <li key={q.id} className="ledger-rule pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="font-medium">
                          {q.title}{" "}
                          <span className={`text-xs font-mono ${q.status === "active" ? "text-crimson" : "text-verdant"}`}>
                            {q.status === "active" ? t("statusActive") : t("statusAvailable")}
                          </span>
                        </p>
                        <p className="text-sm text-parchmentText/70">{q.description}</p>
                      </div>
                      <span className="shrink-0 font-mono text-xs text-verdant">+{q.xpReward} XP</span>
                    </div>

                    <div className="mt-2 flex items-center flex-wrap gap-2">
                      <button
                        onClick={() => toggleVote(q.id)}
                        disabled={!authSession}
                        className={`text-xs rounded-full px-3 py-1 font-medium ${
                          iVoted ? "bg-brass text-ink900" : "bg-parchment-dim text-parchmentText/70 hover:bg-parchment-line"
                        }`}
                      >
                        {iVoted ? `✓ ${t("voted")}` : t("vote")} ({q.votes.length})
                      </button>
                      {q.votes.length > 0 && (
                        <span className="text-xs text-parchmentText/50">
                          {q.votes.map((v) => v.user.username).join(", ")}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
