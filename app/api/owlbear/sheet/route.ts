import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { allowedOwlbearCharacter, hashAccess } from "@/lib/owlbear";
import { apiError } from "@/lib/api-helpers";
export async function GET(req: Request) {
  const headers = { "Cache-Control": "no-store" };
  const denied = () => NextResponse.json({ error: "Acesso expirado, revogado ou sala diferente. Gere um novo código no Ledger." }, { status: 401, headers });
  try {
    const token = req.headers.get("Authorization")?.match(/^Bearer ([A-Za-z0-9_-]{43})$/)?.[1];
    if (!token) return denied();
    const access = await prisma.owlbearAccess.findUnique({ where: { tokenHash: hashAccess(token) } });
    if (!access || access.expiresAt <= new Date() || req.headers.get("X-Owlbear-Room") !== access.roomId) return denied();
    const allowed = await allowedOwlbearCharacter(access.userId, access.sessionId, access.characterId);
    if (!allowed || allowed.session.owlbearRoomId !== access.roomId) return denied();
    const { userId: _owner, ...character } = allowed.character;
    return NextResponse.json({ character, sessionTitle: allowed.session.title, expiresAt: access.expiresAt }, { headers });
  } catch (e) { return apiError(e); }
}
