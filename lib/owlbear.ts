import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

export function parseOwlbearRoom(value: string) {
  const url = new URL(value.trim());
  const match = url.pathname.match(/^\/room\/([a-zA-Z0-9_-]+)(?:\/[^/]*)?\/?$/);
  if (url.protocol !== "https:" || !["owlbear.rodeo", "www.owlbear.rodeo", "owlbear.app"].includes(url.hostname) || url.username || url.password || url.port || !match) {
    throw new Error("Use o link HTTPS de uma sala do Owlbear Rodeo.");
  }
  url.search = ""; url.hash = "";
  return { owlbearRoomUrl: url.toString(), owlbearRoomId: match[1] };
}
export const hashAccess = (token: string) => createHash("sha256").update(token).digest("hex");

// The SDK room/player identity is not authentication. Always recheck Ledger access.
export async function allowedOwlbearCharacter(userId: string, sessionId: string, characterId: string) {
  const [user, session, character] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } }),
    prisma.gameSession.findUnique({ where: { id: sessionId }, include: { participants: true } }),
    prisma.character.findUnique({ where: { id: characterId }, select: {
      id: true, userId: true, name: true, race: true, class: true, level: true,
      currentHp: true, maxHp: true, tempHp: true, armorClass: true, speed: true,
      initiative: true, attacks: true, updatedAt: true,
    } }),
  ]);
  if (!user || !session || session.endedAt || !session.owlbearRoomId || !character || character.userId !== userId) return null;
  const manages = user.role === "ADMIN" || (user.role === "DM" && session.createdBy === userId);
  if (!manages && !session.participants.some(p => p.userId === userId && p.confirmed && p.characterId === characterId)) return null;
  return { session, character };
}
