import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDM } from "@/lib/roles";
import { apiError } from "@/lib/api-helpers";
import { awardXP } from "@/lib/xp";

export async function GET() {
  try {
    const xp = await prisma.globalXP.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    });
    return NextResponse.json({ xp });
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!isDM(session)) {
      return NextResponse.json({ error: "Only a DM can award XP" }, { status: 403 });
    }

    const { amount } = await req.json();
    if (!Number.isSafeInteger(amount) || amount <= 0 || amount > 100000000) {
      return NextResponse.json({ error: "amount must be a positive number" }, { status: 400 });
    }

    const updated = await awardXP(amount);
    return NextResponse.json({ xp: updated });
  } catch (e) {
    return apiError(e);
  }
}
