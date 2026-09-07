import { NextResponse } from "next/server";
// Login is exclusively handled by Discord. Local passwords are no longer used.
export async function PATCH() {
  return NextResponse.json({ error: "Manage your password in Discord" }, { status: 410 });
}
