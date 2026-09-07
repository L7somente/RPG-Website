import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDM } from "@/lib/roles";
import { apiError } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!isDM(session)) {
      return NextResponse.json({ error: "DM or admin access required" }, { status: 403 });
    }

    const characters = await prisma.character.findMany({
      orderBy: { name: "asc" },
      include: { user: { select: { id: true, username: true } } },
    });

    return NextResponse.json({ characters });
  } catch (e) {
    return apiError(e);
  }
}
