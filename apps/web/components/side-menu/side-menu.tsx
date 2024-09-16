"use server";

import Link from "next/link";
import { StoryWithFolder } from "@/app/(main)/stories/actions/get-story";
import { CreateStoryForm } from "@/app/(main)/stories/create/components/create-story-form";
import { db } from "@/lib/db";
import { User, type Folder, type File as StoryFile } from "@repo/db";

import { NodeMetadata, TreeNodeData, TreeView } from "../tree-view/tree-view";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Icon } from "../ui/icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ToCTab } from "./components/toc-tab";

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
  ): (Folder | StoryFile)[] => {
    const childFolders = allFolders
      .filter(
        (folder) => folder.parentId === parentId && folder.storyId === storyId,
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
    //@ts-expect-error - Need to fix the type of children
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

  return (
    <div className="min-h-screen min-w-80 border border-border bg-neutral-800">
      <div className="flex items-center justify-center gap-4">
        <Button variant="ghost">
          <Icon name="FilePen" />
        </Button>
        <Button variant="ghost">
          <Icon name="PanelLeft" />
        </Button>
      </div>
      <div className="flex flex-col justify-center">
        {user ? (
          <>
            {stories.length > 0 ? (
              <Tabs defaultValue="explorer">
                <TabsList>
                  <TabsTrigger value="explorer">
                    <Icon name="Globe" />
                  </TabsTrigger>
                  <TabsTrigger value="table-of-contents">
                    <Icon name="List" />
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="explorer">
                  <TreeView folder={treeData} />
                </TabsContent>
                <TabsContent value="table-of-contents">
                  <ToCTab />
                </TabsContent>
              </Tabs>
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
