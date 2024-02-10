import { ResendVerificationForm } from "@/components/resend-verification-form";
import { VerifyEmailForm } from "@/components/verify-email-form";

function VerifyUserPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const code = searchParams?.code;
  const email = searchParams?.email;
  return (
    <div>
      <h1>Welcome, {code}!</h1>

      <VerifyEmailForm code={code as string} />
      {email ? <ResendVerificationForm email={email as string} /> : null}
    </div>
  );
}

export default VerifyUserPage;
