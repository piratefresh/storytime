import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  TypographyP,
  TypographyH1,
  TypographyH2,
} from "@/components/ui/typography";
import { UserAuthForm } from "@/components/user-auth-form";

export async function LoginPage() {
  const { user } = await validateRequest();
  if (user) {
    return redirect("/");
  }
  return (
    <div className="grid place-content-center min-h-screen">
      <div className="flex flex-col gap-4">
        <TypographyH1>Storytime</TypographyH1>
        <TypographyP>Create stories</TypographyP>
        <TypographyH2>Login</TypographyH2>

        <UserAuthForm />
      </div>
    </div>
  );
}

export default LoginPage;
