import { logout } from "@/app/(auth)/logout/actions/logout";

export const LogoutForm = () => (
  <form action={logout}>
    <button>Sign out</button>
  </form>
);
