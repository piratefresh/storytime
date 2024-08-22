import { type DraggableAttributes } from "@dnd-kit/core";
import { type SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { type Folder } from "@repo/db";
import {
  Fragment,
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { type INodeRendererProps } from "react-accessible-treeview";
import { ChevronDown, ChevronRight, FileIcon, FolderIcon } from "lucide-react";
import { useTabsStore } from "@/app/stores/tabs-provider";
import { useUpdateStoryUrl } from "@/hooks/use-update-story-url";
import { createFolder } from "@/app/(main)/stories/actions/create-folder";
import { deleteFileFolder } from "@/app/(main)/stories/actions/delete-file-folder";
import { createFile } from "@/app/(main)/stories/actions/create-file";
import { cn } from "@/lib/utils";
import { rename } from "@/app/(main)/stories/actions/rename";
import { Input } from "../ui/input";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "../ui/context-menu";
import { type TreeItemNode } from "./tree-view";
import { DropdownMenuLabel } from "../ui/dropdown-menu";
import { Context } from "@dnd-kit/sortable/dist/components";

interface TreeNodeProps extends INodeRendererProps {
  onDoubleClick?: (info: Folder) => void;
  isDragging?: boolean;
  isOver?: boolean;
  isDraggingOverFolder?: boolean;
  dragAttributes?: DraggableAttributes;
  dragListeners?: SyntheticListenerMap;
  setDragNodeRef?: (element: HTMLElement | null) => void;
  style?: React.CSSProperties;
  isEditing: boolean;
  onEditing: (isEditing: boolean) => void;
}

interface MenuItem {
  label: string;
  onClick?: (info: TreeItemNode) => void;
  subMenu?: MenuItem[];
}

interface MenuSection {
  items: MenuItem[];
}

function ArrowIcon({ isOpen }: { isOpen: boolean }): JSX.Element {
  return isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />;
}

export function TreeNode({
  getNodeProps,
  element,
  level,
  dispatch,
  isExpanded,
  isBranch,
  isDraggingOverFolder,
  isSelected = false,
  dragAttributes,
  dragListeners,
  setDragNodeRef,
  isEditing,
  onEditing,
}: TreeNodeProps): JSX.Element {
  const updateTabLabel = useTabsStore((state) => state.updateTabLabel);
  const removeTabFromAllGroups = useTabsStore(
    (state) => state.removeTabFromAllGroups
  );

  const updateStoryUrl = useUpdateStoryUrl();
  const [localValueState, setLocalValueState] = useState(element.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleRename = useCallback(
    (newName: string): void => {
      if (element.metadata) {
        const formData = new FormData();
        const fileId = element.id as string;
        const title = element.metadata.storyTitle as string;
        formData.append("storyId", element.metadata.storyId as string);
        formData.append("name", newName);
        formData.append("type", element.metadata.type as string);
        if (element.metadata.type === "file") {
          formData.append("fileId", fileId);
        } else {
          formData.append("folderId", fileId);
        }

        startTransition(async () => {
          const resp = await rename(null, formData);
          if (resp?.status) {
            updateTabLabel({ tabId: element.id as string, label: newName });
            if (title) {
              updateStoryUrl({ fileId, title, fileName: newName });
            }
          }
          dispatch({
            type: "ENABLE",
            id: element.id,
          });
          onEditing(false);
        });
      }
    },
    [
      dispatch,
      element.id,
      element.metadata,
      onEditing,
      updateStoryUrl,
      updateTabLabel,
    ]
  );

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (isEditing) {
      handleRename(localValueState);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      console.log("handleClickOutside");
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        if (isEditing) {
          handleRename(localValueState);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleRename, isEditing, localValueState, onEditing]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const getContextMenuItems = (): MenuSection[] => {
    return [
      {
        items: [
          {
            label: "Create file",
            onClick: (info: TreeItemNode) => {
              const formData = new FormData();
              if (info.metadata.storyId) {
                formData.append("storyId", info.metadata.storyId);
              }
              if (
                "id" in info &&
                typeof info.id === "string" &&
                !info.metadata.isRoot
              ) {
                formData.append("folderId", info.id);
              }
              startTransition(async () => {
                await createFile(null, formData);
              });
            },
          },
          {
            label: "Create folder",
            onClick: (info: TreeItemNode) => {
              const formData = new FormData();
              if (info.metadata.storyId) {
                formData.append("storyId", info.metadata.storyId);
              }
              if (!info.metadata.isRoot && info.id) {
                formData.append("parentId", info.id);
              }
              startTransition(async () => {
                await createFolder(null, formData);
              });
            },
          },
        ],
      },
      {
        items: [
          {
            label: "Make a copy",
            onClick: () => {
              console.log("Make a copy - functionality to be implemented");
            },
          },
          {
            label: "Move file to",
            subMenu: [
              {
                label: "Choose destination...",
                onClick: () => {
                  console.log(
                    "Choose destination - functionality to be implemented"
                  );
                },
              },
            ],
          },
        ],
      },
      {
        items: [
          {
            label: "Open in new tab",
            onClick: () => {
              console.log("Open in new tab - functionality to be implemented");
            },
          },
        ],
      },
      {
        items: [
          {
            label: "Delete",
            onClick: (info: TreeItemNode) => {
              const formData = new FormData();
              formData.append("storyId", info.metadata.storyId);
              formData.append("name", info.name);
              formData.append("type", info.metadata.type);
              if (info.metadata.type === "file") {
                formData.append("fileId", info.id);
              } else {
                formData.append("folderId", info.id);
              }

              startTransition(async () => {
                const response = await deleteFileFolder(null, formData);
                if (response?.status) {
                  removeTabFromAllGroups(info.id);
                }
              });
            },
          },
          {
            label: "Rename",
            onClick: () => {
              onEditing(true);
            },
          },
        ],
      },
    ];
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const nodeProps = getNodeProps();
    if (nodeProps.onClick) {
      nodeProps.onClick(e as any);
    }
  };

  const nodeProps = getNodeProps();

  const nodeContent = (
    <>
      <span
        className={cn({
          hidden: isEditing,
          "flex gap-2 items-center": !isEditing,
        })}
      >
        {element.metadata?.type === "folder" ? (
          <FolderIcon className="text-neutral-200" size={16} />
        ) : null}
        {element.metadata?.type === "file" ? (
          <FileIcon className="text-neutral-200" size={16} />
        ) : null}
        {element.name}
      </span>
      <form onSubmit={handleSubmit} className={cn(!isEditing && "hidden")}>
        <Input
          ref={inputRef}
          onChange={(e) => {
            setLocalValueState(e.target.value);
          }}
          onKeyDownCapture={(e) => {
            if (e.key === "Enter") {
              handleRename(localValueState);
            } else if (e.key === "Escape") {
              setLocalValueState(element.name);
              onEditing(false);
            } else {
              e.stopPropagation();
            }
          }}
          className="flex"
          value={localValueState}
        />
      </form>
    </>
  );

  const defaultNode = (
    <div
      {...nodeProps}
      ref={setDragNodeRef}
      {...(isEditing ? {} : { ...dragAttributes, ...dragListeners })}
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
        "hover:bg-control"
      )}
      style={{
        marginLeft: 10 * (level - 1),
      }}
      data-treeview-is-branch={isBranch}
      data-treeview-level={level}
    >
      {element.metadata?.type === "folder" ? (
        <ArrowIcon isOpen={isExpanded} />
      ) : (
        <div style={{ width: 16 }} />
      )}
      {nodeContent}
    </div>
  );

  const contextMenuItems = getContextMenuItems();

  return (
    <ContextMenu>
      <ContextMenuTrigger>{defaultNode}</ContextMenuTrigger>
      <ContextMenuContent>
        <DropdownMenuLabel>{nodeContent}</DropdownMenuLabel>
        <ContextMenuSeparator />
        {getContextMenuItems().map((section, sectionIndex) => (
          <Fragment key={sectionIndex}>
            {sectionIndex > 0 && <ContextMenuSeparator />}
            {section.items.map((item) =>
              item.subMenu ? (
                <ContextMenuSub key={item.label}>
                  <ContextMenuSubTrigger>{item.label}</ContextMenuSubTrigger>
                  <ContextMenuSubContent>
                    {item.subMenu.map((subItem) => (
                      <ContextMenuItem
                        key={subItem.label}
                        onClick={() => {
                          subItem.onClick &&
                            subItem.onClick(element as unknown as TreeItemNode);
                        }}
                      >
                        {subItem.label}
                      </ContextMenuItem>
                    ))}
                  </ContextMenuSubContent>
                </ContextMenuSub>
              ) : (
                <ContextMenuItem
                  key={item.label}
                  onClick={() => {
                    item.onClick &&
                      item.onClick(element as unknown as TreeItemNode);
                  }}
                >
                  {item.label}
                </ContextMenuItem>
              )
            )}
          </Fragment>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
}
