"use server";

import { redirect } from "next/navigation";
import { type z } from "zod";
import { db, entity } from "@repo/db";
import { formSchema } from "@/app/schemas/create-asset-schema";
import { validateRequest } from "@/lib/auth";
import { assertOwnsProject } from "@/lib/stories";
import { type ActionResult } from "@/lib/form";

type FormData = z.infer<typeof formSchema>;

// Assets became entities (STO-1072). Tags and folder placement have no home there yet.
export async function createAsset({
  formData,
  storyId,
}: {
  formData: FormData;
  storyId: string;
}): Promise<ActionResult> {
  if (!formSchema.safeParse(formData).success) {
    return { error: "Submitted data is invalid. Failed to create asset." };
  }

  const { user } = await validateRequest();
  if (!user) return { error: "User not found" };
  const story = await assertOwnsProject(storyId, user.id);

  await db.insert(entity).values({
    projectId: story.id,
    type: formData.type,
    name: formData.name,
    description: [formData.description, formData.content]
      .filter(Boolean)
      .join("\n\n"),
  });

  return redirect(`/stories/${story.title}`);
}
