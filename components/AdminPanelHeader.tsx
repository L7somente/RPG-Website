"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function AdminPanelHeader() {
  const { t } = useLanguage();
  return (
    <header className="flex flex-wrap gap-4 items-center justify-between">
      <div>
        <h1 className="font-display text-3xl text-brass-bright">{t("masterAdmin")}</h1>
        <p className="text-parchment/60 text-sm">{t("masterAdminSubtitle")}</p>
      </div>
      <Link href="/" className="rounded bg-ink-panel border border-brass/30 px-4 py-2 text-sm hover:border-brass">
        {t("dashboardLink")}
      </Link>
    </header>
  );
}
