"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { CLASSES, classById } from "@/lib/dnd-data/classes";
import type { Character, SaveFn } from "./CharacterSheet";

type ClassEntry = { id: string; level: number };

// Recomputes the derived display fields (class summary string, total level,
// proficiency bonus) any time the classes array changes, and saves all of it
// together — this is what keeps "Fighter 3 / Wizard 2" and the level shown
// in the sheet header in sync with the multiclass breakdown below.
function deriveAndSave(entries: ClassEntry[], t: (k: string) => string, save: SaveFn) {
  const totalLevel = entries.reduce((sum, e) => sum + e.level, 0) || 1;
  const summary =
    entries
      .filter((e) => e.level > 0)
      .map((e) => `${t(classById(e.id)?.i18nKey ?? "")} ${e.level}`)
      .join(" / ") || "—";
  const proficiencyBonus = 2 + Math.floor((totalLevel - 1) / 4);

  save({
    classes: entries,
    class: summary,
    level: totalLevel,
    proficiencyBonus,
  });
}

export default function MulticlassEditor({ sheet, save }: { sheet: Character; save: SaveFn }) {
  const { t } = useLanguage();
  const entries: ClassEntry[] = Array.isArray(sheet.classes) && sheet.classes.length > 0 ? sheet.classes : [{ id: "fighter", level: sheet.level || 1 }];

  function updateEntry(index: number, patch: Partial<ClassEntry>) {
    const next = entries.map((e, i) => (i === index ? { ...e, ...patch } : e));
    deriveAndSave(next, t, save);
  }
  function addClass() {
    const unused = CLASSES.find((c) => !entries.some((e) => e.id === c.id));
    deriveAndSave([...entries, { id: unused?.id ?? "fighter", level: 1 }], t, save);
  }
  function removeClass(index: number) {
    if (entries.length <= 1) return;
    deriveAndSave(entries.filter((_, i) => i !== index), t, save);
  }

  const totalLevel = entries.reduce((sum, e) => sum + e.level, 0);

  return (
    <div className="rounded border border-parchment-line bg-parchment-dim p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-display text-sm">{t("multiclassLabel")}</h3>
        <span className="text-xs font-mono text-parchmentText/60">
          {t("totalLevelLabel")}: {totalLevel}
        </span>
      </div>
      <div className="space-y-2">
        {entries.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <select
              value={entry.id}
              onChange={(e) => updateEntry(i, { id: e.target.value })}
              className="flex-1 rounded border border-parchment-line bg-parchment px-2 py-1 text-sm"
            >
              {CLASSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {t(c.i18nKey)} (d{c.hitDie})
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              max={20}
              value={entry.level}
              onChange={(e) => updateEntry(i, { level: Math.max(1, Number(e.target.value)) })}
              className="w-16 rounded border border-parchment-line bg-parchment px-2 py-1 text-sm text-center"
            />
            {entries.length > 1 && (
              <button onClick={() => removeClass(i)} className="text-crimson text-xs px-1">
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      <button onClick={addClass} className="mt-2 text-xs text-brass hover:text-brass-bright">
        {t("addClass")}
      </button>
      <p className="text-[11px] text-parchmentText/50 mt-2">{t("autoFillHint")}</p>
    </div>
  );
}
