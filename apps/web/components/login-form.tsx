"use client";

import { useFormState, useFormStatus } from "react-dom";
import { login } from "@/app/(auth)/login/actions/login";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { z } from "zod";

export const userAuthSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormData = z.infer<typeof userAuthSchema>;

export function LoginForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(userAuthSchema),
  });

  const onAction = async () => {
    const valid = await form.trigger();
    if (valid) login(form.getValues());
  };

  const [state, dispatch] = useFormState(onAction, null);

  const { errors } = form.formState;

  console.log("state: ", state);

  return (
    <form action={dispatch}>
      <input {...form.register("email")} />
      <p>{errors.email?.message}</p>

      <input {...form.register("password")} />
      <p>{errors.password?.message}</p>

      <Button />
    </form>
  );
}

const Button = () => {
  const status = useFormStatus();
  console.log("status: ", status);
  return (
    <button disabled={status.pending} type="submit">
      Submit
    </button>
  );
};
