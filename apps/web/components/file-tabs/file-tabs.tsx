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
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { nanoid } from "nanoid";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList } from "../ui/tabs";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import { BlockEditor } from "../block-editor/block-editor";
import { FileTab } from "./file-tab";
import { SortableItem } from "./sortable-item";

export interface Tab {
  label: string;
  content: string;
  id: UniqueIdentifier;
}

const DUMMY_TABS: Tab[] = [
  { label: "Account", content: "Account details here.", id: nanoid() },
  { label: "Password", content: "Change your password here.", id: nanoid() },
];

interface FileTabsProps {
  user: User | null;
}

export function FileTabs({ user }: FileTabsProps): JSX.Element {
  const [tabs, setTabs] = useState(DUMMY_TABS);
  const [activeTabId, setActiveTabId] = useState<UniqueIdentifier | undefined>(
    tabs[0].id
  );
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
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
      setTabs((currentTabs) => {
        // Renamed from 'tabs' to 'currentTabs' to avoid shadowing
        const oldIndex = currentTabs.findIndex((tab) => tab.id === active.id);
        const newIndex = currentTabs.findIndex((tab) => tab.id === over.id);
        return arrayMove(currentTabs, oldIndex, newIndex);
      });
    }
  };

  const addTab = (): void => {
    setTabs([
      ...tabs,
      {
        label: `NewTab ${(tabs.length / 2 + 1).toString()}`,
        content: `Content for new tab ${(tabs.length / 2 + 1).toString()}.`,
        id: nanoid(),
      },
    ]);
  };

  const removeTab = (index: number): void => {
    const currentTabs = [...tabs]; // Create a copy of the current tabs
    const isRemovedTabActive = currentTabs[index]?.id === activeTabId; // Check if the removed tab is active

    // Remove the tab
    currentTabs.splice(index, 1);
    setTabs(currentTabs);

    if (isRemovedTabActive) {
      if (currentTabs.length === 0) {
        setActiveTabId(null); // No tabs left
      } else if (index === currentTabs.length) {
        // If the last tab was removed
        // Set the new last tab as active
        setActiveTabId(currentTabs[currentTabs.length - 1].id);
      } else {
        // Set the next tab as active
        setActiveTabId(currentTabs[index].id);
      }
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
        value={activeTabId.toString()}
        onValueChange={setActiveTabId}
        className="w-screen"
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
                    removeTab(index);
                  }}
                />
              </SortableItem>
            ))}
            <Button variant="ghost" onClick={addTab}>
              <Icon name="Plus" />
            </Button>
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

        {tabs.map((tab) => (
          <TabsContent
            key={tab.id}
            value={tab.label.toLowerCase().replace(/\s/g, "")}
          >
            {tab.content}
            {/* {tab.label === "Account" ? (
              <BlockEditor
                user={user}
                onChange={(content: string) => {
                  console.log("Change Detected:", content);
                }}
                content={null}
              />
            ) : (
              tab.content
            )} */}
          </TabsContent>
        ))}
      </Tabs>
    </DndContext>
  );
}
