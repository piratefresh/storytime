"use client";

import { useState } from "react";
import { type User } from "lucia";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type UniqueIdentifier,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { type Story } from "@repo/db";
import { cn } from "@/lib/utils";
import { useTabsStore } from "@/app/stores/tabs-provider";
import { useUpdateStoryUrl } from "@/hooks/use-update-story-url";
import { Tabs, TabsContent, TabsList } from "../ui/tabs";
import { BlockEditor } from "../block-editor/block-editor";
import { FileTab } from "./file-tab";
import { SortableItem } from "./sortable-item";

export interface Tab {
  label: string;
  content: string;
  id: UniqueIdentifier;
}

interface FileTabsProps {
  user: User | null;
  story: Story;
}
// https://docs.pmnd.rs/zustand/integrations/persisting-store-data#usage-in-next.js
// In case ssr problems arise
export function FileTabs({ user }: FileTabsProps): JSX.Element {
  const activeTabId = useTabsStore((state) => state.activeTabId);
  const tabs = useTabsStore((state) =>
    state.tabs.filter((tab) => tab.type !== "folder")
  );
  const removeTab = useTabsStore((state) => state.removeTab);
  const setActiveTab = useTabsStore((state) => state.setActiveTab);
  const reorderTabs = useTabsStore((state) => state.reorderTabs);

  const updateStoryUrl = useUpdateStoryUrl();

  const [activeId, setActiveId] = useState<string | number | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor)
  );

  const handleDragStart = (event: DragStartEvent): void => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tabs.findIndex((tab: Tab) => tab.id === active.id);
      const newIndex = tabs.findIndex((tab: Tab) => tab.id === over.id);
      reorderTabs(oldIndex, newIndex);
    }
  };

  const handleOnTabChange = ({
    tabId,
    storyTitle,
  }: {
    tabId: string;
    storyTitle: string;
  }) => {
    setActiveTab(tabId);
    updateStoryUrl({ fileId: tabId, title: storyTitle, fileName: storyTitle });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Tabs
        className="relative flex flex-col flex-1 min-h-screen w-full overflow-hidden"
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
          items={tabs.map((tab) => tab.id)}
          strategy={horizontalListSortingStrategy}
        >
          <TabsList className="flex w-full overflow-hidden items-start">
            {tabs.map((tab, index) => (
              <SortableItem key={tab.id} id={tab.id}>
                <FileTab
                  tab={tab}
                  key={tab.id}
                  onClose={() => {
                    removeTab(tab.id);
                  }}
                />
              </SortableItem>
            ))}
          </TabsList>
        </SortableContext>
        <DragOverlay>
          {activeId ? (
            <div
              className={cn(
                "inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium bg-neutral-800 border border-border ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              )}
              id={activeId.toString()}
            >
              {tabs.find((tab) => tab.id === activeId)?.label}
            </div>
          ) : null}
        </DragOverlay>

        <div className="grid flex-1 max-h-screen overflow-y-auto">
          {tabs.map((tab) => (
            <TabsContent className="flex-1" key={tab.id} value={String(tab.id)}>
              <BlockEditor
                user={user}
                onChange={(content: string) => {
                  console.log("Change Detected:", content);
                }}
                content={tab.content || ""}
                contentId={tab.id}
              />
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </DndContext>
  );
}
