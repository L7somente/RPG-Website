"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type Participant = { id: string; userId: string; characterId?: string | null; user: { id: string; username: string } };
type GameSession = {
  id: string;
  title: string;
  scheduledAt: string;
  description?: string;
  participants: Participant[];
};
type MyCharacter = { id: string; name: string };

export default function SessionSchedule() {
  const { data: authSession } = useSession();
  const { t } = useLanguage();
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [myCharacters, setMyCharacters] = useState<MyCharacter[]>([]);
  const [picker, setPicker] = useState<Record<string, string>>({});

  async function load() {
    const requests = [fetch("/api/sessions")];
    if (authSession) requests.push(fetch("/api/characters"));
    const [sRes, cRes] = await Promise.all(requests);
    const sData = await sRes.json();
    setSessions((sData.sessions ?? []).filter((s: any) => s.status === "scheduled"));
    if (cRes) {
      const cData = await cRes.json();
      setMyCharacters(cData.characters ?? []);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authSession]);

  const myId = (authSession?.user as any)?.id;

  async function join(sessionId: string) {
    const characterId = picker[sessionId];
    if (!characterId) return;
    await fetch(`/api/sessions/${sessionId}/participants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ characterId }),
    });
    load();
  }

  async function leave(sessionId: string, participantId: string) {
    await fetch(`/api/sessions/${sessionId}/participants/${participantId}`, { method: "DELETE" });
    load();
  }

  function characterName(id?: string | null) {
    return myCharacters.find((c) => c.id === id)?.name ?? "";
  }

  return (
    <section className="rounded-lg bg-ink-panel border border-brass/30 p-5">
      <h2 className="font-display text-lg tracking-wide mb-3 text-brass-bright">{t("upcomingSessions")}</h2>
      <ul className="space-y-4">
        {sessions.length === 0 && <li className="text-sm text-parchment/60">{t("nothingScheduled")}</li>}
        {sessions.map((s) => {
          const date = new Date(s.scheduledAt);
          const mine = s.participants.find((p) => p.userId === myId);
          return (
            <li key={s.id}>
              <div className="flex items-center gap-3">
                <div className="wax-seal flex flex-col items-center justify-center rounded bg-ink900 px-2 py-1 font-mono text-xs text-brass-bright min-w-[52px]">
                  <span>{date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                  <span>{date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</span>
                </div>
                <div>
                  <p className="font-medium">{s.title}</p>
                  {s.description && <p className="text-sm text-parchment/70">{s.description}</p>}
                  {s.participants.length > 0 && (
                    <p className="text-xs text-parchment/60">
                      {t("confirmed")}: {s.participants.map((p) => p.user.username).join(", ")}
                    </p>
                  )}
                </div>
              </div>

              {authSession && (
                <div className="mt-2 ml-[64px]">
                  {mine ? (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-verdant">
                        {t("joinedWith")}: {characterName(mine.characterId)}
                      </span>
                      <button onClick={() => leave(s.id, mine.id)} className="text-crimson-bright hover:underline">
                        {t("leave")}
                      </button>
                    </div>
                  ) : myCharacters.length === 0 ? (
                    <p className="text-xs text-parchment/60">{t("createCharacterToJoin")}</p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <select
                        value={picker[s.id] ?? ""}
                        onChange={(e) => setPicker({ ...picker, [s.id]: e.target.value })}
                        className="rounded bg-ink px-2 py-1 text-xs border border-brass/20"
                      >
                        <option value="">{t("chooseCharacter")}</option>
                        {myCharacters.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <button onClick={() => join(s.id)} className="text-xs rounded bg-brass px-2 py-1 text-ink900 font-medium">
                        {t("join")}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
