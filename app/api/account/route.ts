import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: { id: true, email: true, username: true, role: true },
    });
    return NextResponse.json({ user });
  } catch (e) {
    return apiError(e);
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { username } = await req.json();
    if (!username || username.trim().length < 3) {
      return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 });
    }

    const clash = await prisma.user.findFirst({
      where: { username: username.trim(), NOT: { id: (session.user as any).id } },
    });
    if (clash) return NextResponse.json({ error: "That username is taken" }, { status: 409 });

    const user = await prisma.user.update({
      where: { id: (session.user as any).id },
      data: { username: username.trim() },
      select: { id: true, email: true, username: true, role: true },
    });
    return NextResponse.json({ user });
  } catch (e) {
    return apiError(e);
  }
}
