"use client";

import { TreeView } from "@/components/tree-view/tree-view";
import { Folder, Story } from "@repo/db";
import { createFolder } from "../../actions/create-folder";
import { useTransition } from "react";
import { revalidatePath } from "next/cache";

// Function to recursively construct the folder structure from your story payload
function constructFolderStructure(
  folders: any[],
  parentId: string | null = null
): Folder[] {
  return folders
    .filter((folder) => folder.parentId === parentId)
    .map((folder) => ({
      id: folder.id,
      parentId: folder.parentId,
      name: folder.name,
      description: folder.description,
      children: constructFolderStructure(folders, folder.id),
    }));
}

export function AssetListView({ story }: { story: Story }) {
  const [pending, startTransition] = useTransition();
  const folders: Folder = {
    name: "",
    children: constructFolderStructure(story.folder),
  };

  const contextMenuItems = [
    {
      label: "New Folder",
      onClick: (info) => {
        startTransition(async () => {
          console.log("info: ", info);
          await createFolder({
            storyId: story.id,
            parentId: info.id,
          });
        });
      },
    },
  ];

  const handleDoubleClick = (info: any) => {
    console.log("renaming: ", info);
  };

  return (
    <TreeView
      folder={folders}
      contextMenuItems={contextMenuItems}
      onDoubleClick={handleDoubleClick}
    />
  );
}
