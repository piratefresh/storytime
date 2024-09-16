import { FileTabs } from "@/components/file-tabs/file-tabs";
import { SideMenu } from "@/components/side-menu";
import { validateRequest } from "@/lib/auth";

export default async function Page(): Promise<JSX.Element> {
  const { user } = await validateRequest();
  if (!user) {
    return <div>Unauthorized</div>;
  }

  return (
    <>
      <SideMenu user={user} />
      {/* @ts-expect-error - fix later */}
      <FileTabs user={user} tabs={[]} />
    </>
  );
}
