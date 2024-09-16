import { type Session, type User } from 'lucia';
import { redirect } from 'next/navigation';

import { validateRequest } from './auth';

export const validateProtected = async ({
  redirectURL = '/login',
}: {
  redirectURL: string;
}): Promise<{ user: User; session: Session }> => {
  const req = await validateRequest();

  if (!req.session) {
    redirect(redirectURL);
  }
  // @ts-expect-error - fix later
  return req;
};
