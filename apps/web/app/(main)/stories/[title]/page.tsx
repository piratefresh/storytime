import { redirect } from "next/navigation";
import { EditorProvider } from "@/components/editor-provider";
import { SideMenu } from "@/components/side-menu";
import { validateRequest } from "@/lib/auth";

import { getStory } from "../actions/get-story";
import { GroupPanel } from "./components/group-panel";

export default async function StoryPage({
  params: { title },
}: {
  params: { title: string };
}): Promise<JSX.Element | null> {
  const { user } = await validateRequest();

  if (!user) {
    redirect("/stories");
  }

  const story = await getStory({
    title: decodeURIComponent(title),
    userId: user.id,
  });

  if (!story) {
    redirect("/stories");
  }

  return (
    <EditorProvider>
      <SideMenu user={user} />
      <GroupPanel story={story} user={user} />
    </EditorProvider>
  );
}
