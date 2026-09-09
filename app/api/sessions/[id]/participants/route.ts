import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDM } from "@/lib/roles";
import { apiError } from "@/lib/api-helpers";
import { syncSession } from "@/server/session-sync";
import { isAdmin } from "@/lib/roles";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const table = await prisma.gameSession.findUnique({ where: { id } });
    if (!table) return NextResponse.json({ error: "Sessão não encontrada." }, { status: 404 });
    if (table.endedAt) return NextResponse.json({ error: "Esta sessão já foi encerrada." }, { status: 409 });
    const requesterId = (session.user as any).id;
    const requesterIsDM = isDM(session);
    const body = await req.json();

    if (body.userId && body.userId !== requesterId && !isAdmin(session) && table.createdBy !== requesterId) return NextResponse.json({ error: "Somente o DM desta mesa pode atribuir jogadores." }, { status: 403 });
    let targetUserId: string = body.userId ?? requesterId;
    let characterId: string | null = body.characterId ?? null;

    if (!requesterIsDM) {
      if (body.userId && body.userId !== requesterId) {
        return NextResponse.json({ error: "You can only join for yourself" }, { status: 403 });
      }
      targetUserId = requesterId;
      if (!characterId) {
        return NextResponse.json({ error: "Choose a character to bring to this session" }, { status: 400 });
      }
      const character = await prisma.character.findUnique({ where: { id: characterId } });
      if (!character || character.userId !== requesterId) {
        return NextResponse.json({ error: "That character isn't yours" }, { status: 403 });
      }
    }

    const participant = await prisma.sessionParticipant.upsert({
      where: { sessionId_userId: { sessionId: id, userId: targetUserId } },
      update: { characterId },
      create: { sessionId: id, userId: targetUserId, characterId },
      include: { user: { select: { id: true, username: true } } },
    });

    await syncSession(prisma, id);

    return NextResponse.json({ participant }, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
