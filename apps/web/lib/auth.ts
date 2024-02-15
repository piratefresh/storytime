import { Lucia } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import type { Session, User } from "lucia";
import { cookies } from "next/headers";
import { cache } from "react";
import { db } from "./db";
import { TimeSpan, createDate } from "oslo";
import { generateRandomString, alphabet } from "oslo/crypto";
import { GitHub, Google } from "arctic";

const adapter = new PrismaAdapter(db.session, db.user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      // attributes has the type of DatabaseUserAttributes
      username: attributes.username,
      emailVerified: attributes.emailVerified,
      email: attributes.email,
      providerId: attributes.providerId,
      providerUserId: attributes.providerUserId,
    };
  },
});

export const github = new GitHub(
  process.env.GITHUB_CLIENT_ID!,
  process.env.GITHUB_SECRET!
);

export const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_SECRET!,
  process.env.GOOGLE_REDIRECT_URI!
);

export const validateRequest = cache(
  async (): Promise<
    { user: User; session: Session } | { user: null; session: null }
  > => {
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return {
        user: null,
        session: null,
      };
    }

    const result = await lucia.validateSession(sessionId);
    // next.js throws when you attempt to set cookie when rendering page
    try {
      if (result.session && result.session.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id);
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
    } catch {}
    return result;
  }
);

export async function generateEmailVerificationCode(
  userId: string,
  email: string
): Promise<string> {
  db.emailVerificationCode.deleteMany({
    where: {
      userId,
    },
  });

  const code = generateRandomString(8, alphabet("0-9"));
  await db.emailVerificationCode.create({
    data: {
      userId,
      email,
      code,
      expiresAt: createDate(new TimeSpan(5, "m")), // 5 minutes
    },
  });

  return code;
}

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  username: string;
  email: string;
  emailVerified: boolean;
  providerId: string;
  providerUserId: string;
}
