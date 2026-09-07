import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDM } from "@/lib/roles";
import { apiError } from "@/lib/api-helpers";
import { itemSchema } from "@/lib/validation";

async function assertAccess(characterId: string, session: any) {
  const character = await prisma.character.findUnique({ where: { id: characterId } });
  if (!character) return null;
  if (character.userId === session?.user?.id || isDM(session)) return character;
  return null;
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const owned = await assertAccess(id, session);
    if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { name, itemType, quantity, weight, description, properties } = itemSchema.parse(await req.json());
    const item = await prisma.inventoryItem.create({
      data: {
        characterId: id,
        name,
        itemType: itemType ?? "misc",
        quantity: quantity ?? 1,
        weight: weight ?? 0,
        description,
        properties: properties ?? {},
      },
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
