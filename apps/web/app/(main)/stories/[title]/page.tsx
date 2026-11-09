import { type Prisma } from "@repo/db";
import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth";
import { GroupPanel } from "./components/group-panel";
import { getStory } from "./get-story";

export type StoryWithFolder = Prisma.StoryGetPayload<{
  include: {
    folder: {
      include: {
        file: {
          orderBy: {
            name: "asc";
          };
        };
      };
      orderBy: {
        name: "asc";
      };
    };
    file: {
      orderBy: {
        name: "asc";
      };
    };
  };
}>;

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

  console.log("story: ", JSON.stringify(story));

  if (!story) {
    redirect("/stories");
  }

  return <GroupPanel story={story} user={user} />;
}
