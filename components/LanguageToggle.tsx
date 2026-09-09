"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useLanguage();

  return (
    <button
      onClick={() => setLang(lang === "pt" ? "en" : "pt")}
      title={t("language")}
      className={
        compact
          ? "flex flex-col items-center gap-0.5 text-parchment/70 hover:text-brass-bright"
          : "flex items-center gap-2 text-sm text-parchment/70 hover:text-brass-bright"
      }
    >
      <Languages size={compact ? 20 : 16} />
      <span className={compact ? "text-xs font-mono" : "font-mono"}>{lang === "pt" ? "PT" : "EN"}</span>
    </button>
  );
}
