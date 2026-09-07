// Shared across CharacterSheet, DMCharacterView, and anywhere else that
// needs the fixed D&D 5e ability/skill structure. Skill order matches the
// official character sheet exactly.

export const ABILITY_KEYS = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"] as const;
export type AbilityKey = (typeof ABILITY_KEYS)[number];

export const ABILITY_I18N_KEY: Record<AbilityKey, string> = {
  strength: "abilityStrength",
  dexterity: "abilityDexterity",
  constitution: "abilityConstitution",
  intelligence: "abilityIntelligence",
  wisdom: "abilityWisdom",
  charisma: "abilityCharisma",
};

export type Skill = { id: string; ability: AbilityKey; i18n: string };

// Stored on a character as stable English slugs (skillProficiencies /
// skillExpertise) so switching the site language never touches saved data —
// only the displayed label changes.
export const SKILLS: Skill[] = [
  { id: "acrobatics", ability: "dexterity", i18n: "skillAcrobatics" },
  { id: "arcana", ability: "intelligence", i18n: "skillArcana" },
  { id: "athletics", ability: "strength", i18n: "skillAthletics" },
  { id: "performance", ability: "charisma", i18n: "skillPerformance" },
  { id: "deception", ability: "charisma", i18n: "skillDeception" },
  { id: "stealth", ability: "dexterity", i18n: "skillStealth" },
  { id: "history", ability: "intelligence", i18n: "skillHistory" },
  { id: "intimidation", ability: "charisma", i18n: "skillIntimidation" },
  { id: "insight", ability: "wisdom", i18n: "skillInsight" },
  { id: "investigation", ability: "intelligence", i18n: "skillInvestigation" },
  { id: "animalHandling", ability: "wisdom", i18n: "skillAnimalHandling" },
  { id: "medicine", ability: "wisdom", i18n: "skillMedicine" },
  { id: "nature", ability: "intelligence", i18n: "skillNature" },
  { id: "perception", ability: "wisdom", i18n: "skillPerception" },
  { id: "persuasion", ability: "charisma", i18n: "skillPersuasion" },
  { id: "sleightOfHand", ability: "dexterity", i18n: "skillSleightOfHand" },
  { id: "religion", ability: "intelligence", i18n: "skillReligion" },
  { id: "survival", ability: "wisdom", i18n: "skillSurvival" },
];

export function abilityModifier(score: number) {
  return Math.floor((score - 10) / 2);
}

export function formatModifier(m: number) {
  return m >= 0 ? `+${m}` : `${m}`;
}
