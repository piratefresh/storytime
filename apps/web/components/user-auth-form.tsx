"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { TypographyP } from "./ui/typography";

export function UserAuthForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    const email = new FormData(e.currentTarget).get("email") as string;
    const { error: err } = await authClient.signIn.magicLink({
      email,
      callbackURL: "/stories",
    });
    if (err) {
      setError(err.message ?? "Could not send the sign-in link");
      setStatus("idle");
    } else setStatus("sent");
  };

  if (status === "sent")
    return <TypographyP>Check your email for a sign-in link.</TypographyP>;

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={(e) => void onSubmit(e)} className="flex flex-col gap-4">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <Button disabled={status === "sending"} type="submit">
          Email me a sign-in link
        </Button>
      </form>
      <Button
        variant="outline"
        type="button"
        onClick={() =>
          void authClient.signIn.social({
            provider: "google",
            callbackURL: "/stories",
          })
        }
      >
        Continue with Google
      </Button>
    </div>
  );
}
