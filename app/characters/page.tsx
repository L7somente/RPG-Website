"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { CLASSES } from "@/lib/dnd-data/classes";
import { RACES } from "@/lib/dnd-data/races";

type Character = {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
};

const MAX_SLOTS = 5;

export default function CharactersPage() {
  const { t } = useLanguage();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", raceId: "", classId: "" });
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/characters");
    const data = await res.json();
    setCharacters(data.characters ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function createCharacter(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const raceDef = RACES.find((r) => r.id === form.raceId);
    const classDef = CLASSES.find((c) => c.id === form.classId);
    if (!raceDef || !classDef) {
      setError(t("selectRacePlaceholder"));
      return;
    }
    const res = await fetch("/api/characters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        race: t(raceDef.i18nKey),
        class: t(classDef.i18nKey),
        raceId: raceDef.id,
        classId: classDef.id,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? t("couldNotCreateCharacter"));
      return;
    }
    setForm({ name: "", raceId: "", classId: "" });
    setShowForm(false);
    load();
  }

  const slotsLeft = MAX_SLOTS - characters.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-2xl text-brass-bright">{t("yourCharacters")}</h1>
        <span className="font-mono text-sm text-parchment/60">{characters.length} / {MAX_SLOTS} {t("slotsUsed")}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {characters.map((c) => (
          <Link
            key={c.id}
            href={`/characters/${c.id}`}
            className="rounded-lg bg-ink-panel text-parchment p-4 shadow-lg hover:-translate-y-0.5 transition-transform"
          >
            <p className="font-display text-lg">{c.name}</p>
            <p className="text-sm text-parchment/70">
              {t("levelLabel")} {c.level} {c.race} {c.class}
            </p>
          </Link>
        ))}

        {slotsLeft > 0 && <button onClick={() => setShowForm(true)} className="rounded-xl border border-dashed border-brass/30 p-5 text-brass hover:bg-ink-panel flex items-center justify-center min-h-[92px]">+ {t("newCharacter")}</button>}
      </div>

      {showForm && (
        <form onSubmit={createCharacter} className="mt-6 max-w-sm rounded-lg bg-ink-panel text-parchment p-4 space-y-3">
          <input
            required
            placeholder={t("namePlaceholder")}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded border border-white/10 bg-ink900 px-3 py-2 text-sm"
          />
          <select
            required
            value={form.raceId}
            onChange={(e) => setForm({ ...form, raceId: e.target.value })}
            className="w-full rounded border border-white/10 bg-ink900 px-3 py-2 text-sm"
          >
            <option value="">{t("selectRacePlaceholder")}</option>
            {RACES.map((r) => (
              <option key={r.id} value={r.id}>
                {t(r.i18nKey)}
              </option>
            ))}
          </select>
          <select
            required
            value={form.classId}
            onChange={(e) => setForm({ ...form, classId: e.target.value })}
            className="w-full rounded border border-white/10 bg-ink900 px-3 py-2 text-sm"
          >
            <option value="">{t("selectClassPlaceholder")}</option>
            {CLASSES.map((c) => (
              <option key={c.id} value={c.id}>
                {t(c.i18nKey)}
              </option>
            ))}
          </select>
          {error && <p className="text-sm text-crimson">{error}</p>}
          <button type="submit" className="rounded bg-brass px-4 py-2 text-sm font-medium text-ink900 hover:bg-brass-bright">
            {t("create")}
          </button>
        </form>
      )}
    </div>
  );
}
