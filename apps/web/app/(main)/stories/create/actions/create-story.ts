"use server";

import { NextResponse } from "next/server";
import { z } from "zod";

const storySchema = z.object({
  title: z.string(),
  description: z.string().min(6),
  genre: z.array(z.string()),
});
type FormData = z.infer<typeof storySchema>;

export async function createStory(formData: FormData) {
  const validatedFields = storySchema.safeParse(formData);
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      error: "Missing Fields. Failed to Create Invoice.",
    };
  }

  const title = formData.title;
  const description = formData.description;
  const genre = formData.genre;

  console.log("formData: ", formData);
  return title;
}
