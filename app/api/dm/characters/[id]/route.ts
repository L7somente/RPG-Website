import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDM } from "@/lib/roles";
import { apiError } from "@/lib/api-helpers";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!isDM(session)) {
      return NextResponse.json({ error: "DM or admin access required" }, { status: 403 });
    }

    const character = await prisma.character.findUnique({
      where: { id },
      include: { inventory: true, user: { select: { id: true, username: true } } },
    });
    if (!character) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ character });
  } catch (e) {
    return apiError(e);
  }
}
