import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-helpers";
import { broadcast } from "@/lib/realtime";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const messages = await prisma.chatMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ messages: messages.reverse() });
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { content } = await req.json();
    if (!content || typeof content !== "string" || !content.trim() || content.length > 1800) {
      return NextResponse.json({ error: "content required" }, { status: 400 });
    }

    const message = await prisma.chatMessage.create({
      data: {
        userId: (session.user as any).id,
        displayName: (session.user as any).username ?? session.user.name ?? "Unknown Adventurer",
        source: "site",
        content: content.trim(),
      },
    });

    await broadcast("chat", message);

    return NextResponse.json({ message }, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
