import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-helpers";
import { allowedOwlbearCharacter, hashAccess } from "@/lib/owlbear";
const headers = { "Cache-Control": "no-store" };
export async function POST(req: Request) {
  try {
    const auth = await getServerSession(authOptions);
    if (!auth?.user) return NextResponse.json({ error: "Entre no Ledger pelo Discord." }, { status: 401 });
    const { sessionId, characterId } = z.object({ sessionId: z.string().min(1).max(100), characterId: z.string().min(1).max(100) }).strict().parse(await req.json());
    const userId = (auth.user as any).id as string;
    const allowed = await allowedOwlbearCharacter(userId, sessionId, characterId);
    if (!allowed) return NextResponse.json({ error: "Vincule uma sala à sessão e confirme sua participação com esta ficha." }, { status: 403 });
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.$transaction([
      prisma.owlbearAccess.deleteMany({ where: { OR: [{ userId, sessionId }, { expiresAt: { lte: new Date() } }] } }),
      prisma.owlbearAccess.create({ data: { tokenHash: hashAccess(token), userId, sessionId, characterId, roomId: allowed.session.owlbearRoomId!, expiresAt } }),
    ]);
    return NextResponse.json({ token, expiresAt }, { headers });
  } catch (e) { return apiError(e); }
}
export async function DELETE(req: Request) {
  try {
    const auth = await getServerSession(authOptions);
    if (!auth?.user) return NextResponse.json({ error: "Entre no Ledger." }, { status: 401 });
    const { sessionId } = z.object({ sessionId: z.string().min(1).max(100) }).strict().parse(await req.json());
    await prisma.owlbearAccess.deleteMany({ where: { userId: (auth.user as any).id, sessionId } });
    return NextResponse.json({ ok: true }, { headers });
  } catch (e) { return apiError(e); }
}
