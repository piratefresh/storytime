"use server";

import { revalidatePath } from "next/cache";
import { and, db, eq, outlineNode } from "@repo/db";
import { validateRequest } from "@/lib/auth";
import { assertOwnsProject } from "@/lib/stories";
import { type FormState, type FormResponse } from "@/types";
import { deleteSchema } from "@/schemas";

export async function deleteFileFolder(
  state: FormState,
  data: FormData,
): Promise<FormResponse> {
  const { user } = await validateRequest();
  if (!user) {
    return { status: "error", message: "This action requires authentication." };
  }

  const parsed = deleteSchema.parse({
    fileId: data.get("fileId"),
    folderId: data.get("folderId"),
    storyId: data.get("storyId"),
    type: data.get("type") as "file" | "folder",
  });
  const id = parsed.type === "folder" ? parsed.folderId : parsed.fileId;
  const label = parsed.type === "folder" ? "Folder" : "File";

  try {
    await assertOwnsProject(parsed.storyId, user.id);
    // Children go too, via the outline_node.parent_id cascade.
    await db
      .delete(outlineNode)
      .where(
        and(eq(outlineNode.id, id), eq(outlineNode.projectId, parsed.storyId)),
      );
    revalidatePath("/");
    return { message: `${label} deleted.`, status: "success" };
  } catch (error) {
    console.error("Error during database operation:", error);
    return {
      status: "error",
      message: `Failed to delete ${label.toLowerCase()}`,
    };
  }
}
