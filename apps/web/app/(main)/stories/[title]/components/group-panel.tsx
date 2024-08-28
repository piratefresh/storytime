"use client";

import { Fragment } from "react";
import { type User } from "@repo/db";
import { nanoid } from "nanoid";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { FileTabs } from "@/components/file-tabs/file-tabs";
import { useTabsStore } from "@/app/stores/tabs-provider";
import { type Tab } from "@/app/stores/tabs-store";
import { type StoryWithFolder } from "../page";

export function GroupPanel({
  story,
  user,
}: {
  story: StoryWithFolder;
  user: User;
}): JSX.Element {
  const groups = useTabsStore((state) => state.groups);
  console.log("story: ", story);
  return (
    <ResizablePanelGroup direction="horizontal">
      {groups.map((group, index) => (
        <Fragment key={group.id}>
          {index > 0 && <ResizableHandle />}
          <EditorPanel groupId={group.id} user={user} story={story} />
        </Fragment>
      ))}
    </ResizablePanelGroup>
  );
}

export function EditorPanel({
  groupId,
  user,
  story,
}: {
  groupId: string;
  user: User;
  story: StoryWithFolder;
}): JSX.Element | null {
  const group = useTabsStore((state) =>
    state.groups.find((g) => g.id === groupId)
  );
  const activeGroupId = useTabsStore((state) => state.activeGroupId);
  const addTab = useTabsStore((state) => state.addTab);
  const removeTab = useTabsStore((state) => state.removeTab);
  const setActiveTab = useTabsStore((state) => state.setActiveTab);
  const reorderTabs = useTabsStore((state) => state.reorderTabs);
  const splitTab = useTabsStore((state) => state.splitTab);
  const setActiveGroup = useTabsStore((state) => state.setActiveGroup);
  if (!group) return null;

  const activeTabId = group.activeTabId;
  const tabs = group.tabs;

  const handleSplitTab = () => {
    splitTab(group.id);
  };
  const handleAddFlowTab = () => {
    const tab: Tab = {
      label: `Graph: ${story.title} - ${new Date().toLocaleTimeString()}`,
      content: "",
      id: nanoid(),
      storyTitle: story.title,
      storyId: story.id,
      isRoot: false,
      parentId: null,
      type: "flow",
    };
    addTab(tab);
  };

  return (
    <ResizablePanel>
      <FileTabs
        groupId={group.id}
        onSplitTab={handleSplitTab}
        onRemoveTab={removeTab}
        onSetActiveTab={setActiveTab}
        onReorderTabs={reorderTabs}
        onSetActiveGroup={setActiveGroup}
        onAddGraphTab={handleAddFlowTab}
        isActiveGroup={activeGroupId === group.id}
        tabs={tabs}
        activeTabId={activeTabId}
        user={user}
        story={story}
      />
    </ResizablePanel>
  );
}
