"use client";
import { useEffect, useId, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { displayDistance, distanceInFeet, type DistanceUnit } from "@/lib/distance";
const PREFERENCE = "ledger-distance-unit";
export default function SpeedField({ feet, onChange }: { feet: number; onChange?: (feet: number) => void }) {
  const { t, lang } = useLanguage();
  const id = useId();
  const [unit, setUnit] = useState<DistanceUnit>("ft");
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => { try { if (localStorage.getItem(PREFERENCE) === "m") setUnit("m"); } catch {} }, []);
  useEffect(() => { setDraft(null); setError(false); }, [feet]);
  const value = displayDistance(feet, unit);
  function commit() {
    if (draft === null || !onChange) return;
    const n = Number(draft.replace(",", "."));
    const canonical = distanceInFeet(n, unit);
    if (!draft.trim() || !Number.isFinite(canonical) || canonical < 0 || canonical > 1000000) { setError(true); return; }
    // Focusing and leaving a rounded display must not change the stored distance.
    if (n !== value) onChange(canonical);
    setDraft(null); setError(false);
  }
  function changeUnit(next: DistanceUnit) {
    // Commit runs on input blur before this change event. Invalid input stays visible.
    if (error) return;
    setUnit(next); setDraft(null);
    try { localStorage.setItem(PREFERENCE, next); } catch {}
  }
  const other: DistanceUnit = unit === "ft" ? "m" : "ft";
  return <div className="speed-field rounded border border-white/10 bg-ink900 text-center py-2 px-2">
    <label htmlFor={id} className="font-mono text-xs uppercase text-parchment/60">{t("speed")}</label>
    <div className="flex justify-center items-center gap-1 mt-1">
      {onChange ? <input id={id} inputMode="decimal" type="text" value={draft ?? value} onChange={e => { setDraft(e.target.value); setError(false); }} onBlur={commit} onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur(); if (e.key === "Escape") { setDraft(null); setError(false); } }} aria-invalid={error} aria-describedby={id + "-hint"} className="w-20 min-w-0 text-center bg-transparent font-display text-lg" /> : <span id={id} className="font-display text-lg">{value.toLocaleString(lang, {maximumFractionDigits:4})}</span>}
      <select value={unit} onChange={e => changeUnit(e.target.value as DistanceUnit)} aria-label={lang === "pt" ? "Unidade de deslocamento" : "Speed unit"} className="rounded border border-white/10 bg-ink-panel px-1 text-sm"><option value="ft">ft</option><option value="m">m</option></select>
    </div>
    <p id={id + "-hint"} className={error ? "text-xs text-crimson-bright" : "text-xs text-parchment/60"}>{error ? (lang === "pt" ? "Informe uma distância válida." : "Enter a valid distance.") : `≈ ${displayDistance(feet, other).toLocaleString(lang, {maximumFractionDigits:4})} ${other}`}</p>
  </div>;
}
