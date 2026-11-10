"use server";

import { db, media } from "@repo/db";
import { validateRequest } from "@/lib/auth";
import { assertOwnsProject } from "@/lib/stories";

export async function createMedia({
  url,
  storyId,
}: {
  fileId: string;
  url: string;
  storyId: string;
  userId: string;
}): Promise<{ error: string } | { success: string } | undefined> {
  const { user } = await validateRequest();
  if (!user) return { error: "User not found" };
  if (!url) return { error: "url not valid or found" };
  await assertOwnsProject(storyId, user.id);

  await db
    .insert(media)
    .values({ url, projectId: storyId, type: "image", userId: user.id });

  return { success: "Media created successfully!" };
}
