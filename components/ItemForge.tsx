"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { ForgeDraft, forgedItemSchema, generateItem } from "@/lib/item-forge";

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

const emptyForm: ForgeDraft = {
  name: "",
  itemType: "weapon",
  rarity: "common",
  weight: 0,
  description: "",
  bonus: "",
  effect: "",
};

export default function ItemForge() {
  const { t, lang } = useLanguage();
  const label = (pt: string, en: string) => lang === "pt" ? pt : en;
  const [items, setItems] = useState<ForgedItemT[]>([]);
  const [characters, setCharacters] = useState<CharacterOption[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [grantTarget, setGrantTarget] = useState<Record<string, string>>({});
  const [grantMsg, setGrantMsg] = useState<Record<string, string>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [charsError, setCharsError] = useState(false);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");

  async function request(url: string, init?: RequestInit) {
    const res = await fetch(url, { ...init, signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(String(res.status));
    return res.json();
  }

  async function perform(action: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(""); setMessage("");
    try { await action(); }
    catch (cause) {
      setError(cause instanceof Error && cause.message === "403"
        ? label("Entre como mestre ou administrador para usar a forja.", "Sign in as a DM or administrator to use the forge.")
        : label("Não foi possível concluir. Seus campos foram mantidos. Se a conexão caiu, atualize o catálogo ou confira o inventário antes de repetir.", "Could not complete the action. Your fields were preserved. If disconnected, refresh the catalog or check the inventory before retrying."));
    } finally { lock.current = false; setBusy(false); }
  }

  const RARITY_LABEL: Record<string, string> = {
    common: t("rarityCommon"),
    uncommon: t("rarityUncommon"),
    rare: t("rarityRare"),
    very_rare: t("rarityVeryRare"),
    legendary: t("rarityLegendary"),
    artifact: t("rarityArtifact"),
  };

  async function load() {
    setLoading(true);
    const results = await Promise.allSettled([request("/api/forge"), request("/api/dm/characters")]);
    if (results[0].status === "fulfilled") setItems(results[0].value.items ?? []);
    if (results[1].status === "fulfilled") setCharacters(results[1].value.characters ?? []);
    setLoadError(results[0].status === "rejected");
    setCharsError(results[1].status === "rejected");
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function forgeItem(e: React.FormEvent) {
    e.preventDefault();
    const parsed = forgedItemSchema.safeParse(form);
    if (!parsed.success) { setError(label("Confira o nome, peso e tamanho dos textos.", "Check the name, weight and text lengths.")); return; }
    await perform(async () => {
    const data = await request("/api/forge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    setItems(current => [data.item, ...current]);
    setForm({ ...emptyForm, itemType: form.itemType, rarity: form.rarity });
    setMessage(label("Item salvo no catálogo.", "Item saved to the catalog."));
    });
  }

  async function deleteItem(id: string) {
    if (!window.confirm(label("Excluir do catálogo? Cópias já entregues permanecem nos inventários.", "Delete from catalog? Granted copies remain in inventories."))) return;
    await perform(async () => {
      await request(`/api/forge/${id}`, { method: "DELETE" });
      setItems(current => current.filter(item => item.id !== id));
      setMessage(label("Item excluído.", "Item deleted."));
    });
  }

  async function grant(id: string) {
    const characterId = grantTarget[id];
    const quantity = quantities[id] ?? 1;
    if (!characterId || !Number.isInteger(quantity) || quantity < 1 || quantity > 999) return;
    await perform(async () => {
    await request(`/api/forge/${id}/grant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ characterId, quantity }),
    });
    setGrantMsg(current => ({ ...current, [id]: `${quantity} × ${t("granted")} — ${characters.find(c => c.id === characterId)?.name}` }));
    });
  }

  return (
    <section className="rounded-lg bg-ink-panel border border-brass/30 p-5">
      <h2 className="font-display text-lg text-brass-bright mb-1">{t("itemForge")}</h2>
      <p className="text-sm text-parchment/70 mb-4">{label("Escolha o tipo e a raridade, gere uma sugestão e ajuste antes de salvar.", "Choose a type and rarity, generate a suggestion, then adjust before saving.")}</p>

      {/* Forging form */}
      <form onSubmit={forgeItem} className="rounded bg-ink p-3 space-y-2 mb-5 border border-brass/20">
        <fieldset disabled={busy} className="space-y-3 disabled:opacity-60">
        <div className="grid sm:grid-cols-2 gap-2">
          <input
            aria-label={label("Nome do item", "Item name")}
            required maxLength={120}
            placeholder={t("itemNamePlaceholder")}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded bg-ink-panel px-2 py-1.5 text-sm border border-brass/20"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              aria-label={label("Tipo", "Type")}
              value={form.itemType}
              onChange={(e) => setForm({ ...form, itemType: e.target.value as ForgeDraft["itemType"] })}
              className="rounded bg-ink-panel px-2 py-1.5 text-sm border border-brass/20"
            >
              <option value="weapon">{t("weapon")}</option>
              <option value="armor">{t("armor")}</option>
              <option value="consumable">{t("consumable")}</option>
              <option value="misc">{t("misc")}</option>
            </select>
            <select
              aria-label={label("Raridade", "Rarity")}
              value={form.rarity}
              onChange={(e) => setForm({ ...form, rarity: e.target.value as ForgeDraft["rarity"] })}
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

        <button type="button" className="rounded border border-brass/40 px-4 py-2 text-sm text-brass-bright hover:bg-brass/10" onClick={() => { setForm(generateItem(form.itemType, form.rarity, lang)); setError(""); setMessage(label("Sugestão gerada. Revise e salve para adicionar ao catálogo.", "Suggestion generated. Review and save to add it to the catalog.")); }}>{label("Gerar sugestão", "Generate suggestion")}</button>
        <textarea
          aria-label={label("Descrição", "Description")} maxLength={4000}
          placeholder={t("flavorDescPlaceholder")}
          rows={2}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded bg-ink-panel px-2 py-1.5 text-sm border border-brass/20"
        />

        <div className="grid sm:grid-cols-2 gap-2">
          <input
            aria-label={label("Bônus", "Bonus")} maxLength={500}
            placeholder={t("bonusPlaceholder")}
            value={form.bonus}
            onChange={(e) => setForm({ ...form, bonus: e.target.value })}
            className="rounded bg-ink-panel px-2 py-1.5 text-sm border border-brass/20"
          />
          <label className="text-sm">{label("Peso (lb)", "Weight (lb)")}<input
            required min={0} max={10000}
            type="number"
            step="0.1"
            placeholder={t("weightPlaceholder")}
            value={Number.isNaN(form.weight) ? "" : form.weight}
            onChange={(e) => setForm({ ...form, weight: e.target.valueAsNumber })}
            className="rounded bg-ink-panel px-2 py-1.5 text-sm border border-brass/20"
          /></label>
        </div>

        <textarea
          aria-label={label("Efeito e regras de uso", "Effect and usage rules")} maxLength={4000}
          placeholder={t("effectPlaceholder")}
          rows={2}
          value={form.effect}
          onChange={(e) => setForm({ ...form, effect: e.target.value })}
          className="w-full rounded bg-ink-panel px-2 py-1.5 text-sm border border-brass/20"
        />

        <p className="text-sm text-parchment/60">{label("Sugestões caseiras para revisão do mestre. Bônus e efeitos ficam no inventário; não alteram automaticamente os atributos da ficha.", "Homebrew suggestions for DM review. Bonuses and effects are stored in inventory; they do not automatically change character stats.")}</p>
        <button type="submit" className="rounded bg-brass px-4 py-2 text-sm font-medium text-ink900 hover:bg-brass-bright disabled:opacity-50">
          {busy ? label("Aguarde…", "Please wait…") : label("Salvar item", "Save item")}
        </button>
        </fieldset>
      </form>
      {error && <p role="alert" className="text-sm text-crimson-bright mb-3">{error}</p>}
      <p role="status" className="text-sm text-brass-bright mb-3">{message}</p>
      <div className="flex flex-wrap gap-2 mb-3"><input type="search" aria-label={label("Buscar item", "Search items")} placeholder={label("Buscar item…", "Search items…")} value={query} onChange={e => setQuery(e.target.value)} className="min-w-0 flex-1 rounded bg-ink p-2 text-sm border border-brass/20" /><button disabled={loading || busy} onClick={() => void load()} className="text-sm text-brass-bright disabled:opacity-50">{label("Atualizar", "Refresh")}</button></div>
      {loading && <p role="status" className="text-sm">{label("Carregando…", "Loading…")}</p>}
      {loadError && <p role="alert" className="text-sm text-crimson-bright">{label("Não foi possível carregar o catálogo. Tente atualizar.", "Could not load the catalog. Try refreshing.")}</p>}
      {charsError && <p role="alert" className="text-sm text-crimson-bright">{label("Não foi possível carregar personagens. Atualize para habilitar entregas.", "Could not load characters. Refresh to enable granting.")}</p>}
      {!loading && !charsError && characters.length === 0 && <p className="text-sm text-parchment/60">{label("Crie um personagem para receber os itens.", "Create a character to receive items.")}</p>}

      {/* Forged catalog */}
      <ul className="space-y-3">
        {!loading && !loadError && items.length === 0 && <li className="text-sm text-parchment/60">{t("nothingForgedYet")}</li>}
        {items.length > 0 && !items.some(item => item.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())) && <li className="text-sm">{label("Nenhum item encontrado.", "No matching items.")}</li>}
        {items.filter(item => item.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())).map((item) => (
          <li key={item.id} className="border-l-2 border-brass/40 pl-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 break-words">
                <p className="font-medium">
                  {item.name}{" "}
                  <span className={`text-xs font-mono ${RARITY_COLOR[item.rarity]}`}>
                    {RARITY_LABEL[item.rarity]}
                  </span>
                </p>
                <p className="text-sm text-parchment/60">{t(item.itemType)} · {item.weight} lb</p>
                {item.description && <p className="text-sm text-parchment/70">{item.description}</p>}
                {(item.properties?.bonus || item.properties?.effect) && (
                  <p className="text-sm italic text-verdant">
                    {item.properties.bonus && `${item.properties.bonus} · `}
                    {item.properties.effect}
                  </p>
                )}
              </div>
              <button disabled={busy} onClick={() => deleteItem(item.id)} className="text-sm text-crimson-bright shrink-0 disabled:opacity-50">
                {t("deleteBtn")}
              </button>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <select
                aria-label={label("Personagem destinatário", "Recipient character")}
                disabled={busy || charsError}
                value={grantTarget[item.id] ?? ""}
                onChange={(e) => setGrantTarget({ ...grantTarget, [item.id]: e.target.value })}
                className="max-w-full rounded bg-ink px-2 py-2 text-sm border border-brass/20"
              >
                <option value="">{t("grantToCharacter")}</option>
                {characters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.user.username})
                  </option>
                ))}
              </select>
              <label className="text-sm">{label("Qtd.", "Qty.")} <input disabled={busy} type="number" min={1} max={999} step={1} value={Number.isNaN(quantities[item.id]) ? "" : quantities[item.id] ?? 1} onChange={e => setQuantities(current => ({ ...current, [item.id]: e.target.valueAsNumber }))} className="w-20 rounded bg-ink px-2 py-2 text-sm border border-brass/20" /></label>
              <button disabled={busy || charsError || !grantTarget[item.id] || !Number.isInteger(quantities[item.id] ?? 1) || (quantities[item.id] ?? 1) < 1 || (quantities[item.id] ?? 1) > 999} onClick={() => grant(item.id)} className="text-sm rounded bg-verdant px-3 py-2 text-ink900 disabled:opacity-50 disabled:cursor-not-allowed">
                {t("grant")}
              </button>
              {grantMsg[item.id] && <span role="status" className="text-sm text-brass-bright">{grantMsg[item.id]}</span>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
