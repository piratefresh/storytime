"use server";

import { isWithinExpirationDate } from "oslo";
import { cookies } from "next/headers";
import type { User } from "lucia";
import { lucia } from "@/lib/auth";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import { ActionResult } from "@/lib/form";

interface FormData {
  code: string;
}

export async function emailVerification(
  formData: FormData
): Promise<ActionResult> {
  try {
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return {
        error: "Session not found",
      };
    }
    const { user } = await lucia.validateSession(sessionId);
    if (!user) {
      return {
        error: "User not found",
      };
    }

    const code = formData.code;
    if (typeof code !== "string") {
      return {
        error: "invalid code",
      };
    }

    const validCode = await verifyVerificationCode(user, code);
    if (!validCode) {
      return {
        error: "invalid code",
      };
    }

    await lucia.invalidateUserSessions(user.id);

    await db.user.update({
      data: {
        emailVerified: true,
      },
      where: {
        id: user.id,
      },
    });

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
    return redirect("/");
  } catch (error) {
    return {
      error: "An error occurred",
    };
  }
}

async function verifyVerificationCode(
  user: User,
  code: string
): Promise<boolean> {
  const databaseCode = await db.emailVerificationCode.findFirst({
    where: {
      code,
    },
  });

  if (!databaseCode || databaseCode.code !== code) {
    return false;
  }

  await db.emailVerificationCode.delete({
    where: {
      code,
      id: databaseCode.id,
    },
  });

  if (!isWithinExpirationDate(databaseCode.expiresAt)) {
    return false;
  }
  if (databaseCode.email !== user.email) {
    return false;
  }
  return true;
}
