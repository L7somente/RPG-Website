"use client";
import { useEffect, useState } from "react";
export default function OwlbearSession({ sessionId, roomUrl, canManage, ended, signedIn, reload }: {
  sessionId: string; roomUrl?: string | null; canManage: boolean; ended: boolean; signedIn: boolean; reload: () => Promise<void>;
}) {
  const [url, setUrl] = useState(roomUrl || "");
  const [characters, setCharacters] = useState<{ id: string; name: string }[]>([]);
  const [characterId, setCharacterId] = useState("");
  const [pairing, setPairing] = useState(false);
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { setUrl(roomUrl || ""); setToken(""); }, [roomUrl]);
  async function run(action: () => Promise<void>) {
    setBusy(true); setMessage("");
    try { await action(); } catch (e) { setMessage((e as Error).message); } finally { setBusy(false); }
  }
  async function request(path: string, method: string, body: object) {
    const res = await fetch(path, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json(); if (!res.ok) throw new Error(data.error || "Não foi possível concluir."); return data;
  }
  return <section aria-label="Owlbear Rodeo" className="space-y-3 border-t border-brass/20 pt-3">
    <h3 className="font-display text-brass-bright">Owlbear Rodeo</h3>
    {roomUrl && <a href={roomUrl} target="_blank" rel="noreferrer" className="inline-block underline text-brass">Abrir tabletop ↗</a>}
    {canManage && !ended && <form className="flex flex-wrap gap-2" onSubmit={e => { e.preventDefault(); void run(async () => { await request(`/api/sessions/${sessionId}/owlbear`, "PUT", { url }); setToken(""); await reload(); setMessage("Sala atualizada. Códigos anteriores revogados."); }); }}>
      <label className="flex-1">Link da sala<input aria-label="Link da sala Owlbear" type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://www.owlbear.rodeo/room/…" className="block w-full rounded bg-ink p-2 border border-brass/30" /></label>
      <button disabled={busy} className="rounded border border-brass/40 px-3 py-2">Salvar sala</button>
      <p className="w-full text-xs text-parchment/60">Deixe o campo vazio e salve para desvincular.</p>
    </form>}
    {!ended && signedIn && roomUrl && <button disabled={busy} className="block underline text-brass" onClick={() => void run(async () => {
      const res = await fetch("/api/characters"); const data = await res.json(); if (!res.ok) throw new Error(data.error);
      setCharacters(data.characters); setCharacterId(data.characters[0]?.id || ""); setPairing(true);
    })}>Conectar minha ficha ao Owlbear</button>}
    {pairing && !ended && <div className="space-y-3 rounded border border-brass/30 p-3">
      <p className="text-sm">Selecione a ficha confirmada para esta sessão. O acesso é somente de leitura e dura uma hora.</p>
      <label className="block">Sua ficha<select value={characterId} onChange={e => { setCharacterId(e.target.value); setToken(""); }} className="block w-full bg-ink p-2">{characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      {!characters.length && <p>Crie uma ficha no Ledger primeiro.</p>}
      <div className="flex flex-wrap gap-3"><button disabled={busy || !characterId} className="underline" onClick={() => void run(async () => {
        setToken(""); const data = await request("/api/owlbear/access", "POST", { sessionId, characterId }); setToken(data.token);
      })}>Gerar código</button><button disabled={busy} className="underline" onClick={() => void run(async () => { await request("/api/owlbear/access", "DELETE", { sessionId }); setToken(""); setMessage("Acesso revogado."); })}>Revogar acesso</button></div>
      {token && <label className="block text-sm">Copie este código e cole no painel do Owlbear. Não compartilhe.<textarea readOnly value={token} onFocus={e => e.target.select()} className="block w-full bg-ink p-2" /></label>}
      <a href="/owlbear" target="_blank" rel="noreferrer" className="block underline text-brass">Instruções de instalação ↗</a>
    </div>}
    {message && <p role="status" className="text-sm">{message}</p>}
  </section>;
}
