"use server";

import { revalidatePath } from "next/cache";
import { db, outlineNode } from "@repo/db";
import { validateRequest } from "@/lib/auth";
import {
  assertOwnsProject,
  uniqueSiblingTitle,
  type StoryFolder,
} from "@/lib/stories";
import { type FormState, type FormResponse } from "@/types";
import { createFolderSchema } from "@/schemas";

export async function createFolder(
  state: FormState,
  data: FormData,
): Promise<FormResponse<Omit<StoryFolder, "file">>> {
  const { storyId, name, parentId } = createFolderSchema.parse({
    name: data.get("name"),
    storyId: data.get("storyId"),
    parentId: data.get("parentId"),
  });
  const { user } = await validateRequest();
  if (!user) {
    return { status: "error", message: "This action requires authentication." };
  }

  try {
    const story = await assertOwnsProject(storyId, user.id);
    const parent = parentId ?? null;
    const title = await uniqueSiblingTitle({
      projectId: storyId,
      parentId: parent,
      base: name ?? "Untitled",
      start: 2,
    });

    // Root folders are acts, nested ones chapters.
    const [node] = await db
      .insert(outlineNode)
      .values({
        projectId: storyId,
        parentId: parent,
        kind: parent ? "chapter" : "act",
        title,
      })
      .returning();
    if (!node) throw new Error("Insert returned no row");

    revalidatePath(`/stories/${story.title}`);
    return {
      message: "Folder created successfully.",
      status: "success",
      data: {
        id: node.id,
        name: node.title,
        parentId: node.parentId,
        storyId,
        ownerId: user.id,
      },
    };
  } catch (error) {
    console.error("Error during database operation:", error);
    return { status: "error", message: "Failed to create folder" };
  }
}
