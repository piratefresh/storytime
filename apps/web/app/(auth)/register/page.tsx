import {
  TypographyP,
  TypographyH1,
  TypographyH2,
} from "@/components/ui/typography";
import { UserAuthForm } from "@/components/user-auth-form";

function RegisterPage(): JSX.Element {
  return (
    <div className="grid place-content-center w-full min-h-screen">
      <div className="flex flex-col gap-4">
        <TypographyH1>Storytime</TypographyH1>
        <TypographyP>Create stories</TypographyP>
        <TypographyH2>Register</TypographyH2>
        <UserAuthForm />
      </div>
    </div>
  );
}

export default RegisterPage;
