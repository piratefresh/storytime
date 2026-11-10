"use server";

import { revalidatePath } from "next/cache";
import { db, outlineNode } from "@repo/db";
import { validateRequest } from "@/lib/auth";
import {
  assertOwnsProject,
  uniqueSiblingTitle,
  type StoryFile,
} from "@/lib/stories";
import { type FormState, type FormResponse } from "@/types";
import { createFileSchema } from "@/schemas";

export async function createFile(
  state: FormState,
  data: FormData,
): Promise<FormResponse<StoryFile>> {
  const { storyId, name, folderId } = createFileSchema.parse({
    name: data.get("name"),
    storyId: data.get("storyId"),
    folderId: data.get("folderId"),
  });
  const { user } = await validateRequest();
  if (!user) {
    return { status: "error", message: "This action requires authentication." };
  }

  try {
    await assertOwnsProject(storyId, user.id);
    const parentId = folderId ?? null;
    const title = await uniqueSiblingTitle({
      projectId: storyId,
      parentId,
      base: name ?? "Untitled",
    });

    const [scene] = await db
      .insert(outlineNode)
      .values({ projectId: storyId, parentId, kind: "scene", title })
      .returning();
    if (!scene) throw new Error("Insert returned no row");

    revalidatePath("/");
    return {
      message: "File created successfully.",
      status: "success",
      data: {
        id: scene.id,
        name: scene.title,
        folderId: scene.parentId,
        storyId,
        content: scene.content,
        type: null,
        url: null,
      },
    };
  } catch (error) {
    console.error("Error during database operation:", error);
    return { status: "error", message: "Failed to create file" };
  }
}
