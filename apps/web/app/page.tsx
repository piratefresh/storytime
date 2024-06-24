import { FileTabs } from "@/components/file-tabs/file-tabs";
import { validateRequest } from "@/lib/auth";
import db from "@/lib/db";
import { isErrored } from "stream";

export default async function Page(): Promise<JSX.Element> {
  const { user } = await validateRequest();
  if (!user) {
    return <div>Unauthorized</div>;
  }

  return <FileTabs />;
}
