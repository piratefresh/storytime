"use server";

import { lucia } from "@/lib/auth";
import db from "@/lib/db";
import { ActionResult } from "@/lib/form";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const storySchema = z.object({
  title: z.string(),
  description: z.string().min(2),
  genre: z.array(z.string()),
  content: z.string(),
});
type FormData = z.infer<typeof storySchema>;

export async function createStory(formData: FormData): Promise<ActionResult> {
  const validatedFields = storySchema.safeParse(formData);
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      error: "Missing Fields. Failed to Create Invoice.",
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

  // Check if a story with the same title already exists for the user
  const existingStory = await db.story.findFirst({
    where: {
      ownerId: user.id,
      title: formData.title,
    },
  });

  if (existingStory) {
    return {
      error:
        "You already have a story with this title. Please choose a different title.",
    };
  }

  const story = await db.story.create({
    data: {
      title: formData.title,
      description: formData.description,
      genre: formData.genre,
      ownerId: user.id,
      status: "PLANNING",
      content: formData.content,
    },
  });

  if (!story) {
    return {
      error: "Failed to create story",
    };
  }

  return redirect(`/stories/${story.title}`);
}
