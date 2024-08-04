"use client";

import { useForm } from "react-hook-form";
import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { useParams } from "next/navigation";
import { createFolder } from "@/app/(main)/stories/actions/create-folder";
import { createFolderSchema } from "@/schemas";
import { useTabsStore } from "@/app/stores/tabs-provider";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";

export function AddFolderForm(): JSX.Element {
  const formRef = useRef<HTMLFormElement>(null);
  const params = useParams<{ title: string }>();

  const {
    formState: { errors },
    setError,
  } = useForm<z.infer<typeof createFolderSchema>>({
    resolver: zodResolver(createFolderSchema),
  });
  const activeGroupId = useTabsStore((state) => state.activeGroupId);
  const group = useTabsStore((state) =>
    state.groups.find((g) => g.id === activeGroupId)
  );

  if (!group) return null;

  const initialState = null;
  const [state, formAction, isPending] = useFormState(
    async (state: string | null, formData: FormData) => {
      if (params.title) {
        const activeTab = tabs.find((tab) => tab.id === activeTabId);
        console.log("activeTab: ", activeTab);
        if (activeTab) {
          formData.append("storyId", activeTab.storyId);
          if (!activeTab.isRoot) {
            formData.append("parentId", activeTab.id);
          }
        }
      }

      const result = await createFolder(null, formData);
    },
    initialState
  );

  useEffect(() => {
    if (!state) {
      return;
    }

    if (state.status === "error") {
      state.errors?.forEach((error) => {
        setError(error.path as keyof typeof errors, {
          message: error.message,
        });
      });
    }
  }, [setError, state]);

  return (
    <form action={formAction} ref={formRef}>
      <Button type="submit" variant="ghost">
        <Icon name="FolderPlus" />
      </Button>
    </form>
  );
}
