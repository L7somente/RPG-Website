import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/roles";
import { apiError } from "@/lib/api-helpers";
import { postQuestToDiscordForum } from "@/lib/discord";
import { xpAmount } from "@/lib/validation";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Only a master admin can approve quests" }, { status: 403 });
    }

    const { decision, xpReward } = await req.json();
    if (decision !== "approve" && decision !== "reject") {
      return NextResponse.json({ error: "decision must be 'approve' or 'reject'" }, { status: 400 });
    }

    const data: any = {
      status: decision === "approve" ? "available" : "rejected",
      approvedBy: (session!.user as any).id,
      approvedAt: new Date(),
    };
    if (xpReward !== undefined) {
      data.xpReward = xpAmount.parse(xpReward);
    }

    const quest = await prisma.quest.update({
      where: { id, status: "pending_approval" },
      data,
      include: { creator: { select: { username: true } } },
    });

    if (decision === "approve") {
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

    return NextResponse.json({ quest });
  } catch (e) {
    return apiError(e);
  }
}
