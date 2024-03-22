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
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { useFormState, useFormStatus } from "react-dom";
import { createStory } from "@/app/(main)/stories/create/actions/create-story";
import { User } from "lucia";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "@/components/ui/multiselect";
import { Genres } from "@/app/constants/genres";

import React from "react";
import * as Popover from "@radix-ui/react-popover";
import { MixerHorizontalIcon, Cross2Icon } from "@radix-ui/react-icons";

const genreOptions = Object.entries(Genres).map(([key, value]) => ({
  value,
  label: value,
}));

const formSchema = z.object({
  title: z.string().min(2, {
    message: "title must be at least 2 characters.",
  }),
  description: z
    .string()
    .min(2, { message: "title must be at least 2 characters." }),
  genre: z.array(z.string()),
});

export function CreateStoryForm({ user }: { user: User | null }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      genre: [],
    },
  });

  const { errors } = form.formState;

  const onAction = async () => {
    const valid = await form.trigger();
    if (valid) {
      const response = await createStory(form.getValues());
      console.log("response: ", response);
      if (response.error) {
        form.setError("root.serverError", {
          type: `${response.error}`,
        });
      }

      if (response) {
      }
    }
  };

  const [state, dispatch] = useFormState(onAction, undefined);
  return (
    <Form {...form}>
      <form action={dispatch} className="space-y-8 w-full max-w-screen-md">
        <TypographyH1>Create a Story</TypographyH1>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="A great story title" {...field} />
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
                <Textarea
                  className="min-h-[30dvh]"
                  placeholder="A short description of the story"
                  {...field}
                />
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
                <MultiSelect
                  selected={field.value}
                  options={genreOptions}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <SubmitButton />
      </form>
      {/* <DevTool control={form.control} /> */}
    </Form>
  );
}

const SubmitButton = () => {
  const status = useFormStatus();

  return (
    <Button type="submit" disabled={status.pending}>
      Submit
    </Button>
  );
};
