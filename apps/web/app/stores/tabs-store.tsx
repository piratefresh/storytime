import { arrayMove } from "@dnd-kit/sortable";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export type TabTypes = "file" | "folder" | "story";
interface Tab {
  label: string;
  content: string | null;
  id: string;
  storyTitle: string;
  storyId: string;
  isRoot?: boolean;
  parentId?: string | null;
  type: TabTypes;
}

export interface TabsState {
  tabs: Tab[];
  activeTabId: string | null;
}

export interface TabsActions {
  addTab: ({
    label,
    fileId,
    storyTitle,
    storyId,
    isRoot,
    parentId,
    type,
  }: {
    label: string;
    fileId: string;
    storyTitle: string;
    storyId: string;
    isRoot?: boolean;
    parentId?: string | null;
    type: TabTypes;
  }) => void;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  reorderTabs: (oldIndex: number, newIndex: number) => void;
  updateTabLabel: ({ id, label }: { id: string; label: string }) => void;
}

export type TabsStore = TabsState & TabsActions;

export const defaultInitState: TabsState = {
  tabs: [],
  activeTabId: null,
};

export const createTabsStore = (initState: TabsState = defaultInitState) => {
  return create<TabsStore>()(
    devtools(
      persist(
        (set) => ({
          ...initState,
          addTab: ({
            label,
            fileId,
            storyId,
            storyTitle,
            isRoot = false,
            parentId,
            type,
          }) => {
            set((state: TabsState & TabsActions) => {
              const existingTab = state.tabs.find((tab) => tab.id === fileId);
              if (existingTab) {
                return { activeTabId: fileId };
              }
              const newTab: Tab = {
                label,
                content: null,
                id: fileId,
                storyId,
                storyTitle,
                isRoot,
                parentId,
                type,
              };
              return {
                tabs: [...state.tabs, newTab],
                activeTabId: fileId,
              };
            });
          },
          removeTab: (id: string) => {
            set((state: TabsState & TabsActions) => ({
              tabs: state.tabs.filter((tab) => tab.id !== id),
              activeTabId:
                state.activeTabId === id
                  ? state.tabs[0]?.id ?? null
                  : state.activeTabId,
            }));
          },
          updateTabLabel: ({ id, label }) => {
            console.log("id: ", id);
            console.log("label: ", label);
            set((state: TabsState & TabsActions) => {
              console.log("state: ", state);
              return {
                tabs: state.tabs.map((tab) =>
                  tab.id === id ? { ...tab, label } : tab
                ),
              };
            });
          },
          setActiveTab: (id: string) => {
            set({ activeTabId: id });
          },
          reorderTabs: (oldIndex: number, newIndex: number) => {
            set((state: TabsState & TabsActions) => ({
              tabs: arrayMove(state.tabs, oldIndex, newIndex),
            }));
          },
        }),
        {
          name: "tab-store",
        }
      )
    )
  );
};
