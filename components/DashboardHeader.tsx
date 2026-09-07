"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function DashboardHeader({ showAdmin, showDM }: { showAdmin: boolean; showDM: boolean }) {
  const { t } = useLanguage();

  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="font-display text-3xl text-brass-bright">The Ledger</h1>
        <p className="text-parchment/60 text-sm">{t("campaignDashboard")}</p>
      </div>
      <div className="flex gap-2">
        {showAdmin && (
          <Link href="/admin" className="rounded bg-crimson px-4 py-2 text-sm font-medium text-parchment hover:bg-crimson-bright">
            {t("adminPanel")}
          </Link>
        )}
        {showDM && (
          <Link href="/dm" className="rounded bg-ink-panel border border-brass/40 px-4 py-2 text-sm text-brass-bright hover:border-brass">
            {t("dmPanel")}
          </Link>
        )}
        <Link href="/characters" className="rounded bg-brass px-4 py-2 text-sm font-medium text-ink900 hover:bg-brass-bright">
          {t("myCharacters")}
        </Link>
      </div>
    </header>
  );
}
