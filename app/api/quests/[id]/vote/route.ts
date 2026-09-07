import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-helpers";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id;

    const existing = await prisma.questVote.findUnique({
      where: { questId_userId: { questId: id, userId } },
    });

    if (existing) {
      await prisma.questVote.delete({ where: { id: existing.id } });
      return NextResponse.json({ voted: false });
    }

    await prisma.questVote.create({ data: { questId: id, userId } });
    return NextResponse.json({ voted: true });
  } catch (e) {
    return apiError(e);
  }
}
