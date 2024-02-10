import { RegisterForm } from "@/components/register-form";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";

async function RegisterPage() {
  const { user } = await validateRequest();
  if (user) {
    return redirect("/");
  }
  return (
    <div>
      <h1>Register</h1>
      <RegisterForm />
    </div>
  );
}

export default RegisterPage;
