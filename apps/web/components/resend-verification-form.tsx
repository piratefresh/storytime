"use client";

import { resendVerificationCode } from "@/app/(auth)/verify-email/actions/resend-verification-code";

export function ResendVerificationForm({ email }: { email: string }) {
  const handleResendVerificationEmail = async () => {
    resendVerificationCode({ email: email as string });
  };
  return (
    <div>
      <h1>Resend Verification</h1>

      <button onClick={handleResendVerificationEmail}>Resend</button>
    </div>
  );
}
