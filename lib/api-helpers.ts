import { NextResponse } from "next/server";
import { ZodError } from "zod";

// Every route handler wraps its body in try/catch and calls this in the
// catch block. Without it, an unhandled exception (e.g. a Prisma error from
// a schema that hasn't been migrated yet) makes Next return an empty body,
// which breaks every `await res.json()` call on the client with a cryptic
// "Unexpected end of JSON input" — this guarantees a real JSON error instead.
export function apiError(error: unknown, fallbackMessage = "Something went wrong") {
  if (error instanceof ZodError || error instanceof SyntaxError) {
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
  }
  if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  console.error(error);
  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}
