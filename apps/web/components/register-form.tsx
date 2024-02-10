"use client";

import { signup } from "@/app/(auth)/register/actions/signup";
import { userAuthSchema } from "@/app/schemas/user-auth-schema";
import { Form } from "@/lib/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { z } from "zod";

type FormData = z.infer<typeof userAuthSchema>;

export function RegisterForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(userAuthSchema),
  });

  const { errors } = form.formState;

  const onAction = async () => {
    const valid = await form.trigger();
    if (valid) signup(form.getValues());
  };

  return (
    <form action={onAction}>
      <input {...form.register("email")} />
      <p>{errors.email?.message}</p>

      <input {...form.register("password")} />
      <p>{errors.password?.message}</p>

      <button type="submit">Submit</button>
    </form>
  );
}
