export async function broadcast(kind: "xp" | "chat", payload: unknown) {
  if (!process.env.SOCKET_SERVER_SECRET) return;
  try {
    await fetch(`${process.env.SOCKET_SERVER_URL || process.env.NEXT_PUBLIC_SOCKET_URL}/broadcast-${kind}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.SOCKET_SERVER_SECRET}` },
      body: JSON.stringify(payload), signal: AbortSignal.timeout(5000),
    });
  } catch (error) { console.error("Realtime broadcast failed", error); }
}
