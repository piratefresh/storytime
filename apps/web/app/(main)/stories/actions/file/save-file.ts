"use server";

import { revalidatePath } from "next/cache";
import { and, db, eq, outlineNode } from "@repo/db";
import { validateRequest } from "@/lib/auth";
import { assertOwnsProject } from "@/lib/stories";
import { type FormState, type FormResponse } from "@/types";
import { saveFileSchema } from "@/schemas";

export async function saveFile(
  state: FormState,
  data: FormData,
  skipRevalidation?: boolean,
): Promise<FormResponse> {
  const { user } = await validateRequest();
  if (!user) {
    return { status: "error", message: "This action requires authentication." };
  }

  const { fileId, storyId, content } = saveFileSchema.parse({
    fileId: data.get("fileId"),
    content: data.get("content"),
    storyId: data.get("storyId"),
  });

  try {
    await assertOwnsProject(storyId, user.id);
    if (content !== null && content !== undefined) {
      await db
        .update(outlineNode)
        .set({ content })
        .where(
          and(eq(outlineNode.id, fileId), eq(outlineNode.projectId, storyId)),
        );
    }
    if (!skipRevalidation) revalidatePath("/");
    return { message: "Content saved.", status: "success" };
  } catch (error) {
    console.error("Error during database operation:", error);
    return { status: "error", message: "Failed to save file" };
  }
}
