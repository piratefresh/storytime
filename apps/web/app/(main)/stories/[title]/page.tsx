import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth";
import { getStory } from "@/lib/stories";
import { GroupPanel } from "./components/group-panel";

export default async function StoryPage({
  params,
}: {
  params: Promise<{ title: string }>;
}): Promise<React.JSX.Element | null> {
  const { title } = await params;
  const { user } = await validateRequest();

  if (!user) {
    redirect("/stories");
  }

  const story = await getStory(user.id, decodeURIComponent(title));

  if (!story) {
    redirect("/stories");
  }

  return <GroupPanel story={story} user={user} />;
}
