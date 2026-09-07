"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import CharacterSheetMain from "./CharacterSheetMain";
import CharacterSheetPersonality from "./CharacterSheetPersonality";
import CharacterSheetSpells from "./CharacterSheetSpells";

export type Character = {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  classes: { id: string; level: number }[];
  background?: string | null;
  alignment?: string | null;
  playerName: string;

  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;

  inspiration: boolean;
  initiative: number;
  maxHp: number;
  currentHp: number;
  tempHp: number;
  armorClass: number;
  speed: number;
  proficiencyBonus: number;

  hitDiceTotal: string;
  hitDiceUsed: number;
  deathSaveSuccesses: number;
  deathSaveFailures: number;

  skillProficiencies: string[];
  skillExpertise: string[];
  savingThrowProfs: string[];

  attacks: { name: string; bonus: string; damageType: string }[];
  languagesProficiencies: string;

  copperPieces: number;
  silverPieces: number;
  electrumPieces: number;
  goldPieces: number;
  platinumPieces: number;
  equipmentList: string;

  personalityTraits: string;
  ideals: string;
  bonds: string;
  flaws: string;

  age: string;
  height: string;
  weight: string;
  eyes: string;
  skin: string;
  hair: string;

  appearance: string;
  alliesOrganizations: string;
  characterSymbol: string;
  backstory: string;
  additionalFeatures: string;
  treasure: string;

  spellcastingClass: string;
  spellcastingAbility: string;
  spellSaveDC: number;
  spellAttackBonus: number;

  spellSlots: Record<string, { max: number; used: number }>;
  spellsKnown: { name: string; level: number; prepared?: boolean }[];
  features: { name: string; description: string }[];
  notes?: string | null;
};

export type SaveFn = (patch: Partial<Character>) => void;

const TABS = ["main", "personality", "spells"] as const;
const TAB_I18N: Record<(typeof TABS)[number], string> = {
  main: "tabMain",
  personality: "tabPersonality",
  spells: "tabSpells",
};

export default function CharacterSheet({ character }: { character: Character }) {
  const { t } = useLanguage();
  const [sheet, setSheet] = useState(character);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const pending = useRef<Partial<Character>[]>([]);
  const active = useRef(false);
  const [tab, setTab] = useState<(typeof TABS)[number]>("main");

  function save(patch: Partial<Character>) {
    setSheet((previous) => ({ ...previous, ...patch }));
    if (!active.current && pending.current.length) {
      pending.current = [Object.assign({}, ...pending.current, patch)];
    } else pending.current.push(patch);
    void flush();
  }

  async function flush() {
    if (active.current) return;
    active.current = true;
    setSaving(true);
    setSaveError(false);
    try {
      while (pending.current.length) {
        const response = await fetch(`/api/characters/${character.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pending.current[0]),
        });
        if (!response.ok) throw new Error("Save failed");
        pending.current.shift();
      }
    } catch {
      pending.current = [Object.assign({}, ...pending.current)];
      setSaveError(true);
    }
    finally { active.current = false; setSaving(false); }
  }

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (pending.current.length) { event.preventDefault(); event.returnValue = ""; }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  return (
    <div className="rounded-lg bg-parchment text-parchmentText p-6 shadow-lg space-y-5">
      {saveError && <div role="alert" className="text-crimson">
        Não foi possível salvar. Suas alterações ainda estão pendentes. Não saia desta página.
        <button className="ml-2 underline" onClick={() => void flush()}>Tentar novamente</button>
      </div>}
      <header className="ledger-rule pb-3 flex justify-between items-start">
        <div>
          <h1 className="font-display text-2xl">{sheet.name}</h1>
          <p className="text-sm text-parchmentText/70">
            {t("levelLabel")} {sheet.level} {sheet.race} {sheet.class} · {sheet.alignment ?? "—"}
          </p>
          <p className="text-xs text-parchmentText/50 mt-0.5">
            {t("backgroundLabel")}: {sheet.background ?? "—"} · {t("playerNameLabel")}: {sheet.playerName || "—"}
          </p>
        </div>
        {saving && <span className="text-xs font-mono text-brass shrink-0">{t("saving")}</span>}
      </header>

      <div className="flex gap-1 border-b border-parchment-line overflow-x-auto">
        {TABS.map((tb) => (
          <button
            key={tb}
            onClick={() => setTab(tb)}
            className={`px-3 py-2 text-sm font-medium whitespace-nowrap ${
              tab === tb ? "border-b-2 border-brass text-brass" : "text-parchmentText/50 hover:text-parchmentText"
            }`}
          >
            {t(TAB_I18N[tb])}
          </button>
        ))}
      </div>

      {tab === "main" && <CharacterSheetMain sheet={sheet} save={save} />}
      {tab === "personality" && <CharacterSheetPersonality sheet={sheet} save={save} />}
      {tab === "spells" && <CharacterSheetSpells sheet={sheet} save={save} />}
    </div>
  );
}
