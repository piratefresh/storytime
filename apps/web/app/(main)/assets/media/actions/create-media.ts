"use server";

import { cookies } from "next/headers";
import { lucia } from "@/lib/auth";
import { db } from "@/lib/db";

export async function createMedia({
  url,
  fileId,
  storyId,
}: {
  fileId: string;
  url: string;
  storyId: string;
  userId: string;
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

  if (!fileId) {
    return { error: "id not valid" };
  }

  if (!url) {
    return { error: "url not valid or found" };
  }
  console.log("storyId: ", fileId);

  await db.media.create({
    data: {
      url,
      fileId,
      storyId,
      type: "image",
      userId: user.id,
    },
  });

  return {
    success: "Media created successfully!",
  };
}
