"use server";

import db from "@/lib/db";
import { sendEmailVerificationCode } from "../../register/actions/signup";
import { generateEmailVerificationCode } from "@/lib/auth";

export async function resendVerificationCode({ email }: { email: string }) {
  let user = await db.user.findFirst({
    where: {
      email,
    },
  });

  if (!user) {
    return {
      error: "Email not found",
    };
  }

  if (user.emailVerified) {
    return {
      error: "Email already verified",
    };
  }

  await db.emailVerificationCode.deleteMany({
    where: {
      userId: user.id,
    },
  });

  const code = await generateEmailVerificationCode(user.id, email);
  await sendEmailVerificationCode({ email, code });

  return {
    data: "verification code sent",
  };
}
