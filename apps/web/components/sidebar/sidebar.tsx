import { memo, MutableRefObject, useCallback } from "react";
import { cn } from "@/lib/utils";
import { TableOfContentData } from "@tiptap-pro/extension-table-of-contents";
import { type Editor } from "@tiptap/react";

import { TableOfContents } from "../table-of-contents/table-of-contents";
import { ToC } from "../table-of-contents/toc";

const MemorizedToC = memo(ToC);

export const Sidebar = memo(
  ({
    editor,
    isOpen,
    onClose,
    toCItems,
    editorRef,
  }: {
    contentId: string;
    editor: Editor;
    isOpen?: boolean;
    onClose: () => void;
    toCItems: TableOfContentData;
    editorRef: MutableRefObject<HTMLDivElement | null>;
  }) => {
    const handlePotentialClose = useCallback(() => {
      if (window.innerWidth < 1024) {
        onClose();
      }
    }, [onClose]);

    const windowClassName = cn(
      "absolute top-0 left-0 bg-white lg:bg-white/30 lg:backdrop-blur-xl h-full lg:h-auto lg:relative w-0 duration-300 transition-all",
      "dark:bg-neutral-800 lg:dark:bg-neutral-800",
      !isOpen && "border-r-transparent",
      isOpen && "w-80 border-r border-r-border",
    );

    return (
      <div className={windowClassName}>
        <div className="h-full w-full overflow-hidden">
          <div className="h-full w-full overflow-auto p-6">
            <MemorizedToC
              editor={editor}
              items={toCItems}
              editorRef={editorRef}
            />
          </div>
        </div>
      </div>
    );
  },
);

Sidebar.displayName = "TableOfContentSidepanel";
