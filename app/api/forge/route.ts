import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDM } from "@/lib/roles";
import { apiError } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!isDM(session)) return NextResponse.json({ error: "DM or admin access required" }, { status: 403 });

    const items = await prisma.forgedItem.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ items });
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!isDM(session)) return NextResponse.json({ error: "DM or admin access required" }, { status: 403 });

    const { name, itemType, rarity, weight, description, bonus, effect } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "name required" }, { status: 400 });

    const item = await prisma.forgedItem.create({
      data: {
        name: name.trim(),
        itemType: itemType ?? "misc",
        rarity: rarity ?? "common",
        weight: weight ?? 0,
        description: description ?? "",
        properties: { bonus: bonus ?? "", effect: effect ?? "" },
        createdBy: (session!.user as any).id,
      },
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
