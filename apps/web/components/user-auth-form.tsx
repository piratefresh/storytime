'use client';

import { login } from '@/app/(auth)/login/actions/login';
import { signup } from '@/app/(auth)/register/actions/signup';
import { userAuthSchema } from '@/app/schemas/user-auth-schema';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useFormState, useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { GithubLoginButton } from './github-login-button';
import { Button } from './ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import { TypographyP } from './ui/typography';

type FormData = z.infer<typeof userAuthSchema>;

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const form = useForm<FormData>({
    resolver: zodResolver(userAuthSchema),
  });

  const { errors } = form.formState;

  const onAction = async () => {
    const valid = await form.trigger();
    if (valid) {
      if (pathname === '/login') {
        const response = await login(form.getValues());
        form.setError('root.serverError', {
          type: `${response.error}`,
        });
      } else {
        const response = await signup(form.getValues());
        form.setError('root.serverError', {
          type: `${response.error}`,
        });
      }
    }
  };

  const [state, dispatch] = useFormState(onAction, undefined);

  return (
    <div className={cn('grid gap-6', className)} {...props}>
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
      <Link href={pathname === '/login' ? '/register' : '/login'}>
        <TypographyP>Create Account</TypographyP>
      </Link>
      <GithubLoginButton isLogin={pathname === '/login'} />
    </div>
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
