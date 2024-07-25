"use server";

import { ZodError } from "zod";
import { revalidatePath } from "next/cache";
import { validateRequest } from "@/lib/auth";
import { type FormState, type FormResponse } from "@/types";
import { db } from "@/lib/db";
import { createFileSchema } from "@/schemas";

export async function createFile(
  state: FormState,
  data: FormData
): Promise<FormResponse> {
  const { storyId, name, folderId } = createFileSchema.parse({
    name: data.get("name"),
    storyId: data.get("storyId"),
    folderId: data.get("folderId"),
  });
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

  // Check if the folder name already exists
  let newName = name ?? "Untitled";
  let counter = 0;

  while (
    await db.file.findFirst({
      where: {
        storyId,
        name: newName,
        folderId,
      },
    })
  ) {
    counter++;
    newName = `${newName} ${counter.toString()}`;
  }
  try {
    await db.file.create({
      data: {
        storyId,
        userId: session.userId,
        name: newName,
        folderId,
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
          path: ["story"],
          code: "custom",
          message: "Story not found, failed to create file",
        },
      ]);
    }

    revalidatePath("/");

    return { message: `File created successfully.`, status: "success" };
  } catch (error) {
    // Log the error for debugging; this is particularly useful during development
    console.error("Error during database operation:", error);

    return {
      status: "error",
      message: "Failed to create file",
    };
  }
}
