"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function BackToDMPanelLink() {
  const { t } = useLanguage();
  return (
    <Link href="/dm" className="text-sm text-brass hover:text-brass-bright">
      {t("backToDMPanel")}
    </Link>
  );
}
