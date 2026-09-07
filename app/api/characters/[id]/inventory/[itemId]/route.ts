import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-helpers";
import { itemPatchSchema } from "@/lib/validation";

async function assertOwnership(characterId: string, userId: string) {
  const character = await prisma.character.findUnique({ where: { id: characterId } });
  return character && character.userId === userId ? character : null;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const owned = await assertOwnership(id, (session.user as any).id);
    if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updates = itemPatchSchema.parse(await req.json());
    const item = await prisma.inventoryItem.update({
      where: { id: itemId, characterId: id },
      data: updates,
    });
    return NextResponse.json({ item });
  } catch (e) {
    return apiError(e);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const owned = await assertOwnership(id, (session.user as any).id);
    if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.inventoryItem.delete({ where: { id: itemId, characterId: id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
