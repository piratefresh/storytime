"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { and, db, eq, project } from "@repo/db";
import { validateRequest } from "@/lib/auth";
import { type ActionResult } from "@/lib/form";

const storySchema = z.object({
  title: z.string(),
  description: z.string().min(2),
  genre: z.array(z.string()),
  content: z.string(),
});
type FormData = z.infer<typeof storySchema>;

export async function createStory(formData: FormData): Promise<ActionResult> {
  if (!storySchema.safeParse(formData).success) {
    return { error: "Missing fields. Failed to create story." };
  }

  const { user } = await validateRequest();
  if (!user) return { error: "User not found" };

  const [existing] = await db
    .select({ id: project.id })
    .from(project)
    .where(
      and(eq(project.ownerId, user.id), eq(project.title, formData.title)),
    );
  if (existing) {
    return {
      error:
        "You already have a story with this title. Please choose a different title.",
    };
  }

  const [story] = await db
    .insert(project)
    .values({
      title: formData.title,
      description: formData.description,
      genre: formData.genre,
      ownerId: user.id,
    })
    .returning();
  if (!story) throw new Error("Insert returned no row");

  return redirect(`/stories/${story.title}`);
}
