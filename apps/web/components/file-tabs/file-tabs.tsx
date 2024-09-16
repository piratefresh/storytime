"use client";

import { useState } from "react";
import { createFile } from "@/app/(main)/stories/actions/create-file";
import { createFolder } from "@/app/(main)/stories/actions/create-folder";
import { saveFile } from "@/app/(main)/stories/actions/file/save-file";
import { StoryWithFolder } from "@/app/(main)/stories/actions/get-story";
import { type Tab } from "@/app/stores/tabs-store";
import { useUpdateStoryUrl } from "@/hooks/use-update-story-url";
import { cn } from "@/lib/utils";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { User } from "@repo/db";
import { JSONContent } from "@tiptap/core";
import { SplitSquareHorizontal } from "lucide-react";
import { ReactFlowProvider, useReactFlow } from "reactflow";

import { BlockEditor } from "../block-editor/block-editor";
import Flow from "../graph-view/graph-view";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Tabs, TabsContent, TabsList } from "../ui/tabs";
import { Folder } from "../views/folder/folder";
import { FileTab } from "./file-tab";
import { SortableItem } from "./sortable-item";

interface FileTabsProps {
  user: User;
  tabs: Tab[];
  story: StoryWithFolder;
  groupId: string;
  activeTabId: string | null;
  isActiveGroup: boolean;
  onSetActiveTab: (groupId: string, tabId: string) => void;
  onReorderTabs: (groupId: string, oldIndex: number, newIndex: number) => void;
  onRemoveTab: (groupId: string, tabId: string) => void;
  onSplitTab: () => void;
  onAddGraphTab: () => void;
}
// https://docs.pmnd.rs/zustand/integrations/persisting-store-data#usage-in-next.js
// In case ssr problems arise
export function FileTabs({
  activeTabId,
  isActiveGroup,
  groupId,
  user,
  onReorderTabs,
  onRemoveTab,
  onSetActiveTab,
  onSplitTab,
  onAddGraphTab,
  tabs = [],
  story,
}: FileTabsProps): JSX.Element {
  const updateStoryUrl = useUpdateStoryUrl();

  const [activeId, setActiveId] = useState<string | number | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor),
  );

  const handleDragStart = (event: DragStartEvent): void => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tabs.findIndex((tab: Tab) => tab.id === active.id);
      const newIndex = tabs.findIndex((tab: Tab) => tab.id === over.id);
      onReorderTabs(groupId, oldIndex, newIndex);
    }
  };

  const handleOnTabChange = ({
    tabId,
    storyTitle,
  }: {
    tabId: string;
    storyTitle: string;
  }): void => {
    onSetActiveTab(groupId, tabId);
    updateStoryUrl({ fileId: tabId, title: storyTitle, fileName: storyTitle });
  };

  const handleSaveChange = async ({
    content,
    tab,
  }: {
    content: JSONContent;
    tab: Tab;
  }): Promise<void> => {
    if (tab.type === "file") {
      const formData = new FormData();
      formData.append("content", JSON.stringify(content));
      formData.append("fileId", tab.id);
      formData.append("storyId", story.id);
      await saveFile(null, formData);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Tabs
        className="relative flex h-full flex-col"
        // className="relative flex min-h-screen w-full flex-1 flex-col overflow-hidden"
        value={activeTabId?.toString()}
        onValueChange={(tabId) => {
          const tab = tabs.find((tab) => tab.id === tabId);
          if (tab) {
            handleOnTabChange({
              tabId,
              storyTitle: tab.storyTitle,
            });
          }
        }}
      >
        <SortableContext
          items={tabs?.map((tab) => tab.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex flex-row">
            <TabsList className="flex w-full items-start overflow-hidden">
              {tabs.map((tab) => {
                const isActive = isActiveGroup && tab.id === activeTabId;
                return (
                  <SortableItem key={tab.id} id={tab.id}>
                    <FileTab
                      key={tab.id}
                      active={isActive}
                      tab={tab}
                      onClose={() => {
                        onRemoveTab(groupId, tab.id);
                      }}
                    />
                  </SortableItem>
                );
              })}
            </TabsList>
            <DropdownMenu>
              <DropdownMenuTrigger>Open</DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={onSplitTab}>
                  <SplitSquareHorizontal />
                  Split Tab
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onAddGraphTab}>
                  <SplitSquareHorizontal />
                  Open Flow Tab
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SortableContext>
        <DragOverlay>
          {activeId ? (
            <div
              id={activeId.toString()}
              className={cn(
                "inline-flex items-center justify-center whitespace-nowrap border border-border bg-neutral-800 px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
              )}
            >
              {tabs.find((tab) => tab.id === activeId)?.label}
            </div>
          ) : null}
        </DragOverlay>

        <div className="h-full">
          {tabs.map((tab) => (
            <TabsContent
              className="h-full"
              key={tab.id}
              value={String(tab.id)}
              onFocus={() => {
                onSetActiveTab(groupId, tab.id);
              }}
            >
              <TabModule
                tab={tab}
                story={story}
                user={user}
                isActive={tab.id === activeTabId}
              />
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </DndContext>
  );
}

function TabModule({
  tab,
  story,
  user,
  isActive = false,
}: {
  tab: Tab;
  story: StoryWithFolder;
  user: User;
  isActive?: boolean;
}): JSX.Element | null {
  const { type } = tab;

  const handleSaveChange = async ({
    content,
    tab,
  }: {
    content: JSONContent;
    tab: Tab;
  }): Promise<void> => {
    if (tab.type === "file") {
      const formData = new FormData();
      formData.append("content", JSON.stringify(content));
      formData.append("fileId", tab.id);
      formData.append("storyId", story.id);
      await saveFile(null, formData);
    }
  };

  switch (type) {
    case "flow":
      return (
        <ReactFlowProvider>
          <FlowTab id={tab.id} story={story} />
        </ReactFlowProvider>
      );
    case "folder":
      return <Folder />;

    default:
      return (
        <BlockEditor
          key={tab.id}
          content={tab.content ?? ""}
          contentId={tab.id}
          isActive={isActive}
          storyId={story.id}
          user={user}
          onChange={(content, plainText) => {
            void handleSaveChange({ content, tab });
          }}
        />
      );
  }
}

interface FlowTabProps {
  story: StoryWithFolder;
  id: string;
}

export function FlowTab({ story, id }: FlowTabProps): JSX.Element {
  const { addNodes, addEdges } = useReactFlow();
  const handleAddFile = async (folderId: string): Promise<void> => {
    const formData = new FormData();

    if (story.id) {
      formData.append("storyId", story.id);
    }

    if (folderId) {
      formData.append("folderId", folderId);
    }

    const response = await createFile(null, formData);
    if (response?.data) {
      const file = response.data;
      addNodes({
        id: file.id,
        type: "file",
        data: {
          label: file.name,
          folderId: file.folderId,
          id: file.id,
          type: "file",
        },
        position: { x: 0, y: 0 },
      });
      if (file.folderId) {
        addEdges({
          id: `e-${file.folderId}-${file.id}`,
          source: file.folderId,
          target: file.id,
          type: "smoothstep",
          animated: true,
          style: { stroke: "#fff" },
        });
      }
    }
  };

  const handleAddFolder = async (parentId: string): Promise<void> => {
    const formData = new FormData();

    if (story.id) {
      formData.append("storyId", story.id);
    }

    if (parentId) {
      formData.append("parentId", parentId);
    }
    const response = await createFolder(null, formData);

    if (response?.data) {
      const folder = response.data;
      addNodes({
        id: folder.id,
        type: "folder",
        data: {
          label: folder.name,
          parentId: folder.parentId,
          id: folder.id,
          type: "folder",
        },
        position: { x: 0, y: 0 },
      });

      // Create edge to parent or to the top node if no parent
      const sourceId = folder.parentId ?? `story-${story.id}`;
      addEdges({
        id: `e-${sourceId}-${folder.id}`,
        source: sourceId,
        target: folder.id,
        type: "smoothstep",
        animated: true,
        style: { stroke: "#fff" },
      });
    }
  };
  return (
    <Flow
      id={id}
      onAddFile={handleAddFile}
      onAddFolder={handleAddFolder}
      story={story}
    />
  );
}
export type { Tab };
