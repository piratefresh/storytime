"use server";

import { validateRequest } from "@/lib/auth";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ActionResult } from "next/dist/server/app-render/types";

export async function updateStory({
  storyId,
  content,
}: {
  storyId: string;
  content: string;
}): Promise<ActionResult> {
  const { session } = await validateRequest();
  if (!session) {
    return {
      error: "Unauthorized",
    };
  }

  // Default name if none provided
  if (!content) {
    return {
      error: "Content is required.",
    };
  }

  const story = await db.story.update({
    where: {
      id: storyId,
    },
    data: {
      content,
    },
  });

  if (!story) {
    return {
      error: "Story not found, failed to create folder",
    };
  }

  revalidatePath(`/stories/${story?.title}`);

  return { message: `Story '${story.title}' was updated successfully.` };
}
