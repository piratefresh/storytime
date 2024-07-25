import { arrayMove } from "@dnd-kit/sortable";
import { devtools, persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";

interface Tab {
  label: string;
  content: string | null;
  id: string;
}

export interface TabsState {
  tabs: Tab[];
  activeTabId: string | null;
}

export interface TabsActions {
  addTab: (label: string, id: string) => void;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  reorderTabs: (oldIndex: number, newIndex: number) => void;
}
export type TabsStore = TabsState & TabsActions;

export const defaultInitState: TabsState = {
  tabs: [],
  activeTabId: null,
};

export const createTabsStore = (initState: TabsState = defaultInitState) => {
  return createStore<TabsStore>()(
    devtools(
      persist(
        (set) => ({
          ...initState,
          addTab: (label: string, id: string) => {
            set((state) => {
              const existingTab = state.tabs.find((tab) => tab.id === id);
              if (existingTab) {
                return { activeTabId: id };
              }
              const newTab = { label, content: null, id };
              return {
                tabs: [...state.tabs, newTab],
                activeTabId: id,
              };
            });
          },
          removeTab: (id: string) => {
            set((state) => ({
              tabs: state.tabs.filter((tab) => tab.id !== id),
              activeTabId:
                state.activeTabId === id
                  ? state.tabs[0]?.id ?? null
                  : state.activeTabId,
            }));
          },
          setActiveTab: (id: string) => {
            set({ activeTabId: id });
          },
          reorderTabs: (oldIndex: number, newIndex: number) => {
            set((state) => ({
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
