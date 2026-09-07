import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-helpers";
import { classById } from "@/lib/dnd-data/classes";
import { raceById } from "@/lib/dnd-data/races";
import { serializable } from "@/lib/transaction";

const MAX_CHARACTER_SLOTS = 5;

const NewCharacterSchema = z.object({
  name: z.string().min(1).max(60),
  race: z.string().min(1),
  class: z.string().min(1),
  raceId: z.string().optional(),
  classId: z.string().optional(),
  background: z.string().optional(),
  alignment: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const characters = await prisma.character.findMany({
      where: { userId: (session.user as any).id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ characters, slotsUsed: characters.length, slotsMax: MAX_CHARACTER_SLOTS });
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id;

    const body = await req.json();
    return await serializable(async (tx) => {
    const count = await tx.character.count({ where: { userId } });
    if (count >= MAX_CHARACTER_SLOTS) {
      return NextResponse.json(
        { error: `Character slot limit reached (${MAX_CHARACTER_SLOTS} max). Delete a character to make room.` },
        { status: 409 }
      );
    }

    const parsed = NewCharacterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { raceId, classId, ...rest } = parsed.data;

    // Auto-fill mechanical defaults from the SRD reference data so a new
    // sheet starts as complete as possible instead of all-zeroes.
    const classDef = classId ? classById(classId) : undefined;
    const raceDef = raceId ? raceById(raceId) : undefined;

    const baseAbilities = {
      strength: 10 + (raceDef?.abilityIncreases.strength ?? 0),
      dexterity: 10 + (raceDef?.abilityIncreases.dexterity ?? 0),
      constitution: 10 + (raceDef?.abilityIncreases.constitution ?? 0),
      intelligence: 10 + (raceDef?.abilityIncreases.intelligence ?? 0),
      wisdom: 10 + (raceDef?.abilityIncreases.wisdom ?? 0),
      charisma: 10 + (raceDef?.abilityIncreases.charisma ?? 0),
    };
    const conMod = Math.floor((baseAbilities.constitution - 10) / 2);

    const character = await tx.character.create({
      data: {
        ...rest,
        userId,
        ...baseAbilities,
        speed: raceDef?.speed ?? 30,
        classes: classDef ? [{ id: classDef.id, level: 1 }] : [],
        proficiencyBonus: 2,
        hitDiceTotal: classDef ? `1d${classDef.hitDie}` : "1d8",
        maxHp: classDef ? classDef.hitDie + conMod : 8,
        currentHp: classDef ? classDef.hitDie + conMod : 8,
        spellcastingAbility: classDef?.spellcastingAbility ?? "",
      },
    });

    return NextResponse.json({ character }, { status: 201 });
    });
  } catch (e) {
    return apiError(e);
  }
}
