"use server";

import { revalidatePath } from "next/cache";
import { and, db, eq, outlineNode } from "@repo/db";
import { validateRequest } from "@/lib/auth";
import { assertOwnsProject, uniqueSiblingTitle } from "@/lib/stories";
import { type FormState, type FormResponse } from "@/types";
import { renameSchema } from "@/schemas";

export async function rename(
  state: FormState,
  data: FormData,
): Promise<FormResponse> {
  const { user } = await validateRequest();
  if (!user) {
    return { status: "error", message: "This action requires authentication." };
  }

  const parsed = renameSchema.parse({
    name: data.get("name"),
    fileId: data.get("fileId"),
    folderId: data.get("folderId"),
    storyId: data.get("storyId"),
    type: data.get("type") as "file" | "folder",
  });
  const id = parsed.type === "folder" ? parsed.folderId : parsed.fileId;
  const label = parsed.type === "folder" ? "Folder" : "File";

  try {
    await assertOwnsProject(parsed.storyId, user.id);
    const where = and(
      eq(outlineNode.id, id),
      eq(outlineNode.projectId, parsed.storyId),
    );
    const [node] = await db
      .select({ parentId: outlineNode.parentId })
      .from(outlineNode)
      .where(where);
    if (!node) throw new Error(`${label} not found`);

    const title =
      parsed.type === "file"
        ? await uniqueSiblingTitle({
            projectId: parsed.storyId,
            parentId: node.parentId,
            base: parsed.name,
            format: (b, n) => `${b} (${n.toString()})`,
            excludeId: id,
          })
        : parsed.name;

    await db.update(outlineNode).set({ title }).where(where);
    revalidatePath("/");
    return { message: `${label} renamed.`, status: "success" };
  } catch (error) {
    console.error("Error during database operation:", error);
    return {
      status: "error",
      message: `Failed to rename ${label.toLowerCase()}`,
    };
  }
}
