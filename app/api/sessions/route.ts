import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDM } from "@/lib/roles";
import { apiError } from "@/lib/api-helpers";
import { createDiscordSessionEvent, createDiscordSessionVoiceChannel } from "@/lib/discord";

export async function GET() {
  try {
    const sessions = await prisma.gameSession.findMany({
      where: { scheduledAt: { gte: new Date() } },
      orderBy: { scheduledAt: "asc" },
      include: {
        participants: { include: { user: { select: { id: true, username: true } } } },
      },
    });
    return NextResponse.json({ sessions });
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!isDM(session)) {
      return NextResponse.json({ error: "Only a DM can schedule sessions" }, { status: 403 });
    }
    const { title, scheduledAt, description, durationMinutes } = await req.json();
    const creatorId = (session!.user as any).id;

    const created = await prisma.gameSession.create({
      data: {
        title,
        scheduledAt: new Date(scheduledAt),
        description,
        durationMinutes: typeof durationMinutes === "number" ? durationMinutes : undefined,
        createdBy: creatorId,
      },
    });

    // Only masters (this session's DM + every ADMIN) can see the table's
    // voice channel until players are assigned to it.
    const [creator, admins] = await Promise.all([
      prisma.user.findUnique({ where: { id: creatorId }, select: { discordId: true } }),
      prisma.user.findMany({ where: { role: "ADMIN" }, select: { discordId: true } }),
    ]);
    const allowedDiscordIds = [creator?.discordId, ...admins.map((a) => a.discordId)].filter(
      (id): id is string => Boolean(id)
    );

    const voiceChannelId = await createDiscordSessionVoiceChannel({
      name: created.title,
      allowedDiscordIds,
    });

    const discordEventId = voiceChannelId
      ? await createDiscordSessionEvent({
          title: created.title,
          description: created.description,
          scheduledAt: created.scheduledAt,
          durationMinutes: created.durationMinutes,
          voiceChannelId,
        })
      : null;

    const finalSession =
      voiceChannelId || discordEventId
        ? await prisma.gameSession.update({
            where: { id: created.id },
            data: { discordVoiceChannelId: voiceChannelId, discordEventId },
          })
        : created;

    return NextResponse.json({ session: finalSession }, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
