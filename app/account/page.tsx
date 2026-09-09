"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import LanguageToggle from "@/components/LanguageToggle";

type Account = { id: string; email: string | null; username: string; role: string };

export default function AccountPage() {
  const { t } = useLanguage();
  const [account, setAccount] = useState<Account | null>(null);
  const [username, setUsername] = useState("");
  const [usernameMsg, setUsernameMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/account")
      .then((r) => r.json())
      .then((d) => {
        setAccount(d.user);
        setUsername(d.user?.username ?? "");
      });
  }, []);

  async function saveUsername(e: React.FormEvent) {
    e.preventDefault();
    setUsernameMsg(null);
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    setUsernameMsg(res.ok ? t("savedSuccessfully") : data.error);
    if (res.ok) setAccount(data.user);
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-brass-bright">{t("accountTitle")}</h1>
        <LanguageToggle />
      </div>

      {account && (
        <p className="text-xs font-mono text-parchment/60">
          {t("role")}: {account.role}
        </p>
      )}

      <form onSubmit={saveUsername} className="rounded-lg bg-ink-panel text-parchment p-5 shadow-lg space-y-3">
        <label className="text-xs font-mono uppercase tracking-wide block">{t("username")}</label>
        <p className="text-xs text-parchment/60">{t("usernameChatNotice")}</p>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded border border-white/10 bg-ink900 px-3 py-2 text-sm"
        />
        {usernameMsg && <p className="text-sm text-verdant">{usernameMsg}</p>}
        <button type="submit" className="rounded bg-brass px-4 py-2 text-sm font-medium text-ink900 hover:bg-brass-bright">
          {t("saveChanges")}
        </button>
      </form>
    </div>
  );
}
