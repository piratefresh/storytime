"use client";

import { resendVerificationCode } from "@/app/(auth)/verify-email/actions/resend-verification-code";

export function ResendVerificationForm({ email }: { email: string }) {
  const handleResendVerificationEmail = () => {
    void resendVerificationCode({ email });
  };
  return (
    <div>
      <h1>Resend Verification</h1>

      <button type="button" onClick={handleResendVerificationEmail}>Resend</button>
    </div>
  );
}
