import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDM } from "@/lib/roles";
import { apiError } from "@/lib/api-helpers";
import { syncDiscordVoiceChannelAccess } from "@/lib/discord";

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

    const requesterId = (session.user as any).id;
    if (!isDM(session) && participant.userId !== requesterId) {
      return NextResponse.json({ error: "You can only remove your own signup" }, { status: 403 });
    }

    await prisma.sessionParticipant.delete({ where: { id: participantId } });

    const gameSession = await prisma.gameSession.findUnique({
      where: { id },
      include: { participants: { include: { user: { select: { discordId: true } } } } },
    });
    if (gameSession?.discordVoiceChannelId) {
      const [creator, admins] = await Promise.all([
        prisma.user.findUnique({ where: { id: gameSession.createdBy }, select: { discordId: true } }),
        prisma.user.findMany({ where: { role: "ADMIN" }, select: { discordId: true } }),
      ]);
      const allowedDiscordIds = [
        creator?.discordId,
        ...admins.map((a) => a.discordId),
        ...gameSession.participants.map((p) => p.user.discordId),
      ].filter((val): val is string => Boolean(val));
      await syncDiscordVoiceChannelAccess(gameSession.discordVoiceChannelId, allowedDiscordIds);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
