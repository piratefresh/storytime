"use server";

import { ZodError } from "zod";
import { revalidatePath } from "next/cache";
import { validateRequest } from "@/lib/auth";
import { type FormState, type FormResponse } from "@/types";
import { db } from "@/lib/db";
import { deleteSchema } from "@/schemas";

export async function deleteFileFolder(
  state: FormState,
  data: FormData
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

  const parsedData = deleteSchema.parse({
    fileId: data.get("fileId"),
    folderId: data.get("folderId"),
    storyId: data.get("storyId"),
    type: data.get("type") as "file" | "folder",
  });

  if (parsedData.type === "folder") {
    const { folderId, storyId } = parsedData;
    try {
      await db.folder.delete({
        where: {
          id: folderId,
          storyId,
        },
      });

      revalidatePath(`/`);

      return { message: `Folder deleted.`, status: "success" };
    } catch (error) {
      // Log the error for debugging; this is particularly useful during development
      console.error("Error during database operation:", error);

      return {
        status: "error",
        message: "Failed to delete folder",
      };
    }
  } else {
    const { fileId, storyId } = parsedData;

    try {
      await db.file.delete({
        where: {
          id: fileId,
          storyId,
        },
      });

      revalidatePath(`/`);

      return { message: `File deleted.`, status: "success" };
    } catch (error) {
      // Log the error for debugging; this is particularly useful during development
      console.error("Error during database operation:", error);

      return {
        status: "error",
        message: "Failed to delete file",
      };
    }
  }
}
