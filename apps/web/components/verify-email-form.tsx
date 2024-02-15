"use client";

import { emailVerification } from "@/app/(auth)/verify-email/actions/verify-email";
import { useFormState, useFormStatus } from "react-dom";
import { toast } from "sonner";

export function VerifyEmailForm({ code }: { code: string }) {
  const onAction = async () => {
    if (code) {
      const response = await emailVerification({ code: code as string });

      if (response) {
        if (response.error) {
          toast.error(response.error);
        }
      }
    }
  };

  const [state, dispatch] = useFormState(onAction, undefined);

  return (
    <form action={dispatch}>
      <SubmitButton />
    </form>
  );
}

const SubmitButton = () => {
  const status = useFormStatus();

  return (
    <button disabled={status.pending} type="submit">
      Verify Email
    </button>
  );
};
