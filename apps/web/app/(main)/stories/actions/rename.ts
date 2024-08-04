"use server";

import { ZodError } from "zod";
import { revalidatePath } from "next/cache";
import { validateRequest } from "@/lib/auth";
import { type FormState, type FormResponse } from "@/types";
import { db } from "@/lib/db";
import { renameSchema } from "@/schemas";

export async function rename(
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

  const parsedData = renameSchema.parse({
    name: data.get("name"),
    fileId: data.get("fileId"),
    folderId: data.get("folderId"),
    storyId: data.get("storyId"),
    type: data.get("type") as "file" | "folder",
  });

  if (parsedData.type === "folder") {
    const { name, folderId, storyId } = parsedData;
    try {
      const folder = await db.folder.update({
        where: {
          id: folderId,
          storyId,
        },
        data: {
          name,
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

      revalidatePath(`/`);

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
    const { name, fileId, storyId } = parsedData;
    const uniqueName = await getUniqueFileName(name, storyId);
    try {
      const file = await db.file.update({
        where: {
          id: fileId,
          storyId,
        },
        data: {
          name: uniqueName,
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

      revalidatePath(`/`);

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

async function getUniqueFileName(
  name: string,
  storyId: string
): Promise<string> {
  let uniqueName = name;
  let counter = 1;

  // while loop will always run at least once
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while (true) {
    const existingFile = await db.file.findFirst({
      where: {
        name: uniqueName,
        storyId,
      },
    });
    if (!existingFile) return uniqueName;
    uniqueName = `${name} (${counter.toString()})`;
    counter++;
  }
}
