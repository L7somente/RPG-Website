import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDM, isAdmin } from "@/lib/roles";
import { apiError } from "@/lib/api-helpers";
import { postQuestToDiscordForum } from "@/lib/discord";
import { xpAmount } from "@/lib/validation";

export async function GET() {
  try {
    const quests = await prisma.quest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        creator: { select: { id: true, username: true } },
        votes: { include: { user: { select: { id: true, username: true } } } },
      },
    });
    return NextResponse.json({ quests });
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!isDM(session)) {
      return NextResponse.json({ error: "Only a DM can submit quests" }, { status: 403 });
    }
    const { title, description, xpReward } = await req.json();
    const userId = (session!.user as any).id;
    const admin = isAdmin(session);

    const quest = await prisma.quest.create({
      data: {
        title,
        description,
        xpReward: xpAmount.parse(xpReward ?? 0),
        status: admin ? "available" : "pending_approval",
        createdBy: userId,
        approvedBy: admin ? userId : null,
        approvedAt: admin ? new Date() : null,
      },
      include: {
        creator: { select: { id: true, username: true } },
        votes: { include: { user: { select: { id: true, username: true } } } },
      },
    });

    if (admin) {
      const discordThreadId = await postQuestToDiscordForum({
        title: quest.title,
        description: quest.description,
        xpReward: quest.xpReward,
        creatorName: quest.creator.username,
      });
      if (discordThreadId) {
        await prisma.quest.update({ where: { id: quest.id }, data: { discordThreadId } });
      }
    }

    return NextResponse.json({ quest }, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
