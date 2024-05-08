import { cache } from "react";
import db from "@/lib/db";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TypographyH2 } from "@/components/ui/typography";
import Link from "next/link";
import Flow from "@/components/graph-view/graph-view";
import { TreeView } from "@/components/tree-view/tree-view";
import { AssetListView } from "./components/AssetListView";

export const getStory = cache(
  async ({ title, userId }: { title: string; userId: string }) => {
    const item = await db.story.findFirst({
      where: {
        ownerId: userId,
        title,
      },
      include: {
        folder: true,
      },
    });
    return item;
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
    <div className="flex flex-col gap-8 align-end flex-1 min-h-screen">
      <div className="flex gap-4 justify-between items-center border-b">
        <TypographyH2 className="border-b">{story?.title}</TypographyH2>
        <div className="flex gap-4">
          <Link href={`/stories/${story?.title}/create/folder`}>
            <Button className="self-start">Create a Folder</Button>
          </Link>
          <Button className="self-start">Add an Asset</Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <p>{story?.description}</p>
      </div>

      {story?.folder?.length > 0 ? (
        <div>
          <TypographyH2>Folders</TypographyH2>
          <ul>
            {story?.folder.map((folder) => (
              <li key={folder.id}>{folder.name}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div>No Folders</div>
      )}
      <div className="flex flex-row gap-4 flex-1">
        <AssetListView story={story} />
        <Flow story={story} />
      </div>
    </div>
  );
}
