"use client";

import { Character } from "./CharacterSheet";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { ABILITY_KEYS, ABILITY_I18N_KEY, SKILLS, abilityModifier, formatModifier } from "@/lib/dnd-data";
import { classById } from "@/lib/dnd-data/classes";

// DMs and admins have read-only access to a player's sheet — no inputs, just
// the numbers, so a DM can check a character mid-session without risk of
// accidentally editing it. Item handouts go through <InventorySheet dmMode />.
export default function DMCharacterView({
  character,
  ownerUsername,
}: {
  character: Character;
  ownerUsername: string;
}) {
  const { t } = useLanguage();
  const c = character;

  const perception = SKILLS.find((s) => s.id === "perception")!;
  const passivePerception =
    10 +
    abilityModifier(c[perception.ability]) +
    (c.skillProficiencies.includes("perception") ? c.proficiencyBonus : 0) +
    (c.skillExpertise.includes("perception") ? c.proficiencyBonus : 0);

  const proficientSkills = SKILLS.filter((s) => c.skillProficiencies.includes(s.id) || c.skillExpertise.includes(s.id));

  return (
    <div className="rounded-lg bg-ink-panel text-parchment p-6 shadow-lg space-y-5">
      <header className="ledger-rule pb-3">
        <h1 className="font-display text-2xl">{c.name}</h1>
        <p className="text-sm text-parchment/70">
          {t("levelLabel")} {c.level} {c.race} {c.class} · {c.alignment ?? "—"}
        </p>
        <p className="text-xs font-mono text-parchment/60 mt-1">{t("playerLabel")}: {ownerUsername}</p>
        {Array.isArray(c.classes) && c.classes.length > 0 && (
          <p className="text-xs text-parchment/60 mt-0.5">
            {c.classes.map((entry, i) => (
              <span key={i}>
                {i > 0 && " / "}
                {t(classById(entry.id)?.i18nKey ?? "")} {entry.level}
              </span>
            ))}
          </p>
        )}
      </header>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {ABILITY_KEYS.map((key) => (
          <div key={key} className="rounded border border-white/10 bg-ink900 text-center py-2">
            <p className="font-mono text-xs uppercase text-parchment/60">{t(ABILITY_I18N_KEY[key])}</p>
            <p className="font-display text-xl">{c[key]}</p>
            <p className="font-mono text-xs text-brass">{formatModifier(abilityModifier(c[key]))}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <ReadStat label={t("armorClassLabel")} value={c.armorClass} />
        <div className="rounded border border-white/10 bg-ink900 px-3 py-2">
          <p className="font-mono text-xs uppercase text-parchment/60">{t("hitPoints")}</p>
          <p className="font-display text-lg">
            <span className="text-crimson">{c.currentHp}</span> / {c.maxHp}
            {c.tempHp > 0 && <span className="text-xs text-verdant ml-1">+{c.tempHp} {t("temp")}</span>}
          </p>
        </div>
        <ReadStat label={t("speed")} value={c.speed} suffix=" ft" />
        <ReadStat label={t("initiativeLabel")} value={c.initiative} />
        <ReadStat label={t("profBonus")} value={c.proficiencyBonus} prefix="+" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
        <p>
          <span className="text-parchment/60">{t("inspirationLabel")}:</span> {c.inspiration ? "★" : "—"}
        </p>
        <p>
          <span className="text-parchment/60">{t("hitDiceLabel")}:</span> {c.hitDiceTotal} ({c.hitDiceUsed} {t("slotsUsedLabel").toLowerCase()})
        </p>
        <p>
          <span className="text-parchment/60">{t("passivePerceptionLabel")}:</span> {passivePerception}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <h3 className="font-display text-sm mb-1">{t("savingThrowsLabel")}</h3>
          <p className="text-sm">
            {ABILITY_KEYS.filter((k) => c.savingThrowProfs.includes(k))
              .map((k) => t(ABILITY_I18N_KEY[k]))
              .join(", ") || "—"}
          </p>
        </div>
        <div>
          <h3 className="font-display text-sm mb-1">{t("skillsLabel")}</h3>
          <p className="text-sm">
            {proficientSkills.length === 0
              ? "—"
              : proficientSkills
                  .map((s) => `${t(s.i18n)}${c.skillExpertise.includes(s.id) ? ` (${t("expertiseAbbr")})` : ""}`)
                  .join(", ")}
          </p>
        </div>
      </div>

      {(c.personalityTraits || c.ideals || c.bonds || c.flaws) && (
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          {c.personalityTraits && (
            <p>
              <span className="font-display text-sm block mb-0.5">{t("personalityTraitsLabel")}</span>
              {c.personalityTraits}
            </p>
          )}
          {c.ideals && (
            <p>
              <span className="font-display text-sm block mb-0.5">{t("idealsLabel")}</span>
              {c.ideals}
            </p>
          )}
          {c.bonds && (
            <p>
              <span className="font-display text-sm block mb-0.5">{t("bondsLabel")}</span>
              {c.bonds}
            </p>
          )}
          {c.flaws && (
            <p>
              <span className="font-display text-sm block mb-0.5">{t("flawsLabel")}</span>
              {c.flaws}
            </p>
          )}
        </div>
      )}

      {c.backstory && (
        <div>
          <h3 className="font-display text-sm mb-1">{t("backstoryLabel")}</h3>
          <p className="text-sm whitespace-pre-wrap">{c.backstory}</p>
        </div>
      )}

      {c.spellcastingClass && (
        <div className="text-sm">
          <h3 className="font-display text-sm mb-1">{t("tabSpells")}</h3>
          <p>
            {c.spellcastingClass} · {t("spellSaveDCLabel")} {c.spellSaveDC} · {t("spellAttackBonusLabel")} {formatModifier(c.spellAttackBonus)}
          </p>
        </div>
      )}

      {c.notes && (
        <div>
          <h3 className="font-display text-sm mb-1">{t("notes")}</h3>
          <p className="text-sm whitespace-pre-wrap">{c.notes}</p>
        </div>
      )}
    </div>
  );
}

function ReadStat({ label, value, prefix = "", suffix = "" }: { label: string; value: number; prefix?: string; suffix?: string }) {
  return (
    <div className="rounded border border-white/10 bg-ink900 text-center py-2">
      <p className="font-mono text-xs uppercase text-parchment/60">{label}</p>
      <p className="font-display text-lg">
        {prefix}
        {value}
        {suffix}
      </p>
    </div>
  );
}
