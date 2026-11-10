"use server";

import { redirect } from "next/navigation";
import { type z } from "zod";
import { db, outlineNode } from "@repo/db";
import { formSchema } from "@/app/schemas/create-folder-schema";
import { validateRequest } from "@/lib/auth";
import { assertOwnsProject } from "@/lib/stories";
import { type ActionResult } from "@/lib/form";

type FormData = z.infer<typeof formSchema>;

export async function createFolder({
  formData,
  storyId,
}: {
  formData: FormData;
  storyId: string;
}): Promise<ActionResult> {
  if (!formSchema.safeParse(formData).success) {
    return { error: "Submitted data is invalid. Failed to create folder." };
  }

  const { user } = await validateRequest();
  if (!user) return { error: "User not found" };
  const story = await assertOwnsProject(storyId, user.id);

  const [folder] = await db
    .insert(outlineNode)
    .values({ projectId: story.id, kind: "act", title: formData.name })
    .returning();
  if (!folder) throw new Error("Insert returned no row");

  return redirect(`/stories/${story.title}/folder/${folder.title}`);
}
