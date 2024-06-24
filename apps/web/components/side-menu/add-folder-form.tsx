"use client";

import { useForm } from "react-hook-form";
import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { type FormResponse } from "@/types";
import { createFolder } from "@/app/(main)/stories/actions/create-folder";
import { createFolderSchema } from "@/schemas";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";

export function AddFolderForm(): JSX.Element {
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<z.infer<typeof createFolderSchema>>({
    resolver: zodResolver(createFolderSchema),
  });

  const [state, formAction] = useFormState<FormResponse, FormData>(
    createFolder,
    null
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
