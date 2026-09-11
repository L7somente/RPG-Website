import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDM, isAdmin } from "@/lib/roles";
import { apiError } from "@/lib/api-helpers";
import { parseOwlbearRoom } from "@/lib/owlbear";
import { z } from "zod";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getServerSession(authOptions);
    if (!isDM(auth)) return NextResponse.json({ error: "Apenas o DM responsável pode vincular a sala." }, { status: 403 });
    const { id } = await params;
    const session = await prisma.gameSession.findUnique({ where: { id } });
    if (!session) return NextResponse.json({ error: "Sessão não encontrada." }, { status: 404 });
    if (!isAdmin(auth) && session.createdBy !== (auth!.user as any).id) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    if (session.endedAt) return NextResponse.json({ error: "Esta sessão já foi encerrada." }, { status: 409 });
    const { url } = z.object({ url: z.string().trim().max(500) }).strict().parse(await req.json());
    let data;
    try { data = url ? parseOwlbearRoom(url) : { owlbearRoomUrl: null, owlbearRoomId: null }; }
    catch { return NextResponse.json({ error: "Use o link HTTPS de uma sala do Owlbear Rodeo." }, { status: 400 }); }
    await prisma.$transaction([
      prisma.gameSession.update({ where: { id }, data }),
      prisma.owlbearAccess.deleteMany({ where: { sessionId: id } }),
    ]);
    return NextResponse.json({ ok: true });
  } catch (e) { return apiError(e); }
}
