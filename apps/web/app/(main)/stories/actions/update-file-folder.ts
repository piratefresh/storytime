"use server";

import { revalidatePath } from "next/cache";
import { and, db, eq, outlineNode } from "@repo/db";
import { validateRequest } from "@/lib/auth";
import { assertOwnsProject } from "@/lib/stories";
import { type FormState, type FormResponse } from "@/types";
import { updateSchema } from "@/schemas";

/** Moves a file or folder under a new parent. */
export async function updateFileFolder(
  state: FormState,
  data: FormData,
  skipRevalidation?: boolean,
): Promise<FormResponse> {
  const { user } = await validateRequest();
  if (!user) {
    return { status: "error", message: "This action requires authentication." };
  }

  const parsed = updateSchema.parse({
    fileId: data.get("fileId"),
    folderId: data.get("folderId"),
    storyId: data.get("storyId"),
    type: data.get("type") as "file" | "folder",
    parentId: data.get("parentId"),
  });
  const id = parsed.type === "folder" ? parsed.folderId : parsed.fileId;
  const label = parsed.type === "folder" ? "Folder" : "File";

  try {
    await assertOwnsProject(parsed.storyId, user.id);
    // Dropping on the story itself sends the story id as parent: that means the root.
    const parentId =
      parsed.parentId === parsed.storyId ? null : parsed.parentId;
    await db
      .update(outlineNode)
      .set({ parentId })
      .where(
        and(eq(outlineNode.id, id), eq(outlineNode.projectId, parsed.storyId)),
      );
    if (!skipRevalidation) revalidatePath("/");
    return { message: `${label} moved.`, status: "success" };
  } catch (error) {
    console.error("Error during database operation:", error);
    return {
      status: "error",
      message: `Failed to move ${label.toLowerCase()}`,
    };
  }
}
