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
import { User } from "lucia";
import { Textarea } from "@/components/ui/textarea";

import React from "react";
import { FancyMultiSelect, Item } from "@/components/ui/fancy-box";
import { formSchema } from "@/app/schemas/create-asset-schema";
import { createAsset } from "../actions/create-asset";
import Tiptap from "@/components/tiptap/tiptap";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Folder } from "@repo/db";
import { useSearchParams } from "next/navigation";

const FRAMEWORKS = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
  {
    value: "wordpress",
    label: "WordPress",
  },
  {
    value: "express.js",
    label: "Express.js",
  },
  {
    value: "nest.js",
    label: "Nest.js",
  },
] satisfies Item[];

export function CreateAssetForm({
  user,
  id,
  folders,
}: {
  user: User | null;
  id: string;
  folders: Folder[];
}) {
  const searchParams = useSearchParams();

  const folderId = searchParams.get("folderId");
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      content: "",
      description: "",
      type: "note",
      tags: [],
    },
  });

  const { errors } = form.formState;

  const onAction = async () => {
    const valid = await form.trigger();
    if (valid) {
      const response = await createAsset({
        formData: form.getValues(),
        storyId: id,
      });

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
        <TypographyH1>Create an Assets</TypographyH1>
        <FormField
          control={form.control}
          name="folderId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Folder</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  value={folderId ?? field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a folder to save too" />
                  </SelectTrigger>
                  <SelectContent>
                    {folders?.map((folder) => (
                      <SelectItem value={folder.id} key={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>Title of the folder.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="A great story title" {...field} />
              </FormControl>
              <FormDescription>Title of the folder.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Tiptap user={user} contentId={id} {...field} />
              </FormControl>
              <FormDescription>
                Default view between list and grid.
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
                  placeholder="A short description of the story"
                  {...field}
                />
              </FormControl>
              <FormDescription>Description of the folder.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <FancyMultiSelect
                  value={field?.value ?? []}
                  onChange={field.onChange}
                  placeholder="Press enter to add a tag"
                  items={FRAMEWORKS}
                />
              </FormControl>
              <FormDescription>
                Default view between list and grid.
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
