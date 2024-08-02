import { arrayMove } from "@dnd-kit/sortable";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { nanoid } from "@/lib/utils";

export type TabTypes = "file" | "folder" | "story" | "flow";
export interface Tab {
  label: string;
  content: string | null;
  id: string;
  storyTitle: string;
  storyId: string;
  isRoot?: boolean;
  parentId?: string | null;
  type: TabTypes;
}

interface Group {
  id: string;
  tabs: Tab[];
  activeTabId: string | null;
}

interface TabsState {
  groups: Group[];
  activeGroupId?: string;
}

export interface TabsActions {
  addGroup: (groupId: string, initialTab: Tab) => void;
  closeGroup: (groupId: string) => void;
  addTab: (tab: Tab) => void;
  removeTab: (groupId: string, tabId: string) => void;
  removeTabFromAllGroups: (tabId: string) => void;
  setActiveTab: (groupId: string, tabId: string) => void;
  reorderTabs: (groupId: string, oldIndex: number, newIndex: number) => void;
  updateTabLabel: (groupId: string, tabId: string, label: string) => void;
  splitTab: (groupId: string) => void;
  setActiveGroup: (groupId: string) => void;
}

export type TabsStore = TabsState & TabsActions;

export const defaultInitState: TabsState = {
  groups: [],
};

export const createTabsStore = (initState: TabsState = defaultInitState) => {
  return create<TabsStore>()(
    devtools(
      persist(
        (set) => ({
          ...initState,
          addGroup: (groupId, initialTab) => {
            set((state) => ({
              groups: [
                ...state.groups,
                { id: groupId, tabs: [initialTab], activeTabId: initialTab.id },
              ],
            }));
          },
          closeGroup: (groupId) => {
            set((state) => ({
              groups: state.groups.filter((panel) => panel.id !== groupId),
            }));
          },
          addTab: (tab) => {
            set((state) => {
              let groupId = state.activeGroupId ?? state.groups[0]?.id;
              let newGroups = [...state.groups];

              if (!groupId) {
                // No group exists, create a new one
                groupId = nanoid();
                newGroups = [
                  {
                    id: groupId,
                    tabs: [],
                    activeTabId: null,
                  },
                ];
              }

              return {
                groups: newGroups.map((group) =>
                  group.id === groupId
                    ? {
                        ...group,
                        tabs: [...group.tabs, tab],
                        activeTabId: tab.id,
                      }
                    : group
                ),
                activeGroupId: groupId,
              };
            });
          },
          removeTab: (groupId, tabId) => {
            set((state) => {
              const updatedGroups = state.groups.map((panel) => {
                if (panel.id !== groupId) return panel;

                const updatedTabs = panel.tabs.filter(
                  (tab) => tab.id !== tabId
                );
                return {
                  ...panel,
                  tabs: updatedTabs,
                  activeTabId:
                    panel.activeTabId === tabId
                      ? updatedTabs[0]?.id ?? null
                      : panel.activeTabId,
                };
              });

              // Remove empty groups
              const filteredGroups = updatedGroups.filter(
                (group) => group.tabs.length > 0
              );

              return {
                groups: filteredGroups,
                activeGroupId:
                  filteredGroups.length > 0 ? state.activeGroupId : undefined,
              };
            });
          },
          removeTabFromAllGroups: (tabId: string) => {
            set((state) => {
              const updatedGroups = state.groups.map((group) => {
                const updatedTabs = group.tabs.filter(
                  (tab) => tab.id !== tabId
                );
                return {
                  ...group,
                  tabs: updatedTabs,
                  activeTabId:
                    group.activeTabId === tabId
                      ? updatedTabs[0]?.id ?? null
                      : group.activeTabId,
                };
              });

              // Remove empty groups
              const filteredGroups = updatedGroups.filter(
                (group) => group.tabs.length > 0
              );

              return {
                groups: filteredGroups,
                activeGroupId:
                  filteredGroups.length > 0 ? state.activeGroupId : undefined,
              };
            });
          },
          setActiveTab: (groupId, tabId) => {
            set((state) => ({
              groups: state.groups.map((panel) =>
                panel.id === groupId ? { ...panel, activeTabId: tabId } : panel
              ),
              activeGroupId: groupId,
            }));
          },
          updateTabLabel: (groupId, tabId, label) => {
            set((state) => ({
              groups: state.groups.map((panel) =>
                panel.id === groupId
                  ? {
                      ...panel,
                      tabs: panel.tabs.map((tab) =>
                        tab.id === tabId ? { ...tab, label } : tab
                      ),
                    }
                  : panel
              ),
            }));
          },
          reorderTabs: (
            groupId: string,
            oldIndex: number,
            newIndex: number
          ) => {
            set((state: TabsState & TabsActions) => ({
              groups: state.groups.map((panel) =>
                panel.id === groupId
                  ? {
                      ...panel,
                      tabs: arrayMove(panel.tabs, oldIndex, newIndex),
                    }
                  : panel
              ),
            }));
          },
          splitTab: (groupId: string) => {
            set((state) => {
              const sourceGroupIndex = state.groups.findIndex(
                (group) => group.id === groupId
              );
              if (sourceGroupIndex === -1) return state;

              const sourceGroup = state.groups[sourceGroupIndex];
              if (sourceGroup) {
                if (!sourceGroup.activeTabId) return state;

                const activeTab = sourceGroup.tabs.find(
                  (tab) => tab.id === sourceGroup.activeTabId
                );
                if (!activeTab) return state;

                const newGroupId = nanoid();
                const newGroup: Group = {
                  id: newGroupId,
                  tabs: [{ ...activeTab }],
                  activeTabId: activeTab.id,
                };

                const newGroups = [...state.groups];
                newGroups.splice(sourceGroupIndex + 1, 0, newGroup);

                return {
                  groups: newGroups,
                  activeGroupId: newGroupId,
                };
              }

              return state;
            });
          },
          setActiveGroup: (groupId: string) => {
            set({ activeGroupId: groupId });
          },
        }),
        {
          name: "tab-store",
        }
      )
    )
  );
};
