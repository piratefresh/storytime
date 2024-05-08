import { validateRequest } from "@/lib/auth";

export const UserInfo = async () => {
  const { user } = await validateRequest();

  return (
    <div>
      <h1>{user?.email}</h1>
    </div>
  );
};
