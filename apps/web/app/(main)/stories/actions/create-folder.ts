"use server";

import { ZodError } from "zod";
import { revalidatePath } from "next/cache";
import { type Folder } from "@repo/db";
import { validateRequest } from "@/lib/auth";
import { type FormState, type FormResponse } from "@/types";
import { db } from "@/lib/db";
import { createFolderSchema } from "@/schemas";

export async function createFolder(
  state: FormState,
  data: FormData
): Promise<FormResponse<Folder>> {
  const { storyId, name, parentId } = createFolderSchema.parse({
    name: data.get("name"),
    storyId: data.get("storyId"),
    parentId: data.get("parentId"),
  });
  const { session } = await validateRequest();

  console.log("storyId: ", storyId, "name: ", name, "parentId: ", parentId);
  if (!session) {
    throw new ZodError([
      {
        path: ["auth"],
        code: "custom",
        message: "This action requires authentication.",
      },
    ]);
  }

  // Check if the folder name already exists
  let newName = name ?? "Untitled";
  let counter = 1;
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
    newName = name
      ? `${name} ${counter.toString()}`
      : `Untitled ${counter.toString()}`;
  }
  try {
    const newFolder = await db.folder.create({
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

    if (!story) {
      throw new ZodError([
        {
          path: ["github"],
          code: "custom",
          message: "Story not found, failed to create folder",
        },
      ]);
    }

    revalidatePath(`/stories/${story.title}`);

    return {
      message: `Folder created successfully.`,
      status: "success",
      data: newFolder,
    };
  } catch (error) {
    // Log the error for debugging; this is particularly useful during development
    console.error("Error during database operation:", error);

    return {
      status: "error",
      message: "Failed to create folder",
    };
  }
}
