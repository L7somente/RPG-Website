import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDM, isAdmin } from "@/lib/roles";
import { apiError } from "@/lib/api-helpers";
import { syncSession } from "@/server/session-sync";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await getServerSession(authOptions);
    if (!isDM(auth)) return NextResponse.json({ error: "Apenas o DM pode gerenciar sessões." }, { status: 403 });
    const existing = await prisma.gameSession.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Sessão não encontrada." }, { status: 404 });
    if (!isAdmin(auth) && existing.createdBy !== (auth!.user as any).id) return NextResponse.json({ error: "Somente o DM desta sessão pode encerrá-la." }, { status: 403 });
    const { action } = await req.json();
    if (action !== "end" && action !== "sync") return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
    if (action === "end") {
      const changed = await prisma.gameSession.updateMany({ where: { id, endedAt: null, OR: [{ syncLockedUntil: null }, { syncLockedUntil: { lt: new Date() } }] }, data: { endedAt: new Date(), discordSyncedAt: null } });
      if (!changed.count && !existing.endedAt) return NextResponse.json({ error: "Sincronização em andamento. Tente encerrar novamente em alguns segundos." }, { status: 409 });
    }
    await syncSession(prisma, id);
    return NextResponse.json({ session: await prisma.gameSession.findUnique({ where: { id } }) });
  } catch (error) { return apiError(error); }
}

// Compatibility with the previous DM panel: ending preserves the history.
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  return PATCH(new Request(req.url, { method: "PATCH", body: JSON.stringify({ action: "end" }) }), context);
}
