import { github } from "@/lib/auth";
import { generateState } from "arctic";
import { serializeCookie } from "oslo/cookie";

export async function GET(request: Request) {
  const state = generateState();
  const url = await github.createAuthorizationURL(state);
  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
      "Set-Cookie": serializeCookie("github_oauth_state", state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 10,
        path: "/",
      }),
    },
  });
}
