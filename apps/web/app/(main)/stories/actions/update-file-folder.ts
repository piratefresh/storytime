"use server";

import { ZodError } from "zod";
import { revalidatePath } from "next/cache";
import { validateRequest } from "@/lib/auth";
import { type FormState, type FormResponse } from "@/types";
import { db } from "@/lib/db";
import { updateSchema } from "@/schemas";

export async function updateFileFolder(
  state: FormState,
  data: FormData,
  skipRevalidation?: boolean
): Promise<FormResponse> {
  const { session } = await validateRequest();
  if (!session) {
    throw new ZodError([
      {
        path: ["auth"],
        code: "custom",
        message: "This action requires authentication.",
      },
    ]);
  }

  const parsedData = updateSchema.parse({
    fileId: data.get("fileId"),
    folderId: data.get("folderId"),
    storyId: data.get("storyId"),
    type: data.get("type") as "file" | "folder",
    parentId: data.get("parentId"),
  });

  if (parsedData.type === "folder") {
    const { folderId, storyId, parentId } = parsedData;
    try {
      const folder = await db.folder.update({
        where: {
          id: folderId,
          storyId,
        },
        data: {
          parentId,
        },
        include: {
          story: true,
        },
      });

      if (!folder.story) {
        throw new ZodError([
          {
            path: ["story"],
            code: "custom",
            message: "story not found, cannot rename.",
          },
        ]);
      }

      if (!skipRevalidation) {
        revalidatePath(`/`);
      }

      return { message: `Folder renamed.`, status: "success" };
    } catch (error) {
      // Log the error for debugging; this is particularly useful during development
      console.error("Error during database operation:", error);

      return {
        status: "error",
        message: "Failed to rename folder",
      };
    }
  } else {
    const { fileId, storyId, parentId } = parsedData;

    try {
      const file = await db.file.update({
        where: {
          id: fileId,
          storyId,
        },
        data: {
          folderId: parentId,
        },
        include: {
          story: true,
        },
      });

      if (!file.story) {
        throw new ZodError([
          {
            path: ["story"],
            code: "custom",
            message: "story not found, cannot rename.",
          },
        ]);
      }

      if (!skipRevalidation) {
        revalidatePath(`/`);
      }

      return { message: `File renamed.`, status: "success" };
    } catch (error) {
      // Log the error for debugging; this is particularly useful during development
      console.error("Error during database operation:", error);

      return {
        status: "error",
        message: "Failed to rename file",
      };
    }
  }
}
