import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDM } from "@/lib/roles";
import { apiError } from "@/lib/api-helpers";
import { z } from "zod";
import { syncSession } from "@/server/session-sync";

export async function GET() {
  try {
    const sessions = await prisma.gameSession.findMany({

      orderBy: { scheduledAt: "asc" },
      include: {
        participants: { include: { user: { select: { id: true, username: true } } } },
      },
    });
    return NextResponse.json({ sessions: sessions.map(s => ({ ...s, status: s.endedAt ? "completed" : s.scheduledAt <= new Date() ? "active" : "scheduled" })) });
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
    const { title, scheduledAt, description, durationMinutes } = z.object({
      title: z.string().trim().min(1).max(100), scheduledAt: z.string().datetime({ offset: true }).refine(v => new Date(v).getTime() > Date.now(), "Escolha um horário futuro"),
      description: z.string().max(1000).optional(), durationMinutes: z.number().int().min(1).max(1440).optional()
    }).parse(await req.json());
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

    await syncSession(prisma, created.id);
    const finalSession = await prisma.gameSession.findUnique({ where: { id: created.id } });

    return NextResponse.json({ session: finalSession }, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
