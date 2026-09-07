import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createToken } from "@/server/realtime-auth";
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const secret = process.env.SOCKET_SERVER_SECRET;
  if (!secret || secret.length < 32) return NextResponse.json({ error: "Realtime unavailable" }, { status: 503 });
  return NextResponse.json({ token: createToken((session.user as any).id, secret) }, { headers: { "Cache-Control": "no-store" } });
}
