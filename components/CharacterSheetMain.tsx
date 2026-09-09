"use client";

import SpeedField from "./SpeedField";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { ABILITY_KEYS, ABILITY_I18N_KEY, SKILLS, abilityModifier, formatModifier } from "@/lib/dnd-data";
import { classById, averageHpPerLevel } from "@/lib/dnd-data/classes";
import type { Character, SaveFn } from "./CharacterSheet";
import MulticlassEditor from "./MulticlassEditor";

export default function CharacterSheetMain({ sheet, save }: { sheet: Character; save: SaveFn }) {
  const { t } = useLanguage();

  const perception = SKILLS.find((s) => s.id === "perception")!;
  const passivePerception =
    10 +
    abilityModifier(sheet[perception.ability]) +
    (sheet.skillProficiencies.includes("perception") ? sheet.proficiencyBonus : 0) +
    (sheet.skillExpertise.includes("perception") ? sheet.proficiencyBonus : 0);

  // Initiative = Dex modifier + any misc bonus (feats like Alert, magic items, etc).
  // `sheet.initiative` stores just that misc bonus; the total shown is computed.
  const totalInitiative = abilityModifier(sheet.dexterity) + sheet.initiative;

  const conMod = abilityModifier(sheet.constitution);
  const classList = Array.isArray(sheet.classes) ? sheet.classes : [];
  let suggestedMaxHp = 0;
  let isFirstLevelOverall = true;
  for (const entry of classList) {
    const def = classById(entry.id);
    if (!def) continue;
    for (let lvl = 1; lvl <= entry.level; lvl++) {
      suggestedMaxHp += isFirstLevelOverall ? def.hitDie + conMod : averageHpPerLevel(def.hitDie) + conMod;
      isFirstLevelOverall = false;
    }
  }

  function toggleInList(list: string[], id: string, field: "skillProficiencies" | "skillExpertise" | "savingThrowProfs") {
    const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
    save({ [field]: next } as Partial<Character>);
  }

  function updateAttack(index: number, patch: Partial<{ name: string; bonus: string; damageType: string }>) {
    const next = sheet.attacks.map((a, i) => (i === index ? { ...a, ...patch } : a));
    save({ attacks: next });
  }
  function addAttack() {
    save({ attacks: [...sheet.attacks, { name: "", bonus: "", damageType: "" }] });
  }
  function removeAttack(index: number) {
    save({ attacks: sheet.attacks.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-mono uppercase text-parchment/60 block mb-0.5">{t("playerNameLabel")}</label>
          <input
            defaultValue={sheet.playerName}
            onBlur={(e) => save({ playerName: e.target.value })}
            className="w-full rounded border border-white/10 bg-ink900 px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-mono uppercase text-parchment/60 block mb-0.5">{t("backgroundLabel")}</label>
          <input
            defaultValue={sheet.background ?? ""}
            onBlur={(e) => save({ background: e.target.value })}
            className="w-full rounded border border-white/10 bg-ink900 px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-mono uppercase text-parchment/60 block mb-0.5">{t("alignmentLabel")}</label>
          <input
            defaultValue={sheet.alignment ?? ""}
            onBlur={(e) => save({ alignment: e.target.value })}
            className="w-full rounded border border-white/10 bg-ink900 px-2 py-1 text-sm"
          />
        </div>
      </div>

      <MulticlassEditor sheet={sheet} save={save} />

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="rounded border border-white/10 bg-ink900 text-center py-2 flex flex-col items-center justify-center gap-1">
          <p className="font-mono text-xs uppercase text-parchment/60">{t("inspirationLabel")}</p>
          <input
            type="checkbox"
            checked={sheet.inspiration}
            onChange={(e) => save({ inspiration: e.target.checked })}
            className="h-5 w-5"
          />
        </div>
        <Stat label={t("profBonus")} value={sheet.proficiencyBonus} onChange={(v) => save({ proficiencyBonus: v })} prefix="+" />
        <Stat label={t("armorClassLabel")} value={sheet.armorClass} onChange={(v) => save({ armorClass: v })} />
        <div className="rounded border border-white/10 bg-ink900 text-center py-2">
          <p className="font-mono text-xs uppercase text-parchment/60">{t("initiativeLabel")}</p>
          <p className="font-display text-lg text-brass">{formatModifier(totalInitiative)}</p>
          <label className="text-[9px] font-mono text-parchment/60 block">{t("otherInitiativeBonusLabel")}</label>
          <input
            type="number"
            value={sheet.initiative}
            onChange={(e) => save({ initiative: Number(e.target.value) })}
            className="w-10 text-center bg-transparent text-xs"
          />
        </div>
        <SpeedField feet={sheet.speed} onChange={(speed) => save({ speed })} />
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {ABILITY_KEYS.map((key) => (
          <div key={key} className="rounded border border-white/10 bg-ink900 text-center py-2">
            <p className="font-mono text-xs uppercase text-parchment/60">{t(ABILITY_I18N_KEY[key])}</p>
            <input
              type="number"
              value={sheet[key]}
              onChange={(e) => save({ [key]: Number(e.target.value) } as Partial<Character>)}
              className="w-12 text-center bg-transparent font-display text-xl"
            />
            <p className="font-mono text-xs text-brass">{formatModifier(abilityModifier(sheet[key]))}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded border border-white/10 bg-ink900 px-3 py-2 col-span-2 sm:col-span-1">
          <p className="font-mono text-xs uppercase text-parchment/60">{t("hitPoints")}</p>
          <div className="flex items-center gap-1 font-display text-lg">
            <input
              type="number"
              value={sheet.currentHp}
              onChange={(e) => save({ currentHp: Number(e.target.value) })}
              className="w-10 bg-transparent text-crimson"
            />
            <span>/</span>
            <input
              type="number"
              value={sheet.maxHp}
              onChange={(e) => save({ maxHp: Number(e.target.value) })}
              className="w-10 bg-transparent"
            />
            {sheet.tempHp > 0 && <span className="text-xs text-verdant">+{sheet.tempHp} {t("temp")}</span>}
          </div>
          {suggestedMaxHp > 0 && suggestedMaxHp !== sheet.maxHp && (
            <button
              onClick={() => save({ maxHp: suggestedMaxHp, currentHp: suggestedMaxHp })}
              className="text-xs text-brass hover:text-brass-bright font-mono"
            >
              {t("autoFillHP")} ({suggestedMaxHp})
            </button>
          )}
        </div>

        <div className="rounded border border-white/10 bg-ink900 px-3 py-2">
          <p className="font-mono text-xs uppercase text-parchment/60">{t("hitDiceLabel")}</p>
          <div className="flex items-center gap-1 text-sm">
            <input
              value={sheet.hitDiceTotal}
              onChange={(e) => save({ hitDiceTotal: e.target.value })}
              className="w-16 bg-transparent font-display"
              placeholder="1d8"
            />
            <span className="text-parchment/60">·</span>
            <input
              type="number"
              min={0}
              value={sheet.hitDiceUsed}
              onChange={(e) => save({ hitDiceUsed: Number(e.target.value) })}
              className="w-10 bg-transparent"
            />
            <span className="text-xs text-parchment/60">{t("slotsUsedLabel")}</span>
          </div>
        </div>

        <div className="rounded border border-white/10 bg-ink900 px-3 py-2">
          <p className="font-mono text-xs uppercase text-parchment/60 mb-1">{t("deathSavesLabel")}</p>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-verdant">{t("successesLabel")}</span>
              {[0, 1, 2].map((i) => (
                <input
                  key={i}
                  type="checkbox"
                  checked={sheet.deathSaveSuccesses > i}
                  onChange={() => save({ deathSaveSuccesses: sheet.deathSaveSuccesses > i ? i : i + 1 })}
                />
              ))}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-crimson">{t("failuresLabel")}</span>
              {[0, 1, 2].map((i) => (
                <input
                  key={i}
                  type="checkbox"
                  checked={sheet.deathSaveFailures > i}
                  onChange={() => save({ deathSaveFailures: sheet.deathSaveFailures > i ? i : i + 1 })}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <h3 className="font-display text-sm mb-2">{t("savingThrowsLabel")}</h3>
          <ul className="space-y-1">
            {ABILITY_KEYS.map((key) => {
              const proficient = sheet.savingThrowProfs.includes(key);
              const bonus = abilityModifier(sheet[key]) + (proficient ? sheet.proficiencyBonus : 0);
              return (
                <li key={key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={proficient}
                    onChange={() => toggleInList(sheet.savingThrowProfs, key, "savingThrowProfs")}
                  />
                  <span className="font-mono text-xs w-8">{formatModifier(bonus)}</span>
                  <span>{t(ABILITY_I18N_KEY[key])}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display text-sm">{t("skillsLabel")}</h3>
            <span className="text-xs font-mono text-parchment/60">
              {t("proficientAbbr")} / {t("expertiseAbbr")}
            </span>
          </div>
          <ul className="space-y-1 max-h-96 overflow-y-auto pr-1">
            {SKILLS.map((skill) => {
              const proficient = sheet.skillProficiencies.includes(skill.id);
              const expert = sheet.skillExpertise.includes(skill.id);
              const bonus =
                abilityModifier(sheet[skill.ability]) +
                (proficient ? sheet.proficiencyBonus : 0) +
                (expert ? sheet.proficiencyBonus : 0);
              return (
                <li key={skill.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={proficient}
                    onChange={() => toggleInList(sheet.skillProficiencies, skill.id, "skillProficiencies")}
                  />
                  <input
                    type="checkbox"
                    checked={expert}
                    onChange={() => toggleInList(sheet.skillExpertise, skill.id, "skillExpertise")}
                  />
                  <span className="font-mono text-xs w-8">{formatModifier(bonus)}</span>
                  <span>
                    {t(skill.i18n)} <span className="text-parchment/60">({t(ABILITY_I18N_KEY[skill.ability])})</span>
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="text-xs mt-2 text-parchment/60">
            {t("passivePerceptionLabel")}: <span className="font-mono text-brass">{passivePerception}</span>
          </p>
        </div>
      </div>

      <div>
        <h3 className="font-display text-sm mb-2">{t("attacksSpellsLabel")}</h3>
        <div className="space-y-1">
          {sheet.attacks.map((atk, i) => (
            <div key={i} className="flex gap-2">
              <input
                placeholder={t("attackNamePlaceholder")}
                value={atk.name}
                onChange={(e) => updateAttack(i, { name: e.target.value })}
                className="flex-1 rounded border border-white/10 bg-ink900 px-2 py-1 text-sm"
              />
              <input
                placeholder={t("attackBonusPlaceholder")}
                value={atk.bonus}
                onChange={(e) => updateAttack(i, { bonus: e.target.value })}
                className="w-20 rounded border border-white/10 bg-ink900 px-2 py-1 text-sm"
              />
              <input
                placeholder={t("attackDamagePlaceholder")}
                value={atk.damageType}
                onChange={(e) => updateAttack(i, { damageType: e.target.value })}
                className="w-32 rounded border border-white/10 bg-ink900 px-2 py-1 text-sm"
              />
              <button onClick={() => removeAttack(i)} className="text-crimson text-xs px-1">
                ×
              </button>
            </div>
          ))}
        </div>
        <button onClick={addAttack} className="mt-2 text-xs text-brass hover:text-brass-bright">
          {t("addAttack")}
        </button>
      </div>

      <div>
        <h3 className="font-display text-sm mb-2">{t("equipmentLabel")}</h3>
        <div className="grid grid-cols-5 gap-2 mb-2">
          {(
            [
              ["copperPieces", "currencyCP"],
              ["silverPieces", "currencySP"],
              ["electrumPieces", "currencyEP"],
              ["goldPieces", "currencyGP"],
              ["platinumPieces", "currencyPP"],
            ] as const
          ).map(([field, labelKey]) => (
            <div key={field} className="rounded border border-white/10 bg-ink900 text-center py-1.5">
              <p className="font-mono text-xs uppercase text-parchment/60">{t(labelKey)}</p>
              <input
                type="number"
                min={0}
                value={sheet[field]}
                onChange={(e) => save({ [field]: Number(e.target.value) } as Partial<Character>)}
                className="w-full text-center bg-transparent text-sm"
              />
            </div>
          ))}
        </div>
        <textarea
          defaultValue={sheet.equipmentList}
          onBlur={(e) => save({ equipmentList: e.target.value })}
          rows={3}
          className="w-full rounded border border-white/10 bg-ink900 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <h3 className="font-display text-sm mb-2">{t("languagesProfsLabel")}</h3>
        <textarea
          defaultValue={sheet.languagesProficiencies}
          onBlur={(e) => save({ languagesProficiencies: e.target.value })}
          rows={2}
          className="w-full rounded border border-white/10 bg-ink900 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <h3 className="font-display text-sm mb-2">{t("featuresTraits")}</h3>
        <ul className="space-y-1 text-sm">
          {sheet.features.length === 0 && <li className="text-parchment/60">{t("noneRecorded")}</li>}
          {sheet.features.map((f, i) => (
            <li key={i}>
              <span className="font-medium">{f.name}:</span> {f.description}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-display text-sm mb-2">{t("notes")}</h3>
        <textarea
          defaultValue={sheet.notes ?? ""}
          onBlur={(e) => save({ notes: e.target.value })}
          rows={3}
          className="w-full rounded border border-white/10 bg-ink900 px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  onChange,
  prefix = "",
  suffix = "",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div className="rounded border border-white/10 bg-ink900 text-center py-2">
      <p className="font-mono text-xs uppercase text-parchment/60">{label}</p>
      <p className="font-display text-lg">
        {prefix}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-12 text-center bg-transparent"
        />
        {suffix}
      </p>
    </div>
  );
}
