import { z } from "zod";

export const ItemSchema = z.object({
  value: z.string(),
  label: z.string(),
});

export const formSchema = z.object({
  name: z.string().min(2, {
    message: "name must be at least 2 characters.",
  }),
  content: z.string().min(2, {
    message: "content must be at least 2 characters.",
  }),
  description: z
    .string()
    .min(2, { message: "title must be at least 2 characters." })
    .optional(),
  type: z.string().min(2, { message: "type must be at least 2 characters." }),
  tags: z.array(ItemSchema).optional(),
  folderId: z.string().min(2, {
    message: "folderId must be at least 2 characters.",
  }),
});
