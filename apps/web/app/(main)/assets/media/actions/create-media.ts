"use server";

import { lucia } from "@/lib/auth";
import db from "@/lib/db";
import { cookies } from "next/headers";

export async function createMedia({
  url,
  contentId,
}: {
  contentId: string;
  url: string;
}): Promise<{ error: string } | { success: string } | undefined> {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return {
      error: "Session not found",
    };
  }
  const { user } = await lucia.validateSession(sessionId);
  if (!user) {
    return {
      error: "User not found",
    };
  }

  if (!contentId) {
    return { error: "id not valid" };
  }

  if (!url) {
    return { error: "url not valid or found" };
  }

  await db.media.create({
    data: {
      url,
      storyId: contentId,
      type: "image",
      userId: user?.id,
    },
  });

  return {
    success: "Media created successfully!",
  };
}
