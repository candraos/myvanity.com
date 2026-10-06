import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { fieldErrors } from "@/lib/validation";

/**
 * Re-checks the session at the data boundary. The proxy already redirected
 * unauthenticated browsers away from /admin, but API routes are reachable
 * directly, so this is the check that actually protects writes.
 */
export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { ok: true as const, user: session.user };
}

export function badRequest(error: z.ZodError) {
  return NextResponse.json(
    { error: "Validation failed", fields: fieldErrors(error) },
    { status: 400 },
  );
}

export function notFound(what = "Resource") {
  return NextResponse.json({ error: `${what} not found` }, { status: 404 });
}

/**
 * Maps a thrown error to a response. Anything unrecognised is logged server-side
 * and reported as a bare 500 — stack traces and Prisma internals never reach the
 * client.
 */
export function handleError(error: unknown, context: string) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = (error.meta?.target as string[] | undefined)?.join(", ");
      return NextResponse.json(
        { error: target ? `That ${target} is already taken.` : "Already exists." },
        { status: 409 },
      );
    }
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "That category does not exist." },
        { status: 400 },
      );
    }
  }

  console.error(`[${context}]`, error);
  return NextResponse.json(
    { error: "Something went wrong.", debug: error instanceof Error ? { message: error.message, stack: error.stack } : String(error) },
    { status: 500 },
  );
}

/** Parses a JSON body without letting a malformed payload throw past the handler. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
