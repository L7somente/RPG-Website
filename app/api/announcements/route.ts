import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDM } from "@/lib/roles";
import { apiError } from "@/lib/api-helpers";

export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ announcements });
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!isDM(session)) {
      return NextResponse.json({ error: "Only a DM can post announcements" }, { status: 403 });
    }
    const { title, content, pinned } = await req.json();
    const announcement = await prisma.announcement.create({
      data: { title, content, pinned: !!pinned, createdBy: (session!.user as any).id },
    });
    return NextResponse.json({ announcement }, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
