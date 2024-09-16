'use server';

import { lucia, validateRequest } from '@/lib/auth';
import { type ActionResult } from 'next/dist/server/app-render/types';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function logout(): Promise<ActionResult> {
  const { session } = await validateRequest();
  if (!session) {
    return {
      error: 'Unauthorized',
    };
  }

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return redirect('/login');
}
