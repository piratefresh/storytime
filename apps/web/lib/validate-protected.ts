import { redirect } from "next/navigation";
import { validateRequest } from "./auth";

export const validateProtected = async ({
  redirectURL = "/login",
}: {
  redirectURL: string;
}) => {
  const req = await validateRequest();

  if (!req.session) {
    redirect(redirectURL);
  }
  return req;
};
