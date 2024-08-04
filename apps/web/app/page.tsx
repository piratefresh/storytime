import { FileTabs } from "@/components/file-tabs/file-tabs";
import { validateRequest } from "@/lib/auth";

export default async function Page(): Promise<JSX.Element> {
  const { user } = await validateRequest();
  if (!user) {
    return <div>Unauthorized</div>;
  }

  return (
    // <TestEditor />
    <FileTabs user={user} tabs={[]} />
  );
}
