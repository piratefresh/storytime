"use server";

import { lucia } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return new NextResponse(
      JSON.stringify({ error: "Authentication required" }),
      {
        status: 401, // Unauthorized
      }
    );
  }
  const { user, session } = await lucia.validateSession(sessionId);

  if (!user) {
    return new NextResponse(
      JSON.stringify({ error: "Session invalid or expired" }),
      {
        status: 401, // Unauthorized
      }
    );
  }

  return new NextResponse(JSON.stringify({ user }), {
    status: 200, // OK
  });
}
