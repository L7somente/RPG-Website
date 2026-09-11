import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDM } from "@/lib/roles";
import { apiError } from "@/lib/api-helpers";
import { grantItemSchema } from "@/lib/item-forge";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!isDM(session)) return NextResponse.json({ error: "DM or admin access required" }, { status: 403 });

    const { characterId, quantity } = grantItemSchema.parse(await req.json());

    const blueprint = await prisma.forgedItem.findUnique({ where: { id } });
    if (!blueprint) return NextResponse.json({ error: "Forged item not found" }, { status: 404 });

    const character = await prisma.character.findUnique({ where: { id: characterId } });
    if (!character) return NextResponse.json({ error: "Character not found" }, { status: 404 });

    const item = await prisma.inventoryItem.create({
      data: {
        characterId,
        name: blueprint.name,
        itemType: blueprint.itemType,
        quantity: quantity ?? 1,
        weight: blueprint.weight,
        description: blueprint.description,
        properties: { ...(blueprint.properties as object), rarity: blueprint.rarity },
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
