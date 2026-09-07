// Core-rules (SRD) race reference data. Ability score increases and base
// speed are game mechanics/facts (not copyrightable expression), used here
// only to auto-fill a new character's stat block — no flavor text included.
// Extend with more entries for content from books you own (same shape).

export type RaceDef = {
  id: string;
  i18nKey: string;
  speed: number;
  abilityIncreases: Partial<
    Record<"strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma", number>
  >;
};

export const RACES: RaceDef[] = [
  { id: "human", i18nKey: "raceHuman", speed: 30, abilityIncreases: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 } },
  { id: "dwarf", i18nKey: "raceDwarf", speed: 25, abilityIncreases: { constitution: 2 } },
  { id: "elf", i18nKey: "raceElf", speed: 30, abilityIncreases: { dexterity: 2 } },
  { id: "halfling", i18nKey: "raceHalfling", speed: 25, abilityIncreases: { dexterity: 2 } },
  { id: "dragonborn", i18nKey: "raceDragonborn", speed: 30, abilityIncreases: { strength: 2, charisma: 1 } },
  { id: "gnome", i18nKey: "raceGnome", speed: 25, abilityIncreases: { intelligence: 2 } },
  { id: "halfElf", i18nKey: "raceHalfElf", speed: 30, abilityIncreases: { charisma: 2 } },
  { id: "halfOrc", i18nKey: "raceHalfOrc", speed: 30, abilityIncreases: { strength: 2, constitution: 1 } },
  { id: "tiefling", i18nKey: "raceTiefling", speed: 30, abilityIncreases: { intelligence: 1, charisma: 2 } },
];

export function raceById(id: string) {
  return RACES.find((r) => r.id === id);
}
