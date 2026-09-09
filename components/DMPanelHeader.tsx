"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function DMPanelHeader({ showAdmin }: { showAdmin: boolean }) {
  const { t } = useLanguage();
  return (
    <header className="flex flex-wrap gap-4 items-center justify-between">
      <div>
        <h1 className="font-display text-3xl text-brass-bright">{t("dmPanel")}</h1>
        <p className="text-parchment/60 text-sm">{t("dmPanelSubtitle")}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {showAdmin && (
          <Link href="/admin" className="rounded bg-crimson px-4 py-2 text-sm font-medium text-parchment hover:bg-crimson-bright">
            {t("adminPanel")}
          </Link>
        )}
        <Link href="/" className="rounded bg-ink-panel border border-brass/30 px-4 py-2 text-sm hover:border-brass">
          {t("dashboardLink")}
        </Link>
      </div>
    </header>
  );
}
