import { cache } from "react";
import db from "@/lib/db";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import Flow from "@/components/graph-view/graph-view";
import { Prisma } from "@repo/db";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { StoryEditor } from "./components/story-editor";

export type StoryWithFolder = Prisma.StoryGetPayload<{
  include: { folder: true; file: true };
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
        folder: true,
        file: true,
      },
    });
    return story || null;
  }
);

export default async function StoryPage({
  params: { title },
}: {
  params: { title: string };
}) {
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
    <div className="grid align-end flex-1 min-h-screen max-h-screen overflow-y-auto">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel>
          <StoryEditor
            storyId={story?.id}
            user={user}
            content={story.content}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel>
          <Flow story={story} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
