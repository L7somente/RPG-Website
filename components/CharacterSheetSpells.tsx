"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { CLASSES } from "@/lib/dnd-data/classes";
import { multiclassCasterLevel, spellSlotsForCasterLevel } from "@/lib/dnd-data/spellSlots";
import type { Character, SaveFn } from "./CharacterSheet";

const SPELL_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export default function CharacterSheetSpells({ sheet, save }: { sheet: Character; save: SaveFn }) {
  const { t } = useLanguage();

  const casterLevel = multiclassCasterLevel(Array.isArray(sheet.classes) ? sheet.classes : [], CLASSES);

  function autoFillSlots() {
    save({ spellSlots: spellSlotsForCasterLevel(casterLevel) });
  }

  function addSpell(level: number) {
    save({ spellsKnown: [...sheet.spellsKnown, { name: "", level, prepared: false }] });
  }
  function updateSpell(index: number, patch: Partial<{ name: string; prepared: boolean }>) {
    const next = sheet.spellsKnown.map((s, i) => (i === index ? { ...s, ...patch } : s));
    save({ spellsKnown: next });
  }
  function removeSpell(index: number) {
    save({ spellsKnown: sheet.spellsKnown.filter((_, i) => i !== index) });
  }
  function updateSlots(level: number, patch: Partial<{ max: number; used: number }>) {
    const key = String(level);
    const current = sheet.spellSlots[key] ?? { max: 0, used: 0 };
    save({ spellSlots: { ...sheet.spellSlots, [key]: { ...current, ...patch } } });
  }

  const cantrips = sheet.spellsKnown
    .map((s, i) => ({ ...s, i }))
    .filter((s) => s.level === 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="text-xs font-mono uppercase text-parchment/60 block mb-0.5">
            {t("spellcastingClassLabel")}
          </label>
          <input
            defaultValue={sheet.spellcastingClass}
            onBlur={(e) => save({ spellcastingClass: e.target.value })}
            className="w-full rounded border border-white/10 bg-ink900 px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-mono uppercase text-parchment/60 block mb-0.5">
            {t("spellcastingAbilityLabel")}
          </label>
          <input
            defaultValue={sheet.spellcastingAbility}
            onBlur={(e) => save({ spellcastingAbility: e.target.value })}
            className="w-full rounded border border-white/10 bg-ink900 px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-mono uppercase text-parchment/60 block mb-0.5">
            {t("spellSaveDCLabel")}
          </label>
          <input
            type="number"
            value={sheet.spellSaveDC}
            onChange={(e) => save({ spellSaveDC: Number(e.target.value) })}
            className="w-full rounded border border-white/10 bg-ink900 px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-mono uppercase text-parchment/60 block mb-0.5">
            {t("spellAttackBonusLabel")}
          </label>
          <input
            type="number"
            value={sheet.spellAttackBonus}
            onChange={(e) => save({ spellAttackBonus: Number(e.target.value) })}
            className="w-full rounded border border-white/10 bg-ink900 px-2 py-1 text-sm"
          />
        </div>
      </div>

      {casterLevel > 0 && (
        <button
          onClick={autoFillSlots}
          className="text-xs rounded bg-brass px-3 py-1.5 font-medium text-ink900 hover:bg-brass-bright"
        >
          {t("autoFillSlots")} ({t("totalLevelLabel")} {casterLevel})
        </button>
      )}

      {/* Cantrips */}
      <div className="rounded border border-white/10 bg-ink900 p-3">
        <h3 className="font-display text-sm mb-2">{t("cantripsLabel")}</h3>
        <div className="space-y-1">
          {cantrips.map((s) => (
            <div key={s.i} className="flex items-center gap-2">
              <input
                value={s.name}
                onChange={(e) => updateSpell(s.i, { name: e.target.value })}
                placeholder={t("spellNamePlaceholder")}
                className="flex-1 rounded border border-white/10 bg-ink-panel px-2 py-1 text-sm"
              />
              <button onClick={() => removeSpell(s.i)} className="text-crimson text-xs px-1">
                ×
              </button>
            </div>
          ))}
        </div>
        <button onClick={() => addSpell(0)} className="mt-2 text-xs text-brass hover:text-brass-bright">
          {t("addSpell")}
        </button>
      </div>

      {/* Levels 1-9 */}
      <div className="grid sm:grid-cols-3 gap-3">
        {SPELL_LEVELS.map((level) => {
          const slots = sheet.spellSlots[String(level)] ?? { max: 0, used: 0 };
          const spells = sheet.spellsKnown.map((s, i) => ({ ...s, i })).filter((s) => s.level === level);
          return (
            <div key={level} className="rounded border border-white/10 bg-ink900 p-3">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-display text-sm">
                  {t("spellLevelLabel")} {level}
                </h4>
                <div className="flex items-center gap-1 text-xs font-mono text-parchment/60">
                  <input
                    type="number"
                    min={0}
                    value={slots.max}
                    onChange={(e) => updateSlots(level, { max: Number(e.target.value) })}
                    className="w-8 bg-transparent text-center border-b border-white/10"
                    title={t("slotsTotalLabel")}
                  />
                  /
                  <input
                    type="number"
                    min={0}
                    value={slots.used}
                    onChange={(e) => updateSlots(level, { used: Number(e.target.value) })}
                    className="w-8 bg-transparent text-center border-b border-white/10"
                    title={t("slotsUsedLabel")}
                  />
                </div>
              </div>
              <div className="space-y-1">
                {spells.map((s) => (
                  <div key={s.i} className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={!!s.prepared}
                      onChange={(e) => updateSpell(s.i, { prepared: e.target.checked })}
                      title={t("preparedAbbr")}
                    />
                    <input
                      value={s.name}
                      onChange={(e) => updateSpell(s.i, { name: e.target.value })}
                      placeholder={t("spellNamePlaceholder")}
                      className="flex-1 rounded border border-white/10 bg-ink-panel px-2 py-0.5 text-xs"
                    />
                    <button onClick={() => removeSpell(s.i)} className="text-crimson text-xs px-1">
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => addSpell(level)} className="mt-1.5 text-xs text-brass hover:text-brass-bright">
                {t("addSpell")}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
