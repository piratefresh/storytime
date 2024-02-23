"use client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { TypographyH1 } from "@/components/ui/typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@react-email/components";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "./ui/input";
import { useFormState, useFormStatus } from "react-dom";
import Tiptap from "./tiptap/tiptap";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "title must be at least 2 characters.",
  }),
  description: z
    .string()
    .min(2, { message: "title must be at least 2 characters." }),
  genre: z.array(z.string()),
});

export function CreateStoryForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      genre: [],
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  const { errors } = form.formState;

  const onAction = async () => {
    const valid = await form.trigger();
    if (valid) {
      const response = await createStory(form.getValues());
      form.setError("root.serverError", {
        type: `${response.error}`,
      });
    }
  };

  const [state, dispatch] = useFormState(onAction, undefined);
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <TypographyH1>Create a Story</TypographyH1>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="genre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Genre</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <h2>Test</h2>

        <Tiptap />
        <SubmitButton />
      </form>
    </Form>
  );
}

const SubmitButton = () => {
  const status = useFormStatus();

  return (
    <Button disabled={status.pending} type="submit">
      Submit
    </Button>
  );
};
