import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export interface ContextMenuProps {
  id: string;
  top: number | false;
  left: number | false;
  right: number | false;
  bottom: number | false;
  open: boolean;
  onClick?: () => void;
  onAddFolder: (folderId: string) => Promise<void>;
  onAddFile: (parentId: string) => Promise<void>;
  data?: {
    label: string;
    folderId?: string;
    parentId?: string;
    type?: "file" | "folder" | "story";
    id: string;
  };
}

export default function ContextMenu({
  id,
  top,
  left,
  right,
  bottom,
  open,
  onAddFile,
  onAddFolder,
  data,
}: ContextMenuProps): JSX.Element {
  return (
    <DropdownMenu defaultOpen open={open} modal={false}>
      <DropdownMenuContent
        style={{
          top: top !== false ? top : undefined,
          left: left !== false ? left : undefined,
          right: right !== false ? right : undefined,
          bottom: bottom !== false ? bottom : undefined,
        }}
        className="absolute"
        usePortal={false}
      >
        <DropdownMenuItem
          onClick={() => {
            if (data?.type === "file" && data.folderId) {
              return void onAddFolder(data.folderId);
            } else if (data?.type === "folder" && data.id) {
              return void onAddFolder(data.id);
            }

            return void onAddFolder();
          }}
        >
          Add Folder
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            if (data?.type === "file" && data.folderId) {
              return void onAddFile(data.folderId);
            } else if (data?.type === "folder" && data.id) {
              return void onAddFile(data.id);
            }

            return void onAddFile();
          }}
        >
          Add File
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
