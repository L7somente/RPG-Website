"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import OwlbearSession from "@/components/OwlbearSession";
type Session = { id: string; title: string; description?: string; scheduledAt: string; endedAt: string | null; status: "active" | "scheduled" | "completed"; createdBy: string; discordSyncError?: string; discordSyncedAt?: string; discordEventId?: string; participants: { id: string; user: { username: string } }[] };
export default function SessionHub() {
  const { data: auth } = useSession();
  const user = auth?.user as { id?: string; role?: string } | undefined;
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tab, setTab] = useState("active");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  async function load() {
    try { const res = await fetch("/api/sessions"); if (!res.ok) throw new Error("Não foi possível carregar as sessões."); const data = await res.json(); setSessions(data.sessions); setError(""); }
    catch (e) { setError((e as Error).message); } finally { setLoading(false); }
  }
  useEffect(() => { void load(); const timer = setInterval(() => void load(), 30000); return () => clearInterval(timer); }, []);
  async function act(id: string, action: string) {
    setBusy(id); setError("");
    try {
      const response = await fetch(`/api/sessions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error);
      await load(); if (action === "end") setTab("completed");
    } catch (e) { setError((e as Error).message); } finally { setBusy(null); }
  }
  return <div className="space-y-6">
    <header className="flex flex-wrap items-center justify-between gap-3"><h1 className="font-display text-3xl text-brass-bright">Sessões da campanha</h1>{(user?.role === "DM" || user?.role === "ADMIN") && <Link href="/dm" className="text-brass underline">Agendar sessão</Link>}</header>
    <div className="session-tabs" role="tablist" aria-label="Status das sessões">{[["active", "Em andamento"], ["scheduled", "Agendadas"], ["completed", "Encerradas"]].map(([key, label]) => <button key={key} role="tab" id={"tab-" + key} aria-controls="sessions-panel" aria-selected={tab === key} onClick={() => setTab(key)} className={`rounded px-4 py-2 ${tab === key ? "bg-brass text-ink900" : "bg-ink-panel text-parchment"}`}>{label} ({sessions.filter(s => s.status === key).length})</button>)}</div>
    {error && <p role="alert" className="text-crimson-bright">{error} <button onClick={() => void load()} className="underline">Tentar novamente</button></p>}
    {loading ? <p role="status">Carregando sessões…</p> : <div className="space-y-4" id="sessions-panel" aria-labelledby={"tab-" + tab} role="tabpanel">
      {!sessions.some(s => s.status === tab) && <p className="rounded border border-brass/20 p-8 text-parchment/70">{tab === "active" ? "Nenhuma sessão em andamento. As mesas aparecerão aqui no horário agendado." : tab === "scheduled" ? "Nenhuma sessão agendada." : "As sessões encerradas pelo DM aparecerão aqui."}</p>}
      {sessions.filter(s => s.status === tab).map(s => {
        const canManage = user?.role === "ADMIN" || (user?.role === "DM" && user.id === s.createdBy);
        return <article key={s.id} className="rounded-lg border border-brass/30 bg-ink-panel p-5 space-y-3">
          <h2 className="font-display text-xl text-brass-bright">{s.title}</h2><p>{s.description}</p>
          <p className="text-sm text-parchment/70">{new Date(s.scheduledAt).toLocaleString("pt-BR")}{s.endedAt && ` · Encerrada em ${new Date(s.endedAt).toLocaleString("pt-BR")}`}</p>
          <p className="text-sm">{s.participants.map(p => p.user.username).join(", ") || "Sem participantes confirmados"}</p>
          {s.discordEventId && process.env.NEXT_PUBLIC_DISCORD_GUILD_ID && <a className="inline-block underline text-brass" href={`https://discord.com/events/${process.env.NEXT_PUBLIC_DISCORD_GUILD_ID}/${s.discordEventId}`} target="_blank" rel="noreferrer">Ver evento no Discord</a>}
          <OwlbearSession sessionId={s.id} roomUrl={(s as Session & { owlbearRoomUrl?: string }).owlbearRoomUrl} canManage={canManage} ended={!!s.endedAt} signedIn={!!user?.id} reload={load} />
          {canManage && <div className="space-y-3"><p className="text-sm text-parchment/70">{s.discordSyncError || (!s.discordSyncedAt ? "Sincronização com Discord pendente." : "Sincronizado com Discord.")}</p><div className="flex flex-wrap gap-3">
            {!s.endedAt && <button disabled={busy !== null} onClick={() => void act(s.id, "end")} className="rounded bg-crimson px-4 py-2 disabled:opacity-50">{busy === s.id ? "Aguarde…" : "Encerrar sessão"}</button>}
            <button disabled={busy !== null} onClick={() => void act(s.id, "sync")} className="rounded border border-brass/40 px-4 py-2 disabled:opacity-50">Sincronizar Discord</button>
          </div></div>}
        </article>;
      })}
    </div>}
  </div>;
}
