"use client";

import { Fragment } from "react";
import { useTabsStore } from "@/app/stores/tabs-provider";
import { type Tab } from "@/app/stores/tabs-store";
import { FileTabs } from "@/components/file-tabs/file-tabs";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { type User } from "@repo/db";
import { nanoid } from "nanoid";

import { StoryWithFolder } from "../../actions/get-story";

export function GroupPanel({
  story,
  user,
}: {
  story: StoryWithFolder;
  user: User;
}): JSX.Element {
  const groups = useTabsStore((state) => state.groups);

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
    state.groups.find((g) => g.id === groupId),
  );
  const activeGroupId = useTabsStore((state) => state.activeGroupId);
  const addTab = useTabsStore((state) => state.addTab);
  const removeTab = useTabsStore((state) => state.removeTab);
  const setActiveTab = useTabsStore((state) => state.setActiveTab);
  const reorderTabs = useTabsStore((state) => state.reorderTabs);
  const splitTab = useTabsStore((state) => state.splitTab);

  if (!group) return null;

  const activeTabId = group.activeTabId;
  const tabs = group.tabs;

  const handleSplitTab = () => {
    splitTab(group.id);
  };
  const handleAddFlowTab = () => {
    const tab: Tab = {
      label: `Graph: ${story.title} - ${new Date().toLocaleTimeString()}`,
      content: {},
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
        activeTabId={activeTabId}
        groupId={group.id}
        isActiveGroup={activeGroupId === group.id}
        story={story}
        tabs={tabs}
        user={user}
        onAddGraphTab={handleAddFlowTab}
        onRemoveTab={removeTab}
        onReorderTabs={reorderTabs}
        onSetActiveTab={setActiveTab}
        onSplitTab={handleSplitTab}
      />
    </ResizablePanel>
  );
}
