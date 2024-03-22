import { z } from "zod";

export const ItemSchema = z.object({
  value: z.string(),
  label: z.string(),
});

export const formSchema = z.object({
  name: z.string().min(2, {
    message: "name must be at least 2 characters.",
  }),
  description: z
    .string()
    .min(2, { message: "title must be at least 2 characters." }),
  folderView: z.enum(["list", "grid"]),
  tags: z.array(ItemSchema).optional(),
});
