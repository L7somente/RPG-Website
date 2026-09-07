import { NextResponse } from "next/server";

// Manual registration is disabled: accounts are created only via Discord
// OAuth (see lib/auth.ts signIn callback), which auto-provisions a User
// on first login.
export async function POST() {
  return NextResponse.json(
    { error: "Registration via email/password is disabled. Sign in with Discord instead." },
    { status: 410 }
  );
}
