"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
type XPState = { currentXP: number; xpToNextLevel: number; currentLevel: number };
export default function XPBar() {
  const [xp, setXp] = useState<XPState | null>(null);
  const { t } = useLanguage();
  useEffect(() => {
    let mounted = true;
    const accept = (value: XPState) => {
      if (mounted && value && Number.isFinite(value.currentXP) && value.xpToNextLevel > 0 && value.currentLevel > 0) setXp(value);
    };
    const load = () => fetch("/api/xp").then(r => { if (!r.ok) throw new Error(); return r.json(); }).then(d => accept(d.xp)).catch(() => {});
    void load();
    const timer = setInterval(load, 30000);
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000");
    socket.on("xp-update", accept);
    return () => { mounted = false; clearInterval(timer); socket.disconnect(); };
  }, []);
  const pct = xp ? Math.max(0, Math.min(100, xp.currentXP / xp.xpToNextLevel * 100)) : 0;
  return <div className="world-bar">
    <div className="world-bar-inner">
      <div className="world-level"><Sparkles size={14} aria-hidden="true" /><span>{t("worldLevel")}</span><strong>{xp?.currentLevel ?? "—"}</strong></div>
      <div className="xp-track" role="progressbar" aria-label={t("worldLevel")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={xp ? Math.round(pct) : undefined} aria-valuetext={xp ? `${xp.currentXP} de ${xp.xpToNextLevel} XP` : "Carregando experiência"}>
        <div className="xp-liquid" style={{ width: `${pct}%` }}>
          <svg className="xp-wave xp-wave-back" viewBox="0 0 400 16" preserveAspectRatio="none" aria-hidden="true"><path d="M0 7 Q25 0 50 7 T100 7 T150 7 T200 7 T250 7 T300 7 T350 7 T400 7 V16 H0Z" /></svg>
          <svg className="xp-wave xp-wave-front" viewBox="0 0 400 16" preserveAspectRatio="none" aria-hidden="true"><path d="M0 7 Q25 0 50 7 T100 7 T150 7 T200 7 T250 7 T300 7 T350 7 T400 7 V16 H0Z" /></svg>
          <span className="xp-shimmer" />
        </div>
      </div>
      <span className="xp-value">{xp ? `${xp.currentXP.toLocaleString()} / ${xp.xpToNextLevel.toLocaleString()} XP` : "XP indisponível"}</span>
    </div>
  </div>;
}
