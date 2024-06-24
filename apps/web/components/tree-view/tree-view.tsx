"use client";

import { forwardRef, startTransition, useCallback, useState } from "react";
import TreeViewPrimitive, {
  type EventCallback,
  flattenTree,
  type IBranchProps,
  type INode,
  type INodeRendererProps,
  type LeafProps,
} from "react-accessible-treeview";
import { ChevronDown, ChevronRight } from "lucide-react";
import { type Folder } from "@repo/db";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import { createFolder } from "@/app/(main)/stories/actions/create-folder";
import { rename } from "@/app/(main)/stories/actions/rename";
import { createFile } from "@/app/(main)/stories/actions/create-file";
import { Input } from "../ui/input";

export interface Node {
  name?: string;
  metadata?: Record<string, string | number>;
  children?: Node[];
  parent?: string;
  id?: string;
}

interface ContextMenuItems {
  label: string;
  onClick: (info: Node) => void;
}

export interface TreeViewProps extends React.ComponentPropsWithoutRef<"div"> {
  folder: Node;
  contextMenuItems: ContextMenuItems[];
  onDoubleClick: (info: Node) => void;
}

function TreeNode({
  getNodeProps,
  element,
  level,
  isExpanded,
  isBranch,
  isSelected = false,
  onDoubleClick,
}: {
  getNodeProps: (args?: {
    onClick?: EventCallback;
  }) => IBranchProps | LeafProps;
  element: INode;
  descendantsCount: number;
  level: number;
  isExpanded?: boolean;
  isBranch?: boolean;
  isSelected?: boolean;
  onDoubleClick?: (info: Folder) => void;
}): JSX.Element {
  const [renaming, setRenaming] = useState(false);

  const getContextMenuItems = () => {
    const baseItems = [
      {
        label: "New Story",
        onClick: (info: Folder | File) => {
          startTransition(async () => {});
        },
      },
      {
        label: "New Folder",
        onClick: (info: Folder | File) => {
          const formData = new FormData();
          formData.append("storyId", info.metadata.storyId);
          if ("parent" in info && typeof info.parent === "string") {
            formData.append("parentId", info.parent);
          }
          startTransition(async () => {
            await createFolder(null, formData);
          });
        },
      },
    ];

    // Only add the "New File" option if the element is not a file
    if (element.metadata.type !== "file") {
      baseItems.push({
        label: "New File",
        onClick: (info: Folder | File) => {
          startTransition(async () => {
            const formData = new FormData();
            formData.append("storyId", info.metadata.storyId);
            if ("id" in info && typeof info.id === "string") {
              formData.append("folderId", info.id);
            }
            startTransition(async () => {
              await createFile(null, formData);
            });
          });
        },
      });
    }

    return baseItems;
  };

  const defaultNode = (
    <div
      {...getNodeProps({
        onClick: renaming
          ? () => {
              onDoubleClick?.(element);
            }
          : getNodeProps().onClick,
      })}
      onDoubleClick={() => {
        setRenaming(true);
      }}
      aria-selected={isSelected}
      aria-expanded={isExpanded}
      className={cn(
        "relative",
        "transition-colors",
        "flex items-center gap-1",
        "text-xs",
        "cursor-pointer",
        "select-none",
        "text-foreground-light",
        "aria-selected:text-foreground",
        "aria-expanded:bg-control",
        "aria-selected:!bg-selection",
        "group",
        "h-[28px]",
        "hover:bg-control",
        { "bg-white/20": isSelected } // Add your conditional class here
      )}
      style={{
        marginLeft: 10 * (level - 1),
        paddingLeft: 20, // Ensure consistent padding for all nodes
      }}
      data-treeview-is-branch={isBranch}
      data-treeview-level={level}
    >
      {/* {isExpanded ? (
        <div
          className="absolute w-px border-l bg-gray-200 left-[28px]"
          style={{ height: `${lineHeight}px`, top: `28px` }}
        />
      ) : null} */}
      {isBranch ?? element.metadata?.type === "folder" ? (
        <ArrowIcon isOpen={isExpanded!} />
      ) : (
        <div style={{ width: 16 }} />
      )}
      {/* Ensuring the space for the icon is consistent */}
      {renaming ? (
        <Input
          defaultValue={element.name}
          onBlur={() => {
            setRenaming(false);
          }}
          onKeyDown={(e) => {
            // Prevent propagation of key events that might interfere with input
            if (e.key !== "Enter" && e.key !== "Escape") {
              e.stopPropagation();
            }
          }}
          onKeyUp={(e) => {
            e.preventDefault();
            if (e.key === "Enter") {
              const formData = new FormData();
              formData.append("storyId", element.metadata.storyId);
              formData.append("name", e.currentTarget.value);
              formData.append("type", element.metadata.type);
              console.log("type: ", element.metadata.type);
              if (element.metadata.type === "file") {
                formData.append("fileId", element.id);
              } else {
                formData.append("folderId", element.id);
              }

              startTransition(async () => {
                await rename(null, formData);
              });
              setRenaming(false);
            }
          }}
          // autoFocus
        />
      ) : (
        element.name
      )}
    </div>
  );

  const contextMenuItems = getContextMenuItems();

  return contextMenuItems ? (
    <ContextMenu>
      <ContextMenuTrigger>{defaultNode}</ContextMenuTrigger>
      <ContextMenuContent>
        {contextMenuItems.map((item) => (
          <ContextMenuItem
            key={item.label}
            onClick={() => {
              item.onClick(element);
            }}
          >
            {item.label}
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  ) : (
    defaultNode
  );
}

const TreeView = forwardRef<HTMLDivElement, TreeViewProps>(
  ({ folder, contextMenuItems, onDoubleClick }, ref) => {
    const data = flattenTree(folder);

    const nodeRenderer = useCallback(
      ({
        getNodeProps,
        element,
        level,
        isExpanded,
        isBranch,
        isDisabled,
        isSelected,
      }: INodeRendererProps) => (
        <TreeNode
          element={element}
          contextMenuItems={contextMenuItems}
          level={level}
          isExpanded={isExpanded}
          isBranch={isBranch}
          isDisabled={isDisabled}
          isSelected={isSelected}
          getNodeProps={getNodeProps}
          onDoubleClick={onDoubleClick}
        />
      ),
      [contextMenuItems, onDoubleClick]
    );

    return (
      <TreeViewPrimitive
        data={data}
        className="basic"
        aria-label="Tree view List"
        nodeRenderer={nodeRenderer}
      />
    );
  }
);

TreeView.displayName = "TreeView";

function ArrowIcon({ isOpen }: { isOpen: boolean }): JSX.Element {
  return isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />;
}

export { TreeView };
