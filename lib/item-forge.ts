import { z } from "zod";

export const ITEM_TYPES = ["weapon", "armor", "consumable", "misc"] as const;
export const RARITIES = ["common", "uncommon", "rare", "very_rare", "legendary", "artifact"] as const;
export const forgedItemSchema = z.object({
  name: z.string().trim().min(1).max(120),
  itemType: z.enum(ITEM_TYPES).default("misc"),
  rarity: z.enum(RARITIES).default("common"),
  weight: z.number().finite().min(0).max(10000).default(0),
  description: z.string().trim().max(4000).default(""),
  bonus: z.string().trim().max(500).default(""),
  effect: z.string().trim().max(4000).default(""),
}).strict();
export const grantItemSchema = z.object({
  characterId: z.string().trim().min(1),
  quantity: z.number().int().min(1).max(999).default(1),
}).strict();
export type ForgeDraft = z.infer<typeof forgedItemSchema>;

// Original homebrew suggestions, editable by the DM before saving.
const bases = {
  weapon: [["Espada longa", "Longsword", 3], ["Arco longo", "Longbow", 2], ["Adaga", "Dagger", 1]],
  armor: [["Cota de malha", "Chain mail", 55], ["Escudo", "Shield", 6], ["Armadura de couro", "Leather armor", 10]],
  consumable: [["Poção", "Potion", 0.5], ["Elixir", "Elixir", 0.5], ["Unguento", "Salve", 0.2]],
  misc: [["Amuleto", "Amulet", 0.1], ["Anel", "Ring", 0], ["Lanterna", "Lantern", 2]],
} as const;
const themes = [
  { pt: "da Aurora", en: "of Dawn", ptEffect: "emite luz suave em um raio de 3 metros por 1 hora", enEffect: "sheds dim light in a 10-foot radius for 1 hour" },
  { pt: "das Brumas", en: "of Mists", ptEffect: "cria uma névoa decorativa ao redor do portador por 1 minuto", enEffect: "creates decorative mist around the bearer for 1 minute" },
  { pt: "do Eco", en: "of Echoes", ptEffect: "reproduz uma frase de até dez palavras dita pelo portador", enEffect: "repeats a phrase of up to ten words spoken by the bearer" },
  { pt: "das Estrelas", en: "of Stars", ptEffect: "projeta um pequeno mapa das constelações por 10 minutos", enEffect: "projects a small constellation map for 10 minutes" },
];

export function generateItem(itemType: ForgeDraft["itemType"], rarity: ForgeDraft["rarity"], lang: "pt" | "en" = "pt"): ForgeDraft {
  const pool = bases[itemType];
  const base = pool[Math.floor(Math.random() * pool.length)];
  const theme = themes[Math.floor(Math.random() * themes.length)];
  const rank = RARITIES.indexOf(rarity);
  const pt = lang === "pt";
  const bonus = Math.min(3, Math.ceil(rank / 2));
  const mechanicalBonus = rank > 0 && (itemType === "weapon" || itemType === "armor");
  return {
    name: `${base[pt ? 0 : 1]} ${pt ? theme.pt : theme.en}`,
    itemType, rarity, weight: base[2],
    description: pt
      ? "Criação artesanal marcada por pequenas runas. Sugestão caseira: revise os efeitos e o equilíbrio antes de usar na campanha."
      : "A handcrafted piece etched with small runes. Homebrew suggestion: review its effects and balance before using it in your campaign.",
    bonus: mechanicalBonus ? (itemType === "weapon" ? (pt ? `+${bonus} nas jogadas de ataque e dano` : `+${bonus} to attack and damage rolls`) : (pt ? `+${bonus} na CA enquanto equipado` : `+${bonus} AC while equipped`)) : "",
    effect: itemType === "consumable"
      ? (pt ? `Ao consumir, recupera ${Math.max(1, rank + 1)}d4 + ${rank + 1} PV. Uso único.` : `When consumed, restores ${Math.max(1, rank + 1)}d4 + ${rank + 1} HP. Single use.`)
      : (pt ? `Com uma ação, ${theme.ptEffect}. ${Math.max(1, rank)} uso(s), recuperados ao amanhecer.` : `As an action, ${theme.enEffect}. ${Math.max(1, rank)} use(s), regained at dawn.`),
  };
}
