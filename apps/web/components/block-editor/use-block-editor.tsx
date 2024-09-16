import { RefObject, useState } from "react";
import { useSidebar } from "@/hooks/useSidebar";
import { User } from "@repo/db";
import { TableOfContentData } from "@tiptap-pro/extension-table-of-contents";
import { type EditorProps } from "@tiptap/pm/view";
import { useEditor, type JSONContent } from "@tiptap/react";

import { Extensions } from "../tiptap/extensions/extensions";

interface BlockEditorProps {
  onChange: (content: JSONContent | null, plainTextContent: string) => void;
  user: User;
  contentId?: string;
  initialContent?: JSONContent | null;
  storyId: string;
  onToCChange: (items: TableOfContentData) => void;
}

const editorProps: EditorProps = {
  attributes: {
    class:
      "prose prose-sm prose-slate mx-auto pl-20 max-w-none min-h-full bg-neutral-900 lg:prose-sm focus:outline-none dark:prose-invert",
  },
  handleDOMEvents: {
    keydown: (_view, event) => {
      // prevent default event listeners from firing when slash command is active
      if (["ArrowUp", "ArrowDown", "Enter"].includes(event.key)) {
        const slashCommand = document.querySelector("#slash-command");
        console.log("slashCommand", slashCommand);
        if (slashCommand) {
          return true;
        }
      }
    },
  },
};

export const useBlockEditor = ({
  onChange,
  user,
  contentId,
  initialContent,
  storyId,
  onToCChange,
}: BlockEditorProps) => {
  const tocSidebar = useSidebar();

  const editor = useEditor({
    editorProps,
    extensions: [
      ...Extensions({
        userId: user.id,
        contentId,
        storyId,
        onToCChange,
      }),
    ],
    content: initialContent ?? undefined,
    onUpdate: ({ editor: instanceEditor }) => {
      onChange(instanceEditor.getJSON(), instanceEditor.getText());
    },
  });

  const characterCount: {
    characters: () => number;
    words: () => number;
  } = editor?.storage.characterCount || {
    characters: () => 0,
    words: () => 0,
  };

  return {
    editor,
    characterCount,
    tocSidebar,
  };
};
