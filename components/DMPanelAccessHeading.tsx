"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function DMPanelAccessHeading() {
  const { t } = useLanguage();
  return <h2 className="font-display text-xl text-brass-bright">{t("dmPanelAccess")}</h2>;
}
