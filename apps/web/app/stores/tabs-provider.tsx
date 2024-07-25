"use client";

import { type ReactNode, createContext, useRef, useContext } from "react";
import { useStore } from "zustand";
import { type TabsStore, createTabsStore } from "./tabs-store";

export type TabsStoreApi = ReturnType<typeof createTabsStore>;

export const TabsStoreContext = createContext<TabsStoreApi | undefined>(
  undefined
);

export interface TabsStoreProviderProps {
  children: ReactNode;
}

export function TabsStoreProvider({
  children,
}: TabsStoreProviderProps): JSX.Element {
  const storeRef = useRef<TabsStoreApi>();
  if (!storeRef.current) {
    storeRef.current = createTabsStore();
  }

  return (
    <TabsStoreContext.Provider value={storeRef.current}>
      {children}
    </TabsStoreContext.Provider>
  );
}

export const useTabsStore = <T,>(selector: (store: TabsStore) => T): T => {
  const context = useContext(TabsStoreContext);

  if (!context) {
    throw new Error(`useTabsStore must be used within TabsStoreProvider`);
  }

  return useStore(context, selector);
};
