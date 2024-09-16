"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { TableOfContentData } from "@tiptap-pro/extension-table-of-contents";

type UpdateToCItems = (tabId: string, items: TableOfContentData) => void;

interface ToCContextType {
  tocItems: Record<string, TableOfContentData>;
  updateToCItems: UpdateToCItems;
  getToCItems: (tabId: string) => TableOfContentData | undefined;
}

const ToCContext = createContext<ToCContextType | undefined>(undefined);

export function ToCProvider({ children }: { children: React.ReactNode }) {
  const [tocItems, setToCItems] = useState<Record<string, TableOfContentData>>(
    {},
  );

  const updateToCItems: UpdateToCItems = useCallback((tabId, items) => {
    setToCItems((prev) => ({
      ...prev,
      [tabId]: items,
    }));
  }, []);

  const getToCItems = useCallback(
    (tabId: string) => {
      return tocItems[tabId] ?? [];
    },
    [tocItems],
  );

  return (
    <ToCContext.Provider value={{ tocItems, updateToCItems, getToCItems }}>
      {children}
    </ToCContext.Provider>
  );
}

export const useToCContext = () => {
  const context = useContext(ToCContext);
  if (context === undefined) {
    throw new Error("useToCContext must be used within a ToCProvider");
  }
  return context;
};
