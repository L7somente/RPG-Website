import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-helpers";
import { characterPatchSchema } from "@/lib/validation";
import { serializable } from "@/lib/transaction";
import { constrainedLevel } from "@/lib/world-level";

async function assertOwnership(characterId: string, userId: string) {
  const character = await prisma.character.findUnique({ where: { id: characterId } });
  if (!character || character.userId !== userId) return null;
  return character;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const character = await prisma.character.findUnique({
      where: { id },
      include: { inventory: true },
    });
    if (!character || character.userId !== (session.user as any).id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ character });
  } catch (e) {
    return apiError(e);
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const owned = await assertOwnership(id, (session.user as any).id);
    if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updates = characterPatchSchema.parse(await req.json());
    return await serializable(async (tx) => {
    const latest = await tx.character.findUnique({ where: { id } });
    if (!latest || latest.userId !== (session.user as any).id) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const world = await tx.globalXP.findUnique({ where: { id: 1 } });
    const level = constrainedLevel(latest, updates, world?.currentLevel ?? 1);
    if (level === null) return NextResponse.json({ error: "O nível total das classes deve respeitar o nível do mundo e corresponder ao nível da ficha." }, { status: 400 });
    updates.level = level;
    updates.proficiencyBonus = 2 + Math.floor((level - 1) / 4);
    const character = await tx.character.update({
      where: { id, userId: (session.user as any).id },
      data: updates,
    });
    return NextResponse.json({ character });
    });
  } catch (e) {
    return apiError(e);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const owned = await assertOwnership(id, (session.user as any).id);
    if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.character.delete({ where: { id, userId: (session.user as any).id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
