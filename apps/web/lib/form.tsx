"use client";

import { useFormState } from "react-dom";

export function Form({
  children,
  action,
  onSubmit,
}: {
  children: React.ReactNode;
  action: (prevState: ActionResult, formData: FormData) => Promise<ActionResult>;
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
}) {
  const [state, formAction] = useFormState(action, {
    error: null,
  });
  return (
    <form action={formAction} onSubmit={onSubmit}>
      {children}
      <p>{state.error}</p>
    </form>
  );
}

export interface ActionResult {
  error: string | null;
}
