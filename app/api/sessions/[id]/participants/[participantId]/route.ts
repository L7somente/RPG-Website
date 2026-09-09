import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/roles";
import { apiError } from "@/lib/api-helpers";
import { syncSession } from "@/server/session-sync";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; participantId: string }> }
) {
  try {
    const { id, participantId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const participant = await prisma.sessionParticipant.findUnique({ where: { id: participantId } });
    if (!participant) return NextResponse.json({ ok: true });

    if (participant.sessionId !== id) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const table = await prisma.gameSession.findUnique({ where: { id } });
    if (!table || table.endedAt) return NextResponse.json({ error: "Sessão encerrada ou inexistente." }, { status: 409 });
    const requesterId = (session.user as any).id;
    if (!isAdmin(session) && table.createdBy !== requesterId && participant.userId !== requesterId) {
      return NextResponse.json({ error: "You can only remove your own signup" }, { status: 403 });
    }

    await prisma.sessionParticipant.delete({ where: { id: participantId } });

    await syncSession(prisma, id);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
