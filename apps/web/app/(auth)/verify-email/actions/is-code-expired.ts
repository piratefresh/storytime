import db from "@/lib/db";
import { isWithinExpirationDate } from "oslo";

export async function IsCodeExpired({ code }: { code: string }) {
  const databaseCode = await db.emailVerificationCode.findFirst({
    where: {
      code,
    },
  });

  if (!databaseCode || databaseCode.code !== code) {
    return {
      error: "Invalid verification code. Please try again.",
    };
  }

  if (!isWithinExpirationDate(databaseCode.expiresAt)) {
    return false;
  }

  return true;
}
