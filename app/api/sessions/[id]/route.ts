import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDM } from "@/lib/roles";
import { apiError } from "@/lib/api-helpers";
import { deleteDiscordSessionEvent, deleteDiscordChannel } from "@/lib/discord";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!isDM(session)) {
      return NextResponse.json({ error: "Only a DM can end sessions" }, { status: 403 });
    }

    const existing = await prisma.gameSession.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (existing.discordEventId) {
      await deleteDiscordSessionEvent(existing.discordEventId);
    }
    if (existing.discordVoiceChannelId) {
      await deleteDiscordChannel(existing.discordVoiceChannelId);
    }
    await prisma.gameSession.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
