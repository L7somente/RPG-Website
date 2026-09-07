"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type XPState = {
  currentXP: number;
  xpToNextLevel: number;
  currentLevel: number;
};

export default function XPBar() {
  const [xp, setXp] = useState<XPState | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    fetch("/api/xp")
      .then((r) => r.json())
      .then((d) => setXp(d.xp))
      .catch(() => {});

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000");
    socket.on("xp-update", (updated: XPState) => setXp(updated));
    return () => {
      socket.disconnect();
    };
  }, []);

  const pct = xp ? Math.min(100, Math.round((xp.currentXP / xp.xpToNextLevel) * 100)) : 0;

  return (
    <div className="sticky top-0 z-50 w-full bg-ink-panel border-b border-brass/40">
      <div className="mx-auto max-w-5xl px-4 py-2">
        <div className="flex justify-between font-mono text-[11px] text-parchment/70 mb-1">
          <span>{t("worldLevel")}</span>
          <span>{xp ? `${xp.currentXP} / ${xp.xpToNextLevel} XP` : "…"}</span>
        </div>

        {/* Hexagonal (d20-style, point up) level badge, centered inside the bar. */}
        <div className="relative h-7 w-full overflow-hidden rounded-full bg-ink900">
          <div
            className="h-full rounded-full bg-verdant transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="30" height="34" viewBox="0 0 30 34">
              <polygon
                points="15,0 29,8.5 29,25.5 15,34 1,25.5 1,8.5"
                fill="#0D0F14"
                stroke="#B08D57"
                strokeWidth="2"
              />
              <text
                x="15"
                y="21"
                textAnchor="middle"
                fontSize="12"
                fontFamily="Cinzel, serif"
                fontWeight="700"
                fill="#D1AE79"
              >
                {xp ? xp.currentLevel : "—"}
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
