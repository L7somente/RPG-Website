import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isDM, isAdmin } from "@/lib/roles";
import { apiError } from "@/lib/api-helpers";
import { awardXPInTransaction } from "@/lib/xp";
import { serializable } from "@/lib/transaction";
import { questPatchSchema } from "@/lib/validation";
import { broadcast } from "@/lib/realtime";
import { archiveDiscordForumPost } from "@/lib/discord";
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!isDM(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { status, summary, xpReward } = questPatchSchema.parse(await req.json());
    if (xpReward !== undefined && !isAdmin(session)) return NextResponse.json({ error: "Only an admin can edit rewards" }, { status: 403 });
    const result = await serializable(async (tx) => {
      const existing = await tx.quest.findUnique({ where: { id } });
      if (!existing) return { error: "Not found", code: 404 } as const;
      if (status && (existing.status === "pending_approval" || existing.status === "rejected" || (existing.status === "completed" && status !== "completed"))) {
        return { error: "Invalid quest transition", code: 409 } as const;
      }
      const justCompleted = status === "completed" && existing.completedAt === null;
      const quest = await tx.quest.update({ where: { id }, data: {
        ...(status ? { status } : {}), ...(xpReward !== undefined ? { xpReward } : {}),
        ...(justCompleted ? { completedAt: new Date() } : {}),
      } });
      let xp = null;
      if (justCompleted) {
        await tx.missionLogEntry.create({ data: { questId: id, title: quest.title, summary: summary ?? quest.description } });
        if (quest.xpReward > 0) xp = await awardXPInTransaction(tx, quest.xpReward);
      }
      return { quest, xp, justCompleted };
    });
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.code });
    if (result.xp) await broadcast("xp", result.xp);
    if (result.justCompleted && result.quest.discordThreadId) await archiveDiscordForumPost(result.quest.discordThreadId, result.quest.title);
    return NextResponse.json({ quest: result.quest });
  } catch (error) { return apiError(error); }
}
