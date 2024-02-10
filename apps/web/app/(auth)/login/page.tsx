import { LoginForm } from "@/components/login-form";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function LoginPage() {
  const { user } = await validateRequest();
  if (user) {
    return redirect("/");
  }
  return (
    <div>
      <h1>Login</h1>
      <LoginForm />
    </div>
  );
}

export default LoginPage;
