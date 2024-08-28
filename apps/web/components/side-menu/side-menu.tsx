"use server";

import Link from "next/link";
import { type User } from "lucia";
import { type Folder, type File as StoryFile } from "@repo/db";
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
import { TreeView } from "../tree-view/tree-view";
import { type TreeItemNode } from "../tree-view/tree-view";

interface SideMenuProps {
  user: User | null;
}

function constructFolderStructure(stories: StoryWithFolder[]): TreeItemNode {
  const allFolders = stories.flatMap((story) => story.folder);

  // Function to build folder and file hierarchy
  const buildHierarchy = (
    parentId: string | null,
    storyId: string,
    storyTitle: string
  ): (Folder | StoryFile)[] => {
    const childFolders = allFolders
      .filter(
        (folder) => folder.parentId === parentId && folder.storyId === storyId
      )
      .map((folder) => {
        const folderFiles: StoryFile[] = folder.file.map((file) => ({
          ...file,
          metadata: {
            storyId,
            storyTitle,
            isRoot: false,
            type: "file",
            content: file.content,
          },
          // Add missing properties to match File type
          description: null,
          tags: [],
          folderView: "list", // Or appropriate default value
          ownerId: folder.ownerId, // Assuming folder has ownerId
          parentId: folder.id,
        }));
        console.log("folderFiles: ", folderFiles);
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
                content: file.content,
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

export async function SideMenu({ user }: SideMenuProps): Promise<JSX.Element> {
  const stories = await db.story.findMany({
    where: {
      ownerId: user?.id,
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
      file: {
        orderBy: {
          name: "asc",
        },
      },
    },
    orderBy: {
      title: "asc",
    },
  });

  const treeData = constructFolderStructure(stories);
  console.log("treeData: ", treeData);
  return (
    <div className="min-h-screen min-w-80 bg-neutral-800 border border-border">
      <div className="flex gap-4 items-center justify-center">
        {/* <AddFolderForm /> */}
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
