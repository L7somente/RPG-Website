// Core-rules (SRD) class reference data — the 12 base classes, which are
// open game content. This is intentionally a starting set, not "every book":
// most post-PHB subclasses/options are Wizards of the Coast proprietary
// content, so importing them wholesale isn't something this app redistributes.
// DMs can extend this file with more entries (same shape) for content from
// books they own — see README for the pattern.
//
// casterType drives the multiclass spell-slot calculation in spellSlots.ts:
//   "full"  — counts full level toward multiclass caster level (Bard, Cleric, Druid, Sorcerer, Wizard)
//   "half"  — counts half level, rounded down (Paladin, Ranger)
//   "pact"  — Warlock's Pact Magic; separate from the multiclass slot table entirely
//   "none"  — no spellcasting at base level (Barbarian, Fighter, Monk, Rogue).
//             Fighter (Eldritch Knight) and Rogue (Arcane Trickster) gain
//             third-caster progression via subclass — not auto-calculated here,
//             adjust spell slots manually if you pick one of those subclasses.

export type CasterType = "full" | "half" | "pact" | "none";

export type ClassDef = {
  id: string;
  i18nKey: string;
  hitDie: number; // e.g. 8 for d8
  casterType: CasterType;
  spellcastingAbility?: "intelligence" | "wisdom" | "charisma";
};

export const CLASSES: ClassDef[] = [
  { id: "barbarian", i18nKey: "classBarbarian", hitDie: 12, casterType: "none" },
  { id: "bard", i18nKey: "classBard", hitDie: 8, casterType: "full", spellcastingAbility: "charisma" },
  { id: "cleric", i18nKey: "classCleric", hitDie: 8, casterType: "full", spellcastingAbility: "wisdom" },
  { id: "druid", i18nKey: "classDruid", hitDie: 8, casterType: "full", spellcastingAbility: "wisdom" },
  { id: "fighter", i18nKey: "classFighter", hitDie: 10, casterType: "none" },
  { id: "monk", i18nKey: "classMonk", hitDie: 8, casterType: "none" },
  { id: "paladin", i18nKey: "classPaladin", hitDie: 10, casterType: "half", spellcastingAbility: "charisma" },
  { id: "ranger", i18nKey: "classRanger", hitDie: 10, casterType: "half", spellcastingAbility: "wisdom" },
  { id: "rogue", i18nKey: "classRogue", hitDie: 8, casterType: "none" },
  { id: "sorcerer", i18nKey: "classSorcerer", hitDie: 6, casterType: "full", spellcastingAbility: "charisma" },
  { id: "warlock", i18nKey: "classWarlock", hitDie: 8, casterType: "pact", spellcastingAbility: "charisma" },
  { id: "wizard", i18nKey: "classWizard", hitDie: 6, casterType: "full", spellcastingAbility: "intelligence" },
];

export function classById(id: string) {
  return CLASSES.find((c) => c.id === id);
}

// Average HP gained per level for a given hit die (standard "take the
// average" rule: floor(die/2) + 1).
export function averageHpPerLevel(hitDie: number) {
  return Math.floor(hitDie / 2) + 1;
}
