import * as React from "react";

interface EmailTemplateProps {
  code: string;
  email: string;
}

export function VerifyUserEmailTemplate({
  code,
  email,
}: Readonly<EmailTemplateProps>): React.JSX.Element {
  return (
  <div>
    <h1>Welcome, {code}!</h1>

    <a href={`http://localhost:3000/verify-email?code=${code}&email=${email}`}>
      Verify email
    </a>
  </div>
  );
}
