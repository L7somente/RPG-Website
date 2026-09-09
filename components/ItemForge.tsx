"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type ForgedItemT = {
  id: string;
  name: string;
  itemType: string;
  rarity: string;
  weight: number;
  description?: string;
  properties: { bonus?: string; effect?: string };
};

type CharacterOption = { id: string; name: string; user: { username: string } };

const RARITY_COLOR: Record<string, string> = {
  common: "text-parchment/60",
  uncommon: "text-verdant",
  rare: "text-brass-bright",
  very_rare: "text-crimson-bright",
  legendary: "text-crimson",
  artifact: "text-crimson font-bold",
};

const emptyForm = {
  name: "",
  itemType: "weapon",
  rarity: "common",
  weight: 0,
  description: "",
  bonus: "",
  effect: "",
};

export default function ItemForge() {
  const { t } = useLanguage();
  const [items, setItems] = useState<ForgedItemT[]>([]);
  const [characters, setCharacters] = useState<CharacterOption[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [grantTarget, setGrantTarget] = useState<Record<string, string>>({});
  const [grantMsg, setGrantMsg] = useState<Record<string, string>>({});

  const RARITY_LABEL: Record<string, string> = {
    common: t("rarityCommon"),
    uncommon: t("rarityUncommon"),
    rare: t("rarityRare"),
    very_rare: t("rarityVeryRare"),
    legendary: t("rarityLegendary"),
    artifact: t("rarityArtifact"),
  };

  async function load() {
    const [itemsRes, charsRes] = await Promise.all([fetch("/api/forge"), fetch("/api/dm/characters")]);
    const itemsData = await itemsRes.json();
    const charsData = await charsRes.json();
    setItems(itemsData.items ?? []);
    setCharacters(charsData.characters ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function forgeItem(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    await fetch("/api/forge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm(emptyForm);
    load();
  }

  async function deleteItem(id: string) {
    await fetch(`/api/forge/${id}`, { method: "DELETE" });
    load();
  }

  async function grant(id: string) {
    const characterId = grantTarget[id];
    if (!characterId) return;
    const res = await fetch(`/api/forge/${id}/grant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ characterId, quantity: 1 }),
    });
    setGrantMsg({ ...grantMsg, [id]: res.ok ? t("granted") : t("grantFailed") });
    setTimeout(() => setGrantMsg((m) => ({ ...m, [id]: "" })), 2000);
  }

  return (
    <section className="rounded-lg bg-ink-panel border border-brass/30 p-5">
      <h2 className="font-display text-lg text-brass-bright mb-1">{t("itemForge")}</h2>
      <p className="text-xs text-parchment/60 mb-4">{t("itemForgeHint")}</p>

      {/* Forging form */}
      <form onSubmit={forgeItem} className="rounded bg-ink p-3 space-y-2 mb-5 border border-brass/20">
        <div className="grid sm:grid-cols-2 gap-2">
          <input
            placeholder={t("itemNamePlaceholder")}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded bg-ink-panel px-2 py-1.5 text-sm border border-brass/20"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={form.itemType}
              onChange={(e) => setForm({ ...form, itemType: e.target.value })}
              className="rounded bg-ink-panel px-2 py-1.5 text-sm border border-brass/20"
            >
              <option value="weapon">{t("weapon")}</option>
              <option value="armor">{t("armor")}</option>
              <option value="consumable">{t("consumable")}</option>
              <option value="misc">{t("misc")}</option>
            </select>
            <select
              value={form.rarity}
              onChange={(e) => setForm({ ...form, rarity: e.target.value })}
              className="rounded bg-ink-panel px-2 py-1.5 text-sm border border-brass/20"
            >
              {Object.entries(RARITY_LABEL).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <textarea
          placeholder={t("flavorDescPlaceholder")}
          rows={2}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded bg-ink-panel px-2 py-1.5 text-sm border border-brass/20"
        />

        <div className="grid sm:grid-cols-2 gap-2">
          <input
            placeholder={t("bonusPlaceholder")}
            value={form.bonus}
            onChange={(e) => setForm({ ...form, bonus: e.target.value })}
            className="rounded bg-ink-panel px-2 py-1.5 text-sm border border-brass/20"
          />
          <input
            type="number"
            step="0.1"
            placeholder={t("weightPlaceholder")}
            value={form.weight}
            onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}
            className="rounded bg-ink-panel px-2 py-1.5 text-sm border border-brass/20"
          />
        </div>

        <textarea
          placeholder={t("effectPlaceholder")}
          rows={2}
          value={form.effect}
          onChange={(e) => setForm({ ...form, effect: e.target.value })}
          className="w-full rounded bg-ink-panel px-2 py-1.5 text-sm border border-brass/20"
        />

        <button type="submit" className="rounded bg-brass px-4 py-2 text-sm font-medium text-ink900 hover:bg-brass-bright">
          {t("forgeItemBtn")}
        </button>
      </form>

      {/* Forged catalog */}
      <ul className="space-y-3">
        {items.length === 0 && <li className="text-sm text-parchment/60">{t("nothingForgedYet")}</li>}
        {items.map((item) => (
          <li key={item.id} className="border-l-2 border-brass/40 pl-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">
                  {item.name}{" "}
                  <span className={`text-xs font-mono ${RARITY_COLOR[item.rarity]}`}>
                    {RARITY_LABEL[item.rarity]}
                  </span>
                </p>
                {item.description && <p className="text-sm text-parchment/70">{item.description}</p>}
                {(item.properties?.bonus || item.properties?.effect) && (
                  <p className="text-sm italic text-verdant">
                    {item.properties.bonus && `${item.properties.bonus} · `}
                    {item.properties.effect}
                  </p>
                )}
              </div>
              <button onClick={() => deleteItem(item.id)} className="text-xs text-crimson-bright shrink-0">
                {t("deleteBtn")}
              </button>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <select
                value={grantTarget[item.id] ?? ""}
                onChange={(e) => setGrantTarget({ ...grantTarget, [item.id]: e.target.value })}
                className="rounded bg-ink px-2 py-1 text-xs border border-brass/20"
              >
                <option value="">{t("grantToCharacter")}</option>
                {characters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.user.username})
                  </option>
                ))}
              </select>
              <button onClick={() => grant(item.id)} className="text-xs rounded bg-verdant px-2 py-1 text-ink900">
                {t("grant")}
              </button>
              {grantMsg[item.id] && <span className="text-xs text-brass-bright">{grantMsg[item.id]}</span>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
