import { memo, useCallback } from "react";
import { type Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";
import { TableOfContents } from "../table-of-contents/table-of-contents";

export const Sidebar = memo(
  ({
    editor,
    isOpen,
    onClose,
  }: {
    editor: Editor;
    isOpen?: boolean;
    onClose: () => void;
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
      isOpen && "w-80 border-r border-r-border"
    );

    return (
      <div className={windowClassName}>
        <div className="w-full h-full overflow-hidden">
          <div className="w-full h-full p-6 overflow-auto">
            <TableOfContents
              onItemClick={handlePotentialClose}
              editor={editor}
            />
          </div>
        </div>
      </div>
    );
  }
);

Sidebar.displayName = "TableOfContentSidepanel";
