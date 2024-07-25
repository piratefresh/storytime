import { cache } from "react";
import { type Prisma } from "@repo/db";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import { validateRequest } from "@/lib/auth";
import Flow from "@/components/graph-view/graph-view";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { StoryEditor } from "./components/story-editor";
import { FileTab } from "@/components/file-tabs/file-tab";
import { FileTabs } from "@/components/file-tabs/file-tabs";

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
}): Promise<JSX.Element> {
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
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel>
        <FileTabs user={user} story={story} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
