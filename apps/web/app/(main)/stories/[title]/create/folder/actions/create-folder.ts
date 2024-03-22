"use server";

import { formSchema } from "@/app/schemas/create-folder-schema";
import { lucia } from "@/lib/auth";
import db from "@/lib/db";
import { ActionResult } from "@/lib/form";
import { FolderView } from "@repo/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

type FormData = z.infer<typeof formSchema>;

export async function createFolder({
  formData,
  storyId,
}: {
  formData: FormData;
  storyId: string;
}): Promise<ActionResult> {
  const validatedFields = formSchema.safeParse(formData);
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      error: "Submitted data is invalid. Failed to create folder.",
    };
  }

  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return {
      error: "Session not found",
    };
  }
  const { user } = await lucia.validateSession(sessionId);
  if (!user) {
    return {
      error: "User not found",
    };
  }

  const folder = await db.folder.create({
    data: {
      name: formData.name,
      description: formData.description,
      tags: formData.tags?.map((tag) => tag.value),
      folderView: formData.folderView as FolderView,
      ownerId: user.id,
      storyId,
    },
  });

  const story = await db.story.findUnique({
    where: {
      id: storyId,
    },
  });

  if (!story) {
    return {
      error: "Story not found, failed to create folder",
    };
  }

  if (!folder) {
    return {
      error: "Failed to create folder",
    };
  }

  return redirect(`/stories/${story?.title}/${folder.name}`);
}
