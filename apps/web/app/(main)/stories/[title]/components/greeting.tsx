import { api } from "@/trpc/react";

export function ClientGreeting() {
  const greeting = api.hello.useQuery({ text: "world" });
  if (!greeting.data) return <div>Loading...</div>;
  return <div>{greeting.data.greeting}</div>;
}
