"use client";

import { useFormState, useFormStatus } from "react-dom";
import { login } from "@/app/(auth)/login/actions/login";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

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
    if (valid) {
      const response = await login(form.getValues());
      if (response.error) {
        form.setError("root.serverError", {
          type: `${response.error}`,
        });
      }
    }
  };

  const [state, dispatch] = useFormState(onAction, undefined);

  const { errors } = form.formState;

  return (
    <Form {...form}>
      <form action={dispatch} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" type="password" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormMessage>{errors.root?.serverError?.type}</FormMessage>

        <SubmitButton />
      </form>
    </Form>
  );
}

const SubmitButton = () => {
  const status = useFormStatus();

  return (
    <Button disabled={status.pending} type="submit">
      Submit
    </Button>
  );
};
