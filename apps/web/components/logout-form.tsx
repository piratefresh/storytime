import { logout } from "@/app/(auth)/logout/actions/logout";

export function LogoutForm() {
  return <form action={logout}>
    <button type="submit">Sign out</button>
  </form>
}
