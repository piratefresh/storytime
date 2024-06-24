import DragHandle from "@tiptap-pro/extension-drag-handle-react";
import { Editor, useCurrentEditor } from "@tiptap/react";

import { useEffect, useState } from "react";
import { Toolbar } from "@/components/ui/toolbar";
import { Icon } from "@/components/ui/icon";
import { useData } from "./hooks/use-data";
import useContentItemActions from "./hooks/use-content-item-actions";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export type ContentItemMenuProps = {
  editor: Editor;
};

export const ContentItemMenu = ({ editor }: ContentItemMenuProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const data = useData();
  const actions = useContentItemActions(
    editor,
    data.currentNode,
    data.currentNodePos
  );

  useEffect(() => {
    if (menuOpen) {
      editor.commands.setMeta("lockDragHandle", true);
    } else {
      editor.commands.setMeta("lockDragHandle", false);
    }
  }, [editor, menuOpen]);

  return (
    <DragHandle
      pluginKey="ContentItemMenu"
      editor={editor}
      onNodeChange={data.handleNodeChange}
      tippyOptions={{
        offset: [-2, 16],
        zIndex: 99,
      }}
    >
      <div className="flex items-center gap-0.5">
        <Toolbar.Button onClick={actions.handleAdd}>
          <Icon name="Plus" />
        </Toolbar.Button>
        <Popover open={menuOpen} onOpenChange={setMenuOpen}>
          <PopoverTrigger asChild>
            <Toolbar.Button>
              <Icon name="GripVertical" />
            </Toolbar.Button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" sideOffset={8}>
            <div className="p-2 flex flex-col min-w-[16rem]">
              <PopoverClose>
                <DropdownMenuItem onClick={actions.resetTextFormatting}>
                  <Icon name="RemoveFormatting" />
                  Clear formatting
                </DropdownMenuItem>
              </PopoverClose>
              <PopoverClose>
                <DropdownMenuItem onClick={actions.copyNodeToClipboard}>
                  <Icon name="Clipboard" />
                  Copy to clipboard
                </DropdownMenuItem>
              </PopoverClose>
              <PopoverClose>
                <DropdownMenuItem onClick={actions.duplicateNode}>
                  <Icon name="Copy" />
                  Duplicate
                </DropdownMenuItem>
              </PopoverClose>
              <Toolbar.Divider horizontal />
              <PopoverClose>
                <DropdownMenuItem
                  onClick={actions.deleteNode}
                  className="text-red-500 bg-red-500 dark:text-red-500 hover:bg-red-500 dark:hover:text-red-500 dark:hover:bg-red-500 bg-opacity-10 hover:bg-opacity-20 dark:hover:bg-opacity-20"
                >
                  <Icon name="Trash2" />
                  Delete
                </DropdownMenuItem>
              </PopoverClose>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </DragHandle>
  );
};
