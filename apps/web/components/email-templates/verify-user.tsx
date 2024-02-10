import * as React from "react";

interface EmailTemplateProps {
  code: string;
  email: string;
}

export const VerifyUserEmailTemplate: React.FC<
  Readonly<EmailTemplateProps>
> = ({ code, email }) => (
  <div>
    <h1>Welcome, {code}!</h1>

    <a href={`http://localhost:3000/verify-email?code=${code}&email=${email}`}>
      Verify email
    </a>
  </div>
);
