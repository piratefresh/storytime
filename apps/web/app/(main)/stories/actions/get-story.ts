import db from '@/lib/db';
import { Prisma } from '@repo/db';
import { cache } from 'react';

export type StoryWithFolder = Prisma.StoryGetPayload<{
  include: {
    folder: {
      include: {
        file: {
          orderBy: {
            name: 'asc';
          };
        };
      };
      orderBy: {
        name: 'asc';
      };
    };
    file: {
      orderBy: {
        name: 'asc';
      };
    };
  };
}>;

export const getStory = cache(
  async ({ title, userId }: { title: string; userId: string }) => {
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
                name: 'asc',
              },
            },
          },
          orderBy: {
            name: 'asc',
          },
        },
        file: {
          orderBy: {
            name: 'asc',
          },
        },
      },
    });
    return story;
  },
);
