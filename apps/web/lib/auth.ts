import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins/magic-link";
import { headers } from "next/headers";
import { Resend } from "resend";
import { db, user, session, account, verification } from "@repo/db";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      enabled: Boolean(process.env.GOOGLE_CLIENT_ID),
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        if (!resend) {
          // Dev without RESEND_API_KEY: click the link from the server log.
          console.info(`[auth] magic link for ${email}: ${url}`);
          return;
        }
        const { error } = await resend.emails.send({
          from: process.env.EMAIL_FROM ?? "Storytime <onboarding@resend.dev>",
          to: email,
          subject: "Sign in to Storytime",
          html: `<p><a href="${url}">Sign in to Storytime</a></p><p>This link expires in 5 minutes. If you didn't ask for it, ignore this email.</p>`,
        });
        if (error) throw new Error(error.message);
      },
    }),
    nextCookies(), // must stay last
  ],
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;

export const validateRequest = async (): Promise<
  { user: User; session: Session } | { user: null; session: null }
> =>
  (await auth.api.getSession({ headers: await headers() })) ?? {
    user: null,
    session: null,
  };
