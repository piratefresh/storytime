"use server";

import { formSchema } from "@/app/schemas/create-asset-schema";
import { lucia } from "@/lib/auth";
import db from "@/lib/db";
import { ActionResult } from "@/lib/form";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

type FormData = z.infer<typeof formSchema>;

export async function createAsset({
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

  const asset = await db.asset.create({
    data: {
      content: formData.content,
      description: formData.description,
      name: formData.name,
      type: "note",
      tags: formData?.tags?.map((tag) => tag.value) ?? [],
      folderId: formData.folderId,
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

  if (!asset) {
    return {
      error: "Failed to create asset",
    };
  }

  return redirect(`/stories/${story?.title}`);
}
