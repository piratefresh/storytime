"use server";

import Link from "next/link";
import type { User } from "@/lib/auth";
import { CreateStoryForm } from "@/app/(main)/stories/create/components/create-story-form";
import { getStories, type StoryWithFolder } from "@/lib/stories";
import { LogoutForm } from "../logout-form";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { TreeView } from "../tree-view/tree-view";
import { type NodeMetadata, type TreeNodeData } from "../tree-view/tree-view";

interface SideMenuProps {
  user: User | null;
}

function constructFolderStructure(
  stories: StoryWithFolder[],
): TreeNodeData<NodeMetadata> {
  const allFolders = stories.flatMap((story) => story.folder);

  // Function to build folder and file hierarchy
  const buildHierarchy = (
    parentId: string | null,
    storyId: string,
    storyTitle: string,
  ): TreeNodeData<NodeMetadata>[] => {
    const childFolders = allFolders
      .filter(
        (folder) => folder.parentId === parentId && folder.storyId === storyId,
      )
      .map((folder) => {
        const folderFiles: TreeNodeData<NodeMetadata>[] = folder.file.map(
          (file) => ({
            id: file.id,
            name: file.name,
            metadata: {
              storyId,
              storyTitle,
              isRoot: false,
              type: "file",
              content: file.content as string | null, // jsonb holds a JSON string
            },
          }),
        );
        return {
          ...folder,
          id: folder.id,
          metadata: {
            storyId,
            storyTitle,
            isRoot: false,
            type: "folder" as const,
          },
          children: [
            ...buildHierarchy(folder.id, storyId, storyTitle),
            ...folderFiles,
          ],
        };
      });
    return childFolders;
  };

  return {
    id: "root",
    name: "Root",
    metadata: {
      storyId: "root",
      storyTitle: "root",
      type: "story" as const,
    },
    children: stories.map((story) => {
      return {
        name: story.title,
        id: story.id,
        children: [
          ...buildHierarchy(null, story.id, story.title), // Build hierarchy for root-level folders
          ...story.file
            .filter((file) => !file.folderId)
            .map((file) => ({
              // Filter and include only top-level files
              name: file.name,
              id: file.id,
              parentId: story.id,
              type: file.type,
              url: file.url,
              children: [],
              metadata: {
                storyId: story.id,
                storyTitle: story.title,
                type: "file" as const,
                content: file.content as string | null, // Json column holds a JSON string
              },
            })),
        ],
        metadata: {
          storyId: story.id,
          storyTitle: story.title,
          isRoot: true,
          type: "story" as const,
        },
      };
    }),
  };
}

export async function SideMenu({
  user,
}: SideMenuProps): Promise<React.JSX.Element> {
  const stories = user ? await getStories(user.id) : [];

  const treeData = constructFolderStructure(stories);
  return (
    <div className="min-h-screen min-w-80 bg-neutral-800 border border-border">
      <div className="flex gap-4 items-center justify-center">
        <Button variant="ghost">
          <Icon name="FilePen" />
        </Button>
        {user ? <LogoutForm /> : null}
      </div>
      <div className="flex flex-col justify-center">
        {user ? (
          <>
            {stories.length > 0 ? (
              <TreeView folder={treeData} />
            ) : (
              <>
                <p>You have no yet created a story</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Create Story</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create a Story</DialogTitle>

                      <CreateStoryForm />
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </>
        ) : (
          <>
            <p>Please login to create a story</p>
            <Link href="/login">
              <Button>Login Here</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
