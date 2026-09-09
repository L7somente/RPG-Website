"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type Item = {
  id: string;
  name: string;
  itemType: string;
  quantity: number;
  weight: number;
  equipped: boolean;
  description?: string | null;
};

export default function InventorySheet({
  characterId,
  initialItems,
  dmMode = false,
}: {
  characterId: string;
  initialItems: Item[];
  // When a DM/admin is viewing a player's sheet from /dm/characters/[id]:
  // they can still add items (to hand out loot), but can't toggle equip
  // state or remove items — that stays under the player's own control.
  dmMode?: boolean;
}) {
  const { t } = useLanguage();
  const [items, setItems] = useState(initialItems);
  const [newItem, setNewItem] = useState({ name: "", itemType: "misc", quantity: 1 });

  const totalWeight = items.reduce((sum, i) => sum + i.weight * i.quantity, 0);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItem.name.trim()) return;
    const res = await fetch(`/api/characters/${characterId}/inventory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });
    const data = await res.json();
    setItems([...items, data.item]);
    setNewItem({ name: "", itemType: "misc", quantity: 1 });
  }

  async function toggleEquipped(item: Item) {
    const res = await fetch(`/api/characters/${characterId}/inventory/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ equipped: !item.equipped }),
    });
    const data = await res.json();
    setItems(items.map((i) => (i.id === item.id ? data.item : i)));
  }

  async function removeItem(id: string) {
    await fetch(`/api/characters/${characterId}/inventory/${id}`, { method: "DELETE" });
    setItems(items.filter((i) => i.id !== id));
  }

  return (
    <div className="rounded-lg bg-ink-panel text-parchment p-6 shadow-lg">
      <div className="ledger-rule pb-2 mb-3 flex justify-between items-center">
        <h2 className="font-display text-xl">
          {t("inventory")}
          {dmMode && <span className="text-sm font-body text-parchment/60"> {t("dmViewTag")}</span>}
        </h2>
        <span className="font-mono text-xs text-parchment/60">
          {totalWeight.toFixed(1)} lb {t("weightTotal")}
        </span>
      </div>

      <table className="w-full text-sm mb-4">
        <thead>
          <tr className="text-left font-mono text-xs uppercase text-parchment/60 ledger-rule">
            <th className="py-1">{t("colItem")}</th>
            <th>{t("colType")}</th>
            <th>{t("colQty")}</th>
            <th>{t("colWeight")}</th>
            <th>{t("colEquipped")}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="ledger-rule">
              <td className="py-1">{item.name}</td>
              <td className="capitalize text-parchment/70">{item.itemType}</td>
              <td>{item.quantity}</td>
              <td>{item.weight}</td>
              <td>
                {dmMode ? (
                  <span className="text-xs text-parchment/60">{item.equipped ? t("yes") : t("no")}</span>
                ) : (
                  <input type="checkbox" checked={item.equipped} onChange={() => toggleEquipped(item)} />
                )}
              </td>
              <td>
                {!dmMode && (
                  <button onClick={() => removeItem(item.id)} className="text-crimson text-xs">
                    {t("remove")}
                  </button>
                )}
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={6} className="py-2 text-parchment/60">
                {t("noItemsYet")}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <form onSubmit={addItem} className="flex flex-wrap gap-2">
        <input
          placeholder={t("itemNamePlaceholder")}
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          className="flex-1 min-w-[140px] rounded border border-white/10 bg-ink900 px-2 py-1 text-sm"
        />
        <select
          value={newItem.itemType}
          onChange={(e) => setNewItem({ ...newItem, itemType: e.target.value })}
          className="rounded border border-white/10 bg-ink900 px-2 py-1 text-sm"
        >
          <option value="weapon">{t("weapon")}</option>
          <option value="armor">{t("armor")}</option>
          <option value="consumable">{t("consumable")}</option>
          <option value="misc">{t("misc")}</option>
        </select>
        <input
          type="number"
          min={1}
          value={newItem.quantity}
          onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
          className="w-16 rounded border border-white/10 bg-ink900 px-2 py-1 text-sm"
        />
        <button type="submit" className="rounded bg-brass px-3 py-1 text-sm font-medium text-ink900 hover:bg-brass-bright">
          {t("add")}
        </button>
      </form>
    </div>
  );
}
