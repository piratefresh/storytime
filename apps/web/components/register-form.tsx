"use client";

import { signup } from "@/app/(auth)/register/actions/signup";
import { userAuthSchema } from "@/app/schemas/user-auth-schema";
import { useFormState } from "react-dom";
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

type FormData = z.infer<typeof userAuthSchema>;

export function RegisterForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(userAuthSchema),
  });

  const { errors } = form.formState;

  const onAction = async () => {
    const valid = await form.trigger();
    if (valid) {
      const response = await signup(form.getValues());
      form.setError("root.serverError", {
        type: `${response.error}`,
      });
    }
  };

  const [state, dispatch] = useFormState(onAction, undefined);

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
              {/* <FormDescription>
            This is your public display name.
          </FormDescription> */}
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
              {/* <FormDescription>
            This is your public display name.
          </FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* <input {...form.register("password")} />
        <p>{errors.password?.message}</p> */}

        <FormMessage>{errors.root?.serverError?.type}</FormMessage>

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
