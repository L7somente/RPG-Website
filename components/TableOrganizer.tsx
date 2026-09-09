"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type Player = { id: string; username: string };
type Participant = { id: string; userId: string; user: Player };
type TableSession = {
  id: string;
  title: string;
  scheduledAt: string;
  description?: string;
  discordEventId?: string | null;
  createdBy: string;
  participants: Participant[];
};

export default function TableOrganizer() {
  const { t } = useLanguage();
  const { data: auth } = useSession();
  const [error, setError] = useState("");
  const [tables, setTables] = useState<TableSession[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [form, setForm] = useState({ title: "", scheduledAt: "", description: "" });
  const [assignPlayer, setAssignPlayer] = useState<Record<string, string>>({});

  async function load() {
    const [tRes, pRes] = await Promise.all([fetch("/api/sessions"), fetch("/api/users/players")]);
    const tData = await tRes.json();
    const pData = await pRes.json();
    setTables((tData.sessions ?? []).filter((s: any) => !s.endedAt));
    setPlayers(pData.players ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function createTable(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.scheduledAt) return;
    const response = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, scheduledAt: new Date(form.scheduledAt).toISOString() }),
    });
    const data = await response.json();
    if (!response.ok) { setError(typeof data.error === "string" ? data.error : "Verifique o título e escolha um horário futuro."); return; }
    setError(data.session?.discordSyncError ?? "");
    setForm({ title: "", scheduledAt: "", description: "" });
    load();
  }

  async function endTable(tableId: string) {
    const response = await fetch(`/api/sessions/${tableId}`, { method: "DELETE" });
    const data = await response.json();
    setError(response.ok ? data.session?.discordSyncError ?? "" : data.error);
    load();
  }

  async function assign(tableId: string) {
    const userId = assignPlayer[tableId];
    if (!userId) return;
    await fetch(`/api/sessions/${tableId}/participants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    load();
  }

  async function unassign(tableId: string, participantId: string) {
    await fetch(`/api/sessions/${tableId}/participants/${participantId}`, { method: "DELETE" });
    load();
  }

  return (
    <section className="rounded-lg bg-ink-panel border border-brass/30 p-5">
      <h2 className="font-display text-lg text-brass-bright mb-3">{t("tableOrganization")}</h2>

      {error && <p role="alert" className="text-crimson-bright mb-3">{error}</p>}
      <a href="/sessions" className="inline-block underline text-brass mb-4">Sessões em andamento e histórico</a>
      <form onSubmit={createTable} className="flex flex-wrap gap-2 mb-4">
        <input
          placeholder={t("tableTitlePlaceholder")}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="flex-1 min-w-[160px] rounded bg-ink px-2 py-1 text-sm border border-brass/20"
        />
        <input
          type="datetime-local"
          value={form.scheduledAt}
          onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
          className="rounded bg-ink px-2 py-1 text-sm border border-brass/20"
        />
        <button type="submit" className="rounded bg-brass px-3 py-1 text-sm font-medium text-ink900 hover:bg-brass-bright">
          {t("createTable")}
        </button>
      </form>

      <ul className="space-y-4">
        {tables.filter(tb => (auth?.user as any)?.role === "ADMIN" || tb.createdBy === (auth?.user as any)?.id).map((tb) => (
          <li key={tb.id} className="border-l-2 border-brass/40 pl-3">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium">{tb.title}</p>
              <button onClick={() => endTable(tb.id)} className="text-xs text-crimson-bright">
                {t("endTable")}
              </button>
            </div>
            <p className="text-xs font-mono text-parchment/60">{new Date(tb.scheduledAt).toLocaleString()}</p>
            {tb.discordEventId && (
              <a
                href={`https://discord.com/events/${process.env.NEXT_PUBLIC_DISCORD_GUILD_ID}/${tb.discordEventId}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-verdant-bright underline"
              >
                {t("viewOnDiscord")}
              </a>
            )}

            <ul className="mt-1 flex flex-wrap gap-2">
              {tb.participants.map((p) => (
                <li key={p.id} className="text-xs rounded-full bg-ink px-2 py-1 flex items-center gap-1">
                  {p.user.username}
                  <button onClick={() => unassign(tb.id, p.id)} className="text-crimson-bright">
                    ×
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-2 flex gap-2">
              <select
                value={assignPlayer[tb.id] ?? ""}
                onChange={(e) => setAssignPlayer({ ...assignPlayer, [tb.id]: e.target.value })}
                className="rounded bg-ink px-2 py-1 text-xs border border-brass/20"
              >
                <option value="">{t("addPlayerPlaceholder")}</option>
                {players.map((pl) => (
                  <option key={pl.id} value={pl.id}>
                    {pl.username}
                  </option>
                ))}
              </select>
              <button onClick={() => assign(tb.id)} className="text-xs rounded bg-brass px-2 py-1 text-ink900">
                {t("addToTable")}
              </button>
            </div>
          </li>
        ))}
        {tables.length === 0 && <li className="text-sm text-parchment/60">{t("noTablesScheduled")}</li>}
      </ul>
    </section>
  );
}
