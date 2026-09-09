"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function DMQuestForm({ onCreated }: { onCreated?: () => void }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({ title: "", description: "", xpReward: 100 });
  const [status, setStatus] = useState<null | "ok" | "error">(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/quests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setStatus("ok");
      setForm({ title: "", description: "", xpReward: 100 });
      onCreated?.();
    } else {
      setStatus("error");
    }
  }

  return (
    <section className="rounded-lg bg-ink-panel text-parchment p-5 shadow-lg">
      <h2 className="font-display text-lg mb-1">{t("submitQuest")}</h2>
      <p className="text-xs text-parchment/60 mb-3">{t("submitQuestHint")}</p>
      <form onSubmit={submit} className="space-y-2">
        <input
          required
          placeholder={t("titlePlaceholder")}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full rounded border border-white/10 bg-ink900 px-3 py-2 text-sm"
        />
        <textarea
          required
          placeholder={t("descriptionPlaceholder")}
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded border border-white/10 bg-ink900 px-3 py-2 text-sm"
        />
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono uppercase text-parchment/60">{t("xpRewardLabel")}</label>
          <input
            type="number"
            min={0}
            value={form.xpReward}
            onChange={(e) => setForm({ ...form, xpReward: Number(e.target.value) })}
            className="w-24 rounded border border-white/10 bg-ink900 px-2 py-1 text-sm"
          />
        </div>
        {status === "ok" && <p className="text-sm text-verdant">{t("submittedAwaitingApproval")}</p>}
        {status === "error" && <p className="text-sm text-crimson">{t("couldNotSubmitQuest")}</p>}
        <button type="submit" className="rounded bg-brass px-4 py-2 text-sm font-medium text-ink900 hover:bg-brass-bright">
          {t("submitForApproval")}
        </button>
      </form>
    </section>
  );
}
