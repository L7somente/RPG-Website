import { ClassDef } from "./classes";

// The standard spell-slot-per-character-level table (levels 1-20, slot levels 1-9).
// Full casters use their class level directly against this table. Multiclass
// characters sum an "effective caster level" (see multiclassCasterLevel below)
// and look that up against this same table — that's the official SRD rule.
const SLOT_TABLE: number[][] = [
  [2, 0, 0, 0, 0, 0, 0, 0, 0], // 1
  [3, 0, 0, 0, 0, 0, 0, 0, 0], // 2
  [4, 2, 0, 0, 0, 0, 0, 0, 0], // 3
  [4, 3, 0, 0, 0, 0, 0, 0, 0], // 4
  [4, 3, 2, 0, 0, 0, 0, 0, 0], // 5
  [4, 3, 3, 0, 0, 0, 0, 0, 0], // 6
  [4, 3, 3, 1, 0, 0, 0, 0, 0], // 7
  [4, 3, 3, 2, 0, 0, 0, 0, 0], // 8
  [4, 3, 3, 3, 1, 0, 0, 0, 0], // 9
  [4, 3, 3, 3, 2, 0, 0, 0, 0], // 10
  [4, 3, 3, 3, 2, 1, 0, 0, 0], // 11
  [4, 3, 3, 3, 2, 1, 0, 0, 0], // 12
  [4, 3, 3, 3, 2, 1, 1, 0, 0], // 13
  [4, 3, 3, 3, 2, 1, 1, 0, 0], // 14
  [4, 3, 3, 3, 2, 1, 1, 1, 0], // 15
  [4, 3, 3, 3, 2, 1, 1, 1, 0], // 16
  [4, 3, 3, 3, 2, 1, 1, 1, 1], // 17
  [4, 3, 3, 3, 3, 1, 1, 1, 1], // 18
  [4, 3, 3, 3, 3, 2, 1, 1, 1], // 19
  [4, 3, 3, 3, 3, 2, 2, 1, 1], // 20
];

export type CharacterClassEntry = { id: string; level: number };

// Standard multiclass spellcaster rule: full casters contribute their whole
// level, half casters (Paladin/Ranger) contribute floor(level/2), Warlock's
// Pact Magic is excluded entirely (it's tracked separately).
export function multiclassCasterLevel(entries: CharacterClassEntry[], classDefs: ClassDef[]): number {
  let total = 0;
  for (const entry of entries) {
    const def = classDefs.find((c) => c.id === entry.id);
    if (!def) continue;
    if (def.casterType === "full") total += entry.level;
    else if (def.casterType === "half") total += Math.floor(entry.level / 2);
    // "pact" and "none" contribute 0 to this table.
  }
  return total;
}

// Returns { "1": max, "2": max, ... } for the given effective caster level (1-20).
export function spellSlotsForCasterLevel(casterLevel: number): Record<string, { max: number; used: number }> {
  if (casterLevel <= 0) return {};
  const row = SLOT_TABLE[Math.min(casterLevel, 20) - 1];
  const result: Record<string, { max: number; used: number }> = {};
  row.forEach((max, i) => {
    if (max > 0) result[String(i + 1)] = { max, used: 0 };
  });
  return result;
}
