import { cache } from "react";
import { type Prisma } from "@repo/db";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { validateRequest } from "@/lib/auth";
import { GroupPanel } from "./components/group-panel";

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

export const getStory = cache(
  async ({
    title,
    userId,
  }: {
    title: string;
    userId: string;
  }): Promise<StoryWithFolder | null> => {
    const story = await db.story.findFirst({
      where: {
        ownerId: userId,
        title,
      },
      include: {
        folder: {
          include: {
            file: {
              orderBy: {
                name: "asc",
              },
            },
          },
          orderBy: {
            name: "asc",
          },
        },
      },
    });
    return story ?? null;
  }
);

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

  return <GroupPanel story={story} user={user} />;
}
