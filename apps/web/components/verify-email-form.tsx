"use client";

import { emailVerification } from "@/app/(auth)/verify-email/actions/verify-email";
import { toast } from "sonner";

export function VerifyEmailForm({ code }: { code: string }) {
  const handleVerifyEmail = async () => {
    if (code) {
      const response = await emailVerification({ code: code as string });

      if (response)
        if (response.error) {
          toast.error(response.error);
        }
    }
  };
  return (
    <form>
      <button onClick={handleVerifyEmail}>Verify email</button>
    </form>
  );
}
