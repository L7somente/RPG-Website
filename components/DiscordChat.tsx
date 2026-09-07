"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type ChatMsg = {
  id: string;
  displayName: string;
  source: "site" | "discord";
  content: string;
  createdAt: string;
};

export default function DiscordChat() {
  const { data: authSession, status } = useSession();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authSession?.user) { setMessages([]); return; }
    fetch("/api/chat")
      .then((r) => r.json())
      .then((d) => setMessages(d.messages ?? [])).catch(() => {});

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000", {
      auth: async (callback) => {
        try {
          const response = await fetch("/api/realtime/token");
          const data = await response.json();
          callback({ token: response.ok ? data.token : "invalid" });
        } catch { callback({ token: "invalid" }); }
      },
    });
    socket.on("disconnect", (reason) => { if (reason === "io server disconnect") socket.connect(); });
    socket.on("chat-message", (msg: ChatMsg) => setMessages((prev) => [...prev, msg]));
    return () => {
      socket.disconnect();
    };
  }, [status]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!draft.trim() || !authSession) return;
    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: draft }),
    });
    setDraft("");
  }

  return (
    <section className="rounded-lg bg-ink-panel border border-brass/30 flex flex-col h-96">
      <div className="px-4 py-3 border-b border-brass/30 flex items-center justify-between">
        <h2 className="font-display text-lg tracking-wide text-brass-bright">{t("partyChat")}</h2>
        <span className="text-xs font-mono text-parchment/50">{t("syncedWithDiscord")}</span>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.map((m) => (
          <div key={m.id} className="text-sm">
            <span className={m.source === "discord" ? "text-verdant-bright" : "text-brass-bright"}>
              {m.displayName}
            </span>
            <span className="text-parchment/40 text-xs ml-2 font-mono">
              {new Date(m.createdAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
            </span>
            <p className="text-parchment/90">{m.content}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 border-t border-brass/30 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={authSession ? t("messageThePlaceholder") : t("loginToChat")}
          disabled={!authSession}
          className="flex-1 rounded bg-ink px-3 py-2 text-sm text-parchment placeholder:text-parchment/40 border border-brass/20 focus:outline-none focus:ring-2 focus:ring-brass"
        />
        <button
          onClick={send}
          disabled={!authSession}
          className="rounded bg-brass px-4 py-2 text-sm font-medium text-ink900 hover:bg-brass-bright disabled:opacity-40"
        >
          {t("send")}
        </button>
      </div>
    </section>
  );
}
