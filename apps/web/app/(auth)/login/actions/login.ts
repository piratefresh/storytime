"use server";

import { cookies } from "next/headers";
import { lucia } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Scrypt } from "lucia";
import { db } from "@/lib/db";

import { z } from "zod";
import { userAuthSchema } from "@/app/schemas/user-auth-schema";

type FormData = z.infer<typeof userAuthSchema>;

export async function login(formData: FormData) {
  const validatedFields = userAuthSchema.safeParse(formData);
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      error: "Missing Fields. Failed to Create Invoice.",
    };
  }
  const email = formData.email;
  const password = formData.password;

  const existingUser = await db.user.findFirst({
    where: {
      email,
    },
  });

  if (!existingUser) {
    // NOTE:
    // Returning immediately allows malicious actors to figure out valid usernames from response times,
    // allowing them to only focus on guessing passwords in brute-force attacks.
    // As a preventive measure, you may want to hash passwords even for invalid usernames.
    // However, valid usernames can be already be revealed with the signup page among other methods.
    // It will also be much more resource intensive.
    // Since protecting against this is none-trivial,
    // it is crucial your implementation is protected against brute-force attacks with login throttling etc.
    // If usernames are public, you may outright tell the user that the username is invalid.
    return {
      error: "Incorrect username or password",
    };
  }

  const scrypt = new Scrypt();

  const validPassword = await scrypt.verify(
    existingUser.hashedPassword,
    password
  );

  if (!validPassword) {
    return {
      error: "Incorrect username or password",
    };
  }

  const session = await lucia.createSession(existingUser.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
  return redirect("/");
}
