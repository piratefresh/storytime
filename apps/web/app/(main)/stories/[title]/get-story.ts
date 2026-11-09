import { cache } from "react";
import { db } from "@/lib/db";
import { type StoryWithFolder } from "./page";

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
