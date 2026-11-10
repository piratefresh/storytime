"use server";
import { type z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { generateId, Scrypt } from "lucia";
import { Resend } from "resend";
import { db } from "@/lib/db";
import { generateEmailVerificationCode, lucia } from "@/lib/auth";
import { VerifyUserEmailTemplate } from "@/components/email-templates/verify-user";
import { type userAuthSchema } from "@/app/schemas/user-auth-schema";

type FormData = z.infer<typeof userAuthSchema>;

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmailVerificationCode({
  email,
  code,
}: {
  email: string;
  code: string;
}) {
  try {
    console.log("sending email");
    const { data, error } = await resend.emails.send({
      from: "Magnus <onboarding@resend.dev>",
      to: [email],
      subject: "Hello world",
      react: VerifyUserEmailTemplate({
        code,
        email,
      }) as React.ReactElement,
    });

    if (error) {
      return Response.json({ error });
    }

    return Response.json({ data });
  } catch (error) {
    return Response.json({ error });
  }
}

export async function signup(data: FormData) {
  const email = data.email;
  const password = data.password;

  const scrypt = new Scrypt();
  const hashedPassword = await scrypt.hash(password);

  const userId = generateId(15);

  const user = await db.user.findFirst({
    where: {
      email,
    },
  });

  if (user) {
    return {
      error: "Email already in use",
    };
  }
  await db.user.create({
    data: {
      id: userId,
      email,
      hashedPassword,
    },
  });

  const code = await generateEmailVerificationCode(userId, email);
  await sendEmailVerificationCode({ email, code });
  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  (await cookies()).set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
  return redirect("/");
}
