"use client";

import { memo } from "react";
import { useTabsStore } from "@/app/stores/tabs-provider";
import { useEditorInstance } from "@/components/editor-provider";
import { ToC } from "@/components/table-of-contents/toc";
import { useToCContext } from "@/components/toc-provider";

const MemorizedToC = memo(ToC);

export function ToCTab() {
  const { editor, editorContentRef } = useEditorInstance();
  const activeTab = useTabsStore((state) => state.getActiveTab());
  const { getToCItems } = useToCContext();

  if (!activeTab) return <div>Please select a file first</div>;
  const tocItems = getToCItems(activeTab.id) ?? [];

  console.log("editpor: ", editor);
  return (
    <>
      {editor && editorContentRef ? (
        <MemorizedToC
          editor={editor}
          editorRef={editorContentRef}
          items={tocItems}
        />
      ) : (
        <div>editor and editorcontent ref not found</div>
      )}
    </>
  );
}
