import {
  TypographyH1,
  TypographyH2,
  TypographyP,
} from '@/components/ui/typography';
import { UserAuthForm } from '@/components/user-auth-form';

function LoginPage(): JSX.Element {
  return (
    <div className="grid place-content-center w-full min-h-screen">
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
