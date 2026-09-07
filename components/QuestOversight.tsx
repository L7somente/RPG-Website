"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type Voter = { userId: string; user: { username: string } };
type Quest = {
  id: string;
  title: string;
  description: string;
  status: string;
  xpReward: number;
  creator: { id: string; username: string };
  votes: Voter[];
};

const STATUS_STYLE: Record<string, string> = {
  pending_approval: "text-brass-bright",
  available: "text-verdant",
  active: "text-crimson-bright",
  completed: "text-parchmentText/50",
  rejected: "text-crimson",
};

// Master admin's full view of every quest, grouped by the Master who
// submitted it. Reward is editable here regardless of status; pending
// quests additionally get Approve/Reject.
export default function QuestOversight() {
  const { t } = useLanguage();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [rewardDraft, setRewardDraft] = useState<Record<string, number>>({});

  const STATUS_LABEL: Record<string, string> = {
    pending_approval: t("statusPendingApproval"),
    available: t("statusApprovedAvailable"),
    active: t("statusActive"),
    completed: t("statusCompleted"),
    rejected: t("statusRejected"),
  };

  async function load() {
    const res = await fetch("/api/quests");
    const data = await res.json();
    const list: Quest[] = data.quests ?? [];
    setQuests(list);
    const drafts: Record<string, number> = {};
    list.forEach((q) => (drafts[q.id] = q.xpReward));
    setRewardDraft(drafts);
  }

  useEffect(() => {
    load();
  }, []);

  async function saveReward(id: string) {
    await fetch(`/api/quests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ xpReward: rewardDraft[id] }),
    });
    load();
  }

  async function decide(id: string, decision: "approve" | "reject") {
    await fetch(`/api/quests/${id}/approve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, xpReward: rewardDraft[id] }),
    });
    load();
  }

  const byDM = new Map<string, { username: string; quests: Quest[] }>();
  for (const q of quests) {
    const entry = byDM.get(q.creator.id) ?? { username: q.creator.username, quests: [] };
    entry.quests.push(q);
    byDM.set(q.creator.id, entry);
  }

  return (
    <section className="rounded-lg bg-parchment text-parchmentText p-5 shadow-lg">
      <h2 className="font-display text-lg mb-1">{t("questsByMaster")}</h2>
      <p className="text-xs text-parchmentText/60 mb-4">{t("questsByMasterHint")}</p>

      {byDM.size === 0 && <p className="text-sm text-parchmentText/60">{t("noQuestsRegisteredYet")}</p>}

      <div className="space-y-5">
        {[...byDM.entries()].map(([dmId, group]) => (
          <div key={dmId}>
            <h3 className="font-mono text-xs uppercase tracking-widest text-brass mb-2">{group.username}</h3>
            <ul className="space-y-3">
              {group.quests.map((q) => (
                <li key={q.id} className="ledger-rule pb-3">
                  <p className="font-medium">{q.title}</p>
                  <p className="text-sm text-parchmentText/70">{q.description}</p>
                  <p className={`text-xs font-mono ${STATUS_STYLE[q.status]}`}>{STATUS_LABEL[q.status] ?? q.status}</p>
                  {q.votes.length > 0 && (
                    <p className="text-xs text-parchmentText/50 mt-1">
                      {t("votedLabel")}: {q.votes.map((v) => v.user.username).join(", ")}
                    </p>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <label className="text-xs font-mono text-parchmentText/60">XP:</label>
                    <input
                      type="number"
                      min={0}
                      value={rewardDraft[q.id] ?? q.xpReward}
                      onChange={(e) => setRewardDraft({ ...rewardDraft, [q.id]: Number(e.target.value) })}
                      className="w-20 rounded border border-parchment-line bg-parchment-dim px-2 py-1 text-sm"
                    />
                    <button
                      onClick={() => saveReward(q.id)}
                      className="text-xs rounded bg-brass px-2 py-1 text-ink900 font-medium hover:bg-brass-bright"
                    >
                      {t("saveBtn")}
                    </button>

                    {q.status === "pending_approval" && (
                      <>
                        <button
                          onClick={() => decide(q.id, "approve")}
                          className="text-xs rounded bg-verdant px-2 py-1 text-ink900 font-medium"
                        >
                          {t("approveBtn")}
                        </button>
                        <button
                          onClick={() => decide(q.id, "reject")}
                          className="text-xs rounded bg-crimson px-2 py-1 text-parchment font-medium"
                        >
                          {t("rejectBtn")}
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
