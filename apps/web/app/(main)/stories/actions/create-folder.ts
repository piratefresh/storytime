"use server";

import { validateRequest } from "@/lib/auth";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ActionResult } from "next/dist/server/app-render/types";

export async function createFolder({
  storyId,
  name,
  parentId,
}: {
  storyId: string;
  name?: string;
  parentId?: string;
}): Promise<ActionResult> {
  const { session } = await validateRequest();
  if (!session) {
    return {
      error: "Unauthorized",
    };
  }

  // Default name if none provided
  if (!name) {
    name = "Untitled";
  }

  // Check if the folder name already exists
  let newName = name;
  let counter = 0;
  while (
    await db.folder.findFirst({
      where: {
        storyId,
        name: newName,
        parentId,
      },
    })
  ) {
    counter++;
    newName = `${name} ${counter}`;
  }

  const folder = await db.folder.create({
    data: {
      storyId,
      ownerId: session.userId,
      name: newName,
      parentId,
    },
  });

  const story = await db.story.findUnique({
    where: {
      id: storyId,
      ownerId: session.userId,
    },
  });

  if (!folder) {
    return {
      error: "Failed to create folder",
    };
  }

  if (!story) {
    return {
      error: "Story not found, failed to create folder",
    };
  }

  revalidatePath(`/stories/${story?.title}`);

  return { message: `Folder '${newName}' created successfully.` };
}
