import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-helpers";

export async function GET() {
  try {
    const entries = await prisma.missionLogEntry.findMany({
      orderBy: { completedAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ entries });
  } catch (e) {
    return apiError(e);
  }
}
