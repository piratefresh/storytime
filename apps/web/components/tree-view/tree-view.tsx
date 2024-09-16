"use client";

import {
  forwardRef,
  startTransition,
  useCallback,
  useEffect,
  useState,
} from "react";
import { updateFileFolder } from "@/app/(main)/stories/actions/update-file-folder";
import { useTabsStore } from "@/app/stores/tabs-provider";
import { type Tab, type TabTypes } from "@/app/stores/tabs-store";
import { useUpdateStoryUrl } from "@/hooks/use-update-story-url";
import { cn } from "@/lib/utils";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { JSONContent } from "@tiptap/core";
import TreeViewPrimitive, {
  flattenTree,
  type INode,
  type INodeRendererProps,
  type NodeId,
} from "react-accessible-treeview";
import { set } from "react-hook-form";

import { useToCContext } from "../toc-provider";
import { TreeNode } from "./tree-node";

export interface NodeMetadata {
  storyId: string;
  storyTitle: string;
  isRoot?: boolean;
  type: "folder" | "file" | "story";
  [key: string]: string | number | boolean | undefined | null;
}

export interface TreeItemNode {
  id: NodeId;
  name: string;
  isBranch?: boolean;
  metadata?: NodeMetadata;
  children?: NodeId[];
  parent?: NodeId;
}

export interface TreeNodeData<M extends NodeMetadata> {
  id?: NodeId;
  name: string;
  isBranch?: boolean;
  children?: TreeNodeData<M>[];
  metadata?: M;
}

interface ContextMenuItems {
  label: string;
  onClick: (info: TreeItemNode) => void;
}

export interface TreeViewProps extends React.ComponentPropsWithoutRef<"div"> {
  folder: TreeNodeData<NodeMetadata>;
  contextMenuItems?: ContextMenuItems[];
}

interface SortableTreeNodeProps extends INodeRendererProps {
  overItem?: NodeId[] | null;
  selectedNode?: NodeId | null;
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
  selectedNode,
  ...props
}: SortableTreeNodeProps): JSX.Element {
  const [isEditing, setIsEditing] = useState(false);

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

  const isSelectedNode = String(element.id) === String(selectedNode);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn({
        "bg-white/20": isDraggingOverFolder || isSelectedNode,
      })}
    >
      <TreeNode
        dispatch={dispatch}
        dragAttributes={attributes}
        dragListeners={listeners}
        element={element}
        getNodeProps={getNodeProps}
        isBranch={isBranch}
        isDisabled={isDisabled}
        isDragging={isDragging}
        isDraggingOverFolder={isDraggingOverFolder}
        isEditing={isEditing}
        isExpanded={isExpanded}
        isOver={isOver}
        isSelected={isSelected}
        level={level}
        setDragNodeRef={setNodeRef}
        style={style}
        onEditing={setIsEditing}
        {...props}
      />
    </div>
  );
}

export function sortTreeItems(
  items: INode<NodeMetadata>[],
): INode<NodeMetadata>[] {
  return items.map((item) => {
    if (item.metadata?.type === "folder") {
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

const getAllChildren = (
  item: INode<NodeMetadata>,
  items: INode<NodeMetadata>[],
): INode<NodeMetadata>[] => {
  let children = items.filter((child) => child.parent === item.id);

  children.forEach((child) => {
    if (child.metadata?.type === "folder") {
      children = [...children, ...getAllChildren(child, items)];
    }
  });

  return children;
};

const TreeView = forwardRef<HTMLUListElement, TreeViewProps>(
  ({ folder }, ref) => {
    const addTab = useTabsStore((state) => state.addTab);
    const activeGroupTabs = useTabsStore((state) => state.getActiveGroupTabs());
    const activeTab = useTabsStore((state) => state.getActiveTab());
    const [items, setItems] = useState(() => flattenTree(folder));
    const [activeItem, setActiveItem] = useState<INode<NodeMetadata> | null>(
      null,
    );
    const [overItem, setOverItem] = useState<NodeId[] | null>(null);

    useEffect(() => {
      setItems(flattenTree(folder));
    }, [folder]);

    const sensors = useSensors(
      useSensor(MouseSensor, {
        activationConstraint: {
          distance: 10,
        },
      }),
      useSensor(KeyboardSensor),
    );

    const handleDragStart = (event: DragStartEvent): void => {
      const draggedItem = items.find((item) => item.id === event.active.id);
      if (draggedItem) {
        setActiveItem(draggedItem);
      }
    };

    const handleDragEnd = (event: DragEndEvent): void => {
      const { active, over } = event;

      if (active.id !== over?.id && over) {
        setItems((prevItems) => {
          const activeIndex = prevItems.findIndex(
            (item) => item.id === active.id,
          );
          const overIndex = prevItems.findIndex((item) => item.id === over.id);

          if (activeIndex === -1 || overIndex === -1) {
            return prevItems; // No change if items not found
          }

          const draggedItem = prevItems[activeIndex];
          const draggedOverItem = prevItems[overIndex];

          // Add a check to ensure draggedOverItem is defined
          if (!draggedOverItem || !draggedItem) {
            return prevItems; // No change if draggedOverItem is undefined
          }

          // Determine the new parent ID
          const newParentId =
            draggedOverItem.metadata?.type === "folder"
              ? draggedOverItem.id
              : draggedOverItem.parent;

          // If it's the same parent, do nothing
          if (newParentId === draggedItem.parent || !newParentId) {
            return prevItems;
          }

          // If it's a folder, check it's not being moved into its own descendant
          if (draggedItem.metadata?.type === "folder") {
            const isDescendant = (
              parentId: NodeId,
              childId: NodeId,
            ): boolean => {
              const child = prevItems.find((item) => item.id === childId);
              if (!child) return false;
              if (child.parent === parentId) return true;
              if (child.parent && typeof child.parent === "string")
                return isDescendant(parentId, child.parent);
              return false;
            };

            if (isDescendant(draggedItem.id, newParentId)) {
              return prevItems; // Cannot move a folder into its own descendant
            }
          }

          // Create a new array with all the updates
          const updatedItems = prevItems.map((item) => {
            if (item.id === draggedItem.id) {
              // Update the moved item
              return { ...item, parent: newParentId };
            } else if (item.id === newParentId) {
              // Update the new parent folder
              return {
                ...item,
                children: [...item.children, draggedItem.id],
              };
            } else if (item.id === draggedItem.parent) {
              return {
                ...item,
                children: item.children.filter((id) => id !== draggedItem.id),
              };
            }
            return item;
          });

          // Sort the updated items
          const sortedItems = sortTreeItems(updatedItems);

          activeGroupTabs;

          // Trigger the server update
          startTransition(async () => {
            const formData = new FormData();
            if (activeItem?.metadata) {
              formData.append("storyId", activeItem.metadata.storyId);
              formData.append("type", activeItem.metadata.type);
              formData.append("parentId", newParentId as string);

              if (activeItem.metadata.type === "file") {
                formData.append("fileId", activeItem.id as string);
              } else {
                formData.append("folderId", activeItem.id as string);
              }
            }

            const response = await updateFileFolder(null, formData, true);
            if (response?.status === "error") {
              console.error("Failed to update file/folder:", response.message);
            }
          });
          setOverItem(null);
          return sortedItems;
        });
      }
    };

    const handleDragOver = (event: DragOverEvent): void => {
      const { active, over } = event;
      if (over) {
        const draggedItem = items.find((item) => item.id === active.id);
        const draggedOverItem = items.find((item) => item.id === over.id);

        if (!draggedItem || !draggedOverItem) {
          return;
        }

        if (draggedItem.parent === draggedOverItem.id) {
          // Same parent, no need to set draggedOverItem
          setOverItem(null);
          return;
        }

        const allSelectedItems = [
          draggedOverItem,
          ...getAllChildren(draggedOverItem, items),
        ];
        const allSelectedIds = allSelectedItems.map((item) => item.id);

        setOverItem(allSelectedIds);
      } else {
        setOverItem(null);
      }
    };

    const updateStoryUrl = useUpdateStoryUrl();

    const nodeRenderer = useCallback(
      (props: INodeRendererProps) => (
        <SortableTreeNode
          overItem={overItem}
          selectedNode={activeTab?.id}
          {...props}
        />
      ),
      [activeTab?.id, overItem],
    );

    return (
      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <TreeViewPrimitive
            ref={ref}
            aria-label="Tree view List"
            className="basic"
            data={items}
            defaultExpandedIds={items.map((item) => item.id)}
            selectedIds={[]}
            nodeRenderer={nodeRenderer}
            onNodeSelect={(node) => {
              if (node.element.metadata?.storyTitle) {
                const storyTitle = node.element.metadata.storyTitle as string;
                const fileName = node.element.name;
                const fileId = node.element.id as string;
                const fileType = node.element.metadata.isRoot
                  ? "story"
                  : node.element.metadata.type;

                const content = node.element.metadata.content;

                const tab: Tab = {
                  label: fileName,
                  content: (content as unknown as JSONContent) ?? "",
                  id: fileId,
                  storyTitle,
                  storyId: node.element.metadata.storyId as string,
                  isRoot: Boolean(node.element.metadata.isRoot),
                  parentId: node.element.parent as string,
                  type: fileType as TabTypes,
                };

                addTab(tab);

                if (fileType !== "folder") {
                  updateStoryUrl({ fileId, title: storyTitle, fileName });
                }
              }
            }}
          />
        </SortableContext>
        <DragOverlay>
          {activeItem ? (
            <div className="bg-blue-500/50 text-xs">{activeItem.name}</div>
          ) : null}
        </DragOverlay>
      </DndContext>
    );
  },
);

TreeView.displayName = "TreeView";

export { TreeView };
