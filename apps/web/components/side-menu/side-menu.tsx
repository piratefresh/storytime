"use server";

import Link from "next/link";
import { type User } from "lucia";
import { CreateStoryForm } from "@/app/(main)/stories/create/components/create-story-form";
import { db } from "@/lib/db";
import { type StoryWithFolder } from "@/app/(main)/stories/[title]/page";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { type Folder, TreeView } from "../tree-view/tree-view";
import { AddFolderForm } from "./add-folder-form";

interface SideMenuProps {
  user: User | null;
}

function constructFolderStructure(stories: StoryWithFolder[]): Folder {
  const allFolders = stories.flatMap((story) => story.folder);

  // Function to build folder and file hierarchy
  const buildHierarchy = (
    parentId: string | null,
    storyId: string
  ): (Folder | File)[] => {
    const childFolders = allFolders
      .filter(
        (folder) => folder.parentId === parentId && folder.storyId === storyId
      )
      .map((folder) => {
        return {
          ...folder,
          id: folder.id,
          metadata: {
            storyId,
            isRoot: false,
            type: "folder",
          },
          children: buildHierarchy(folder.id, storyId).concat(
            (folder.file || []).map((file) => ({
              ...file,
              metadata: {
                storyId,
                isRoot: false,
                type: "file",
              },
            }))
          ),
        };
      });

    return childFolders;
  };

  return {
    name: "Root",
    children: stories.map((story, index) => {
      return {
        name: story.title,
        children: [
          ...buildHierarchy(null, story.id), // Build hierarchy for root-level folders
          ...story.file
            .filter((file) => !file.folderId)
            .map((file) => ({
              // Filter and include only top-level files
              name: file.name,
              id: file.id,
              parentId: story.id,
              type: file.type,
              url: file.url,
              metadata: {
                storyId: story.id,
                type: "file",
              },
            })),
        ],
        metadata: {
          storyId: story.id,
          isRoot: true,
          type: "story",
        },
      };
    }),
  };
}

export async function SideMenu({ user }: SideMenuProps): Promise<JSX.Element> {
  const stories = await db.story.findMany({
    where: {
      ownerId: user?.id,
    },
    include: {
      folder: {
        include: {
          file: true,
        },
      },
      file: true,
    },
  });

  const treeData = constructFolderStructure(stories);

  return (
    <div className="min-h-screen min-w-80 bg-neutral-800 border border-border">
      <div className="flex gap-4 items-center justify-center">
        <AddFolderForm />
        <Button variant="ghost">
          <Icon name="FilePen" />
        </Button>
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
