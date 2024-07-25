"use client";

import {
  forwardRef,
  startTransition,
  useCallback,
  useEffect,
  useState,
} from "react";
import TreeViewPrimitive, {
  flattenTree,
  type INode,
  type INodeRendererProps,
} from "react-accessible-treeview";
import {
  DndContext,
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  type DragEndEvent,
  type DraggableAttributes,
  DragOverlay,
  type DragStartEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { ChevronDown, ChevronRight } from "lucide-react";
import { type Folder } from "@repo/db";
import { type SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
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
import { useTabsStore } from "@/app/stores/tabs-provider";
import { useUpdateStoryUrl } from "@/hooks/use-update-story-url";
import { deleteFileFolder } from "@/app/(main)/stories/actions/delete-file-folder";
import { type TabTypes } from "@/app/stores/tabs-store";
import { updateFileFolder } from "@/app/(main)/stories/actions/update-file-folder";
import { Input } from "../ui/input";

interface NodeMetadata {
  storyId: string;
  storyTitle: string;
  isRoot: boolean;
  type: "folder" | "file";
}

export interface Node {
  name: string;
  metadata: NodeMetadata;
  children: Node[];
  parent?: string;
  id: string;
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

interface TreeNodeProps extends INodeRendererProps {
  onDoubleClick?: (info: Folder) => void;
  isDragging?: boolean;
  isOver?: boolean;
  isDraggingOverFolder?: boolean;
  dragAttributes?: DraggableAttributes;
  dragListeners?: SyntheticListenerMap;
  setDragNodeRef?: (element: HTMLElement | null) => void;
  style?: React.CSSProperties;
}

function TreeNode({
  getNodeProps,
  element,
  level,
  dispatch,
  isExpanded,
  isBranch,
  isOver,
  isDraggingOverFolder,
  isSelected = false,
  dragAttributes,
  dragListeners,
  setDragNodeRef,
}: TreeNodeProps): JSX.Element {
  const updateTabLabel = useTabsStore((state) => state.updateTabLabel);
  const removeTab = useTabsStore((state) => state.removeTab);
  const updateStoryUrl = useUpdateStoryUrl();
  const [renaming, setRenaming] = useState(false);

  const getContextMenuItems = () => {
    const baseItems = [
      {
        label: "New Story",
        onClick: () => {
          startTransition(async () => {});
        },
      },
      {
        label: "New Folder",
        onClick: (info: Node) => {
          const formData = new FormData();

          formData.append("storyId", info.metadata.storyId);
          if (info.metadata.isRoot && info.parent) {
            formData.append("parentId", info.parent);
          } else {
            formData.append("parentId", info.id);
          }
          startTransition(async () => {
            const response = await createFolder(null, formData);
            console.log("response: ", response);
          });
        },
      },
      {
        label: "Delete",
        onClick: () => {
          const formData = new FormData();
          formData.append("storyId", element.metadata.storyId);
          formData.append("name", element.name);
          formData.append("type", element.metadata.type);
          if (element.metadata.type === "file") {
            formData.append("fileId", element.id);
          } else {
            formData.append("folderId", element.id);
          }

          startTransition(async () => {
            const response = await deleteFileFolder(null, formData);
            if (response?.status) {
              removeTab(element.id);
            }
          });
        },
      },
    ];

    // Only add the "New File" option if the element is not a file
    if (element.metadata?.type !== "file") {
      baseItems.push({
        label: "New File",
        onClick: (info: Node) => {
          startTransition(async () => {
            const formData = new FormData();

            if (info.metadata.storyId) {
              formData.append("storyId", info.metadata.storyId);
            }

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

  const handleClick = (
    e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (renaming) {
      // Don't propagate click when renaming
      e.stopPropagation();
      return;
    }

    const nodeProps = getNodeProps();
    if (nodeProps.onClick) {
      nodeProps.onClick(e as any);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setRenaming(true);
  };

  const handleRenameBlur = () => {
    setRenaming(false);
  };

  const handleRenameKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.key === "Enter") {
      const formData = new FormData();
      const label = e.currentTarget.value;
      const fileId = element.id;
      const title = element.metadata.storyTitle;
      formData.append("storyId", element.metadata.storyId);
      formData.append("name", label);
      formData.append("type", element.metadata.type);
      if (element.metadata.type === "file") {
        formData.append("fileId", element.id);
      } else {
        formData.append("folderId", element.id);
      }

      startTransition(async () => {
        const resp = await rename(null, formData);
        if (resp?.status) {
          updateTabLabel({ id: element.id, label });
          updateStoryUrl({ fileId, title, fileName: label });
        }
        dispatch({
          type: "ENABLE",
          id: element.id,
        });
        setRenaming(false);
      });
    } else if (e.key === "Escape") {
      setRenaming(false);
    }
  };

  const nodeProps = getNodeProps({
    onClick: handleClick,
  });

  if (isDraggingOverFolder) {
    console.log("Dragging over folder: ", isDraggingOverFolder);
  }

  const defaultNode = (
    <div
      {...nodeProps}
      ref={setDragNodeRef}
      {...(renaming ? {} : { ...dragAttributes, ...dragListeners })}
      onDoubleClick={handleDoubleClick}
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
        { "bg-white/20": isDraggingOverFolder ?? isSelected }
      )}
      style={{
        marginLeft: 10 * (level - 1),
        paddingLeft: 20,
      }}
      data-treeview-is-branch={isBranch}
      data-treeview-level={level}
    >
      {element.metadata?.type === "folder" ? (
        <ArrowIcon isOpen={isExpanded!} />
      ) : (
        <div style={{ width: 16 }} />
      )}
      {renaming ? (
        <Input
          defaultValue={element.name}
          onBlur={handleRenameBlur}
          onKeyUp={handleRenameKeyUp}
          onClick={(e) => e.stopPropagation()}
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

interface SortableTreeNodeProps extends INodeRendererProps {
  overItem: Array<string>;
}

function SortableTreeNode({
  getNodeProps,
  element,
  level,
  isExpanded,
  isBranch,
  isDisabled,
  isSelected,
  dispatch,
  overItem,
  ...props
}: SortableTreeNodeProps): JSX.Element {
  const { attributes, listeners, setNodeRef, transition, isDragging, isOver } =
    useSortable({
      id: element.id,
      data: {
        type: "treeNode",
        element,
      },
    });

  const style = {
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isDraggingOverFolder = overItem?.includes(element.id);

  if (isDraggingOverFolder) {
    console.log("Dragging over folder: ", overItem);
  }

  return (
    <div ref={setNodeRef} style={style}>
      <TreeNode
        element={element}
        level={level}
        isExpanded={isExpanded}
        isBranch={isBranch}
        isDisabled={isDisabled}
        isSelected={isSelected}
        dispatch={dispatch}
        getNodeProps={getNodeProps}
        isDragging={isDragging}
        isDraggingOverFolder={isDraggingOverFolder}
        isOver={isOver}
        dragAttributes={attributes}
        dragListeners={listeners}
        setDragNodeRef={setNodeRef}
        style={style}
        {...props}
      />
    </div>
  );
}

export function sortTreeItems(items: INode[]): INode[] {
  return items.map((item) => {
    if (item.metadata?.type === "folder" && item.children) {
      const sortedChildren = [...item.children].sort((a, b) => {
        const childA = items.find((i) => i.id === a);
        const childB = items.find((i) => i.id === b);
        return childA && childB ? childA.name.localeCompare(childB.name) : 0;
      });
      return { ...item, children: sortedChildren };
    }
    return item;
  });
}

const getAllChildren = (item: INode, items: INode[]): INode[] => {
  let children = items.filter((child) => child.parent === item.id);

  children.forEach((child) => {
    if (child.metadata?.type === "folder") {
      children = [...children, ...getAllChildren(child, items)];
    }
  });

  return children;
};

const TreeView = forwardRef<HTMLDivElement, TreeViewProps>(
  ({ folder }, ref) => {
    const addTab = useTabsStore((state) => state.addTab);

    const [items, setItems] = useState(flattenTree(folder));
    const [activeItem, setActiveItem] = useState<INode | null>(null);
    const [overItem, setOverItem] = useState<string | null>(null);

    useEffect(() => {
      setItems(flattenTree(folder));
    }, [folder]);

    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 0.1,
        },
      }),
      useSensor(KeyboardSensor)
    );

    const handleDragStart = (event: DragStartEvent) => {
      const activeItem = items.find((item) => item.id === event.active.id);
      if (activeItem) {
        setActiveItem(activeItem);
      }
    };

    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;

      if (active.id !== over?.id && over) {
        setItems((prevItems) => {
          const activeIndex = prevItems.findIndex(
            (item) => item.id === active.id
          );
          const overIndex = prevItems.findIndex((item) => item.id === over.id);

          if (activeIndex === -1 || overIndex === -1) {
            return prevItems; // No change if items not found
          }

          const activeItem = prevItems[activeIndex];
          const overItem = prevItems[overIndex];

          // Determine the new parent ID
          const newParentId =
            overItem.metadata?.type === "folder"
              ? overItem.id
              : overItem.parent;

          // If it's the same parent, do nothing
          if (newParentId === activeItem.parent) {
            return prevItems;
          }

          // If it's a folder, check it's not being moved into its own descendant
          if (activeItem.metadata?.type === "folder") {
            const isDescendant = (
              parentId: string,
              childId: string
            ): boolean => {
              const child = prevItems.find((item) => item.id === childId);
              if (!child) return false;
              if (child.parent === parentId) return true;
              if (child.parent) return isDescendant(parentId, child.parent);
              return false;
            };

            if (isDescendant(activeItem.id, newParentId)) {
              return prevItems; // Cannot move a folder into its own descendant
            }
          }

          // Create a new array with all the updates
          const updatedItems = prevItems.map((item) => {
            if (item.id === activeItem.id) {
              // Update the moved item
              return { ...item, parent: newParentId };
            } else if (item.id === newParentId) {
              // Update the new parent folder
              return {
                ...item,
                children: [...(item.children || []), activeItem.id],
              };
            } else if (item.id === activeItem.parent) {
              // Update the old parent
              return {
                ...item,
                children: (item.children || []).filter(
                  (id) => id !== activeItem.id
                ),
              };
            }
            return item;
          });

          // Sort the updated items
          const sortedItems = sortTreeItems(updatedItems);

          // Trigger the server update
          startTransition(async () => {
            const formData = new FormData();
            formData.append("storyId", activeItem.metadata.storyId);
            formData.append("type", activeItem.metadata.type);
            formData.append("parentId", newParentId);

            if (activeItem.metadata.type === "file") {
              formData.append("fileId", activeItem.id);
            } else {
              formData.append("folderId", activeItem.id);
            }

            const response = await updateFileFolder(null, formData, true);
            if (response?.status === "error") {
              console.error("Failed to update file/folder:", response.message);
              // You might want to show an error message to the user here
            }
          });
          setOverItem(null);
          return sortedItems;
        });
      }
    };

    const handleDragOver = (event: DragOverEvent) => {
      const { active, over } = event;
      if (over) {
        const activeItem = items.find((item) => item.id === active.id);
        const overItem = items.find((item) => item.id === over.id);

        if (activeItem && overItem && activeItem.parent === overItem.id) {
          // Same parent, no need to set overItem
          setOverItem(null);
          return;
        }

        const childrenItems = items.filter((item) => item.parent === over.id);
        const allSelectedItems = [overItem, ...getAllChildren(overItem, items)];
        const allSelectedIds = allSelectedItems.map((item) => item.id);

        if (allSelectedIds) {
          setOverItem(allSelectedIds);
        }
      } else {
        setOverItem(null);
      }
    };

    const updateStoryUrl = useUpdateStoryUrl();

    const nodeRenderer = useCallback(
      (props: INodeRendererProps) => (
        <SortableTreeNode overItem={overItem} {...props} />
      ),
      [overItem]
    );

    console.log("overItem: ", overItem);

    return (
      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <TreeViewPrimitive
            data={items}
            className="basic"
            aria-label="Tree view List"
            nodeRenderer={nodeRenderer}
            onNodeSelect={(node) => {
              if (node.element.metadata?.storyTitle) {
                const storyTitle = node.element.metadata.storyTitle as string;
                const fileName = node.element.name;
                const fileId = node.element.id as string;
                const fileType = node.element.metadata.isRoot
                  ? "story"
                  : node.element.metadata.type;

                addTab({
                  label: fileName,
                  fileId,
                  storyTitle,
                  storyId: node.element.metadata.storyId as string,
                  isRoot: Boolean(node.element.metadata.isRoot),
                  parentId: node.element.parent as string,
                  type: fileType as TabTypes,
                });

                if (fileType !== "folder") {
                  updateStoryUrl({ fileId, title: storyTitle, fileName });
                }
              }
            }}
            defaultExpandedIds={items.map((item) => item.id)}
          />
        </SortableContext>
        <DragOverlay>
          {activeItem ? (
            <div className="text-xs bg-blue-500/50">{activeItem.name}</div>
          ) : null}
        </DragOverlay>
      </DndContext>
    );
  }
);

TreeView.displayName = "TreeView";

function ArrowIcon({ isOpen }: { isOpen: boolean }): JSX.Element {
  return isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />;
}

export { TreeView };
