import { ResendVerificationForm } from "@/components/resend-verification-form";
import { VerifyEmailForm } from "@/components/verify-email-form";

async function VerifyUserPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { code, email } = await searchParams;
  return (
    <div className="bg-background">
      <h1>Welcome, {code}!</h1>

      <VerifyEmailForm code={code as string} />
      {email ? <ResendVerificationForm email={email as string} /> : null}
    </div>
  );
}

export default VerifyUserPage;
