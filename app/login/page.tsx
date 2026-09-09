"use client";

import { signIn } from "next-auth/react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import LanguageToggle from "@/components/LanguageToggle";

export default function LoginPage() {
  const { t } = useLanguage();

  return (
    <div className="login-card">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-2xl">{t("enterTheTavern")}</h1>
        <LanguageToggle />
      </div>

      <p className="text-sm mb-5 text-parchment/80">{t("discordOnlyNotice")}</p>

      <button
        onClick={() => signIn("discord", { callbackUrl: "/" })}
        className="w-full flex items-center justify-center gap-2 rounded bg-[#5865F2] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#4752C4] transition"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.317 4.369A19.79 19.79 0 0 0 15.885 3c-.211.375-.457.879-.626 1.278a18.27 18.27 0 0 0-5.518 0A12.76 12.76 0 0 0 9.115 3 19.736 19.736 0 0 0 4.68 4.369C1.578 8.98.792 13.48 1.185 17.919a19.9 19.9 0 0 0 6.021 3.006c.484-.66.917-1.362 1.288-2.099a12.9 12.9 0 0 1-2.028-.968c.17-.123.336-.252.497-.384a14.19 14.19 0 0 0 12.074 0c.163.132.328.261.497.384-.646.383-1.323.71-2.03.969.372.737.804 1.44 1.29 2.098a19.83 19.83 0 0 0 6.022-3.005c.463-5.146-.788-9.607-3.499-13.55ZM8.68 15.207c-1.161 0-2.115-1.065-2.115-2.373 0-1.309.933-2.374 2.115-2.374s2.135 1.065 2.115 2.374c0 1.308-.933 2.373-2.115 2.373Zm6.64 0c-1.16 0-2.114-1.065-2.114-2.373 0-1.309.933-2.374 2.114-2.374 1.182 0 2.136 1.065 2.115 2.374 0 1.308-.933 2.373-2.115 2.373Z" />
        </svg>
        {t("signInWithDiscord")}
      </button>
    </div>
  );
}
