import { z } from "zod";

const text = z.string().max(20000);
const integer = z.number().int().min(0).max(1000000);
const bonus = z.number().int().min(-100).max(100);
const ability = z.number().int().min(1).max(30);
const strings = z.array(z.string().max(100)).max(200);

// Explicit scalar fields only: never accept Prisma relation operations from clients.
export const characterPatchSchema = z.object({
  name: z.string().trim().min(1).max(60), race: text, class: text,
  level: z.number().int().min(1).max(20),
  classes: z.array(z.object({ id: z.string().max(60), level: z.number().int().min(1).max(20) }).strict()).max(20)
    .refine((classes) => classes.reduce((sum, c) => sum + c.level, 0) <= 20),
  background: text.nullable(), alignment: text.nullable(), playerName: text,
  strength: ability, dexterity: ability, constitution: ability,
  intelligence: ability, wisdom: ability, charisma: ability,
  inspiration: z.boolean(), initiative: bonus, maxHp: integer, currentHp: integer,
  tempHp: integer, armorClass: integer, speed: z.number().finite().min(0).max(1000000), proficiencyBonus: bonus,
  hitDiceTotal: text, hitDiceUsed: integer,
  deathSaveSuccesses: z.number().int().min(0).max(3), deathSaveFailures: z.number().int().min(0).max(3),
  skillProficiencies: strings, skillExpertise: strings, savingThrowProfs: strings,
  attacks: z.array(z.object({ name: text, bonus: text, damageType: text }).strict()).max(200),
  languagesProficiencies: text, copperPieces: integer, silverPieces: integer,
  electrumPieces: integer, goldPieces: integer, platinumPieces: integer, equipmentList: text,
  personalityTraits: text, ideals: text, bonds: text, flaws: text,
  age: text, height: text, weight: text, eyes: text, skin: text, hair: text,
  appearance: text, alliesOrganizations: text, characterSymbol: text, backstory: text,
  additionalFeatures: text, treasure: text, spellcastingClass: text, spellcastingAbility: text,
  spellSaveDC: integer, spellAttackBonus: bonus,
  spellSlots: z.record(z.string().regex(/^[1-9]$/), z.object({ max: integer, used: integer }).strict()),
  spellsKnown: z.array(z.object({ name: text, level: z.number().int().min(0).max(9), prepared: z.boolean().optional() }).strict()).max(500),
  features: z.array(z.object({ name: text, description: text }).strict()).max(200),
  notes: text.nullable(),
}).partial().strict();

export const itemSchema = z.object({
  name: z.string().trim().min(1).max(200),
  itemType: z.enum(["weapon", "armor", "consumable", "misc"]).default("misc"),
  quantity: integer.min(1).default(1), weight: z.number().finite().min(0).max(1000000).default(0),
  equipped: z.boolean().default(false), description: text.nullable().optional(),
  properties: z.record(z.union([text, z.number().finite(), z.boolean(), z.null()])).default({}),
}).strict();
export const itemPatchSchema = itemSchema.partial();
export const xpAmount = z.number().int().min(0).max(100000000);
export const questPatchSchema = z.object({
  status: z.enum(["available", "active", "completed"]).optional(),
  summary: text.optional(), xpReward: xpAmount.optional(),
}).strict();
