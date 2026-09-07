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

    const players = await prisma.user.findMany({
      where: { role: "PLAYER" },
      select: { id: true, username: true },
      orderBy: { username: "asc" },
    });

    return NextResponse.json({ players });
  } catch (e) {
    return apiError(e);
  }
}
