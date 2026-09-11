"use client";
import { useEffect, useState } from "react";
import { displayDistance } from "@/lib/distance";
type Sheet = { character: { name: string; race: string; class: string; level: number; currentHp: number; maxHp: number; tempHp: number; armorClass: number; speed: number; initiative: number; attacks: unknown; updatedAt: string }; sessionTitle: string; expiresAt: string };
export default function OwlbearPanel() {
  const [room, setRoom] = useState("");
  const [origin, setOrigin] = useState("");
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [checked, setChecked] = useState("");
  useEffect(() => {
    let active = true;
    setOrigin(window.location.origin);
    if (window.self !== window.top) {
      import("@owlbear-rodeo/sdk").then(({ default: OBR }) => {
        OBR.onReady(() => { if (active) setRoom(OBR.room.id); });
      }).catch(() => { if (active) setError("Não foi possível conectar ao Owlbear. Reabra a extensão."); });
    }
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!room || !token) return;
    let active = true; let running = false;
    const controller = new AbortController();
    async function refresh() {
      if (running) return; running = true; setBusy(true);
      try {
        const res = await fetch("/api/owlbear/sheet", { headers: { Authorization: `Bearer ${token}`, "X-Owlbear-Room": room }, credentials: "omit", cache: "no-store", signal: controller.signal });
        const data = await res.json();
        if (!active) return;
        if (!res.ok) { setSheet(null); if (res.status === 401) setToken(""); throw new Error(data.error || "Falha ao carregar a ficha."); }
        setSheet(data); setError(""); setChecked(new Date().toLocaleTimeString("pt-BR"));
      } catch (e) { if (active) { setSheet(null); setError((e as Error).message); } }
      finally { running = false; if (active) setBusy(false); }
    }
    void refresh(); const timer = setInterval(() => void refresh(), 15000);
    return () => { active = false; controller.abort(); clearInterval(timer); };
  }, [room, token]);
  const c = sheet?.character;
  return <div className="mx-auto max-w-md space-y-5">
    <header><p className="text-xs uppercase tracking-widest text-brass">The Ledger · Owlbear Rodeo</p><h1 className="font-display text-2xl text-brass-bright">Sua ficha na mesa</h1><p className="text-sm text-parchment/60">Consulta de ficha · atualização a cada 15 segundos</p></header>
    {!room && <section className="space-y-3 rounded border border-brass/30 p-4"><h2 className="font-display text-xl">Instalar a extensão</h2><ol className="list-decimal pl-5 space-y-2"><li>No perfil do Owlbear, escolha “Add Extension”.</li><li>Cole o endereço abaixo e ative a extensão na sua sala.</li><li>No Ledger, abra Sessões, conecte sua ficha e gere um código.</li><li>Abra o painel do Ledger dentro do Owlbear e cole o código.</li></ol><input aria-label="Endereço de instalação" readOnly value={origin ? `${origin}/owlbear/manifest.json` : ""} onFocus={e => e.target.select()} className="w-full bg-ink p-2 border border-brass/30 rounded text-sm" /><p className="text-sm">Para jogar em outros computadores, o Ledger precisa estar disponível em um endereço HTTPS acessível ao grupo.</p><a href="/sessions" target="_blank" rel="noreferrer" className="underline text-brass">Abrir sessões do Ledger ↗</a></section>}
    {room && !token && <form className="space-y-3" onSubmit={e => { e.preventDefault(); setSheet(null); setError(""); setToken(code.trim()); setCode(""); }}><label className="block">Código de acesso<input type="password" autoComplete="off" value={code} onChange={e => setCode(e.target.value)} required pattern="[A-Za-z0-9_-]{43}" className="block w-full rounded bg-ink-panel p-3 border border-brass/30" /></label><button className="rounded bg-brass text-ink px-4 py-2">Conectar ficha</button><a href="/sessions" target="_blank" rel="noreferrer" className="block underline text-brass">Gerar código no Ledger ↗</a></form>}
    {error && <p role="alert" className="rounded border border-crimson p-3">{error}</p>}
    {busy && <p role="status">Atualizando ficha…</p>}
    {c && sheet && <section className="space-y-4"><div><p className="text-sm text-brass">{sheet.sessionTitle}</p><h2 className="font-display text-2xl">{c.name}</h2><p>{c.race} · {c.class} · Nível {c.level}</p></div><dl className="grid grid-cols-2 gap-3">{[["Pontos de vida", `${c.currentHp} / ${c.maxHp}`], ["PV temporários", c.tempHp], ["Classe de armadura", c.armorClass], ["Deslocamento", `${displayDistance(c.speed, "m")} m`], ["Iniciativa", `${c.initiative >= 0 ? "+" : ""}${c.initiative}`]].map(([label, value]) => <div key={label} className="rounded border border-brass/30 bg-ink-panel p-3"><dt className="text-sm text-parchment/60">{label}</dt><dd className="text-xl text-brass-bright">{value}</dd></div>)}</dl><h3 className="font-display text-xl">Ataques</h3>{Array.isArray(c.attacks) && c.attacks.length ? c.attacks.map((a: any, i: number) => <div key={i} className="border-b border-brass/20 pb-2"><strong>{String(a?.name || "Ataque")}</strong><p className="text-sm">{String(a?.bonus ?? "")} · {String(a?.damageType ?? "")}</p></div>) : <p className="text-parchment/60">Nenhum ataque cadastrado.</p>}<p className="text-xs text-parchment/60">Consultado às {checked}. Acesso até {new Date(sheet.expiresAt).toLocaleTimeString("pt-BR")}.</p></section>}
    {token && <button className="underline text-brass" onClick={() => { setToken(""); setSheet(null); setCode(""); setError(""); setBusy(false); }}>Desconectar deste painel</button>}
    <p className="text-xs text-parchment/60">Edite a ficha no Ledger. Para invalidar o código, use “Revogar acesso” na sessão. O código fica apenas na memória deste painel.</p>
  </div>;
}
