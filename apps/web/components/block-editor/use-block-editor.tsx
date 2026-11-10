import { type JSONContent, useEditor } from "@tiptap/react";
import { type EditorProps } from "@tiptap/pm/view";
import { type User } from "lucia";
import { useSidebar } from "@/hooks/use-sidebar";
import { Extensions } from "../tiptap/extensions/extensions";

interface BlockEditorProps {
  onChange: (
    content: JSONContent | string | null,
    plainTextContent: string
  ) => void;
  user: User;
  contentId?: string;
  initialContent?: JSONContent | string | null;
  storyId: string;
}

const editorProps: EditorProps = {
  attributes: {
    class:
      "prose prose-sm prose-slate mx-auto pl-20 max-w-none min-h-full flex-1 bg-neutral-900 lg:prose-sm focus:outline-none dark:prose-invert",
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
}: BlockEditorProps) => {
  const tocSidebar = useSidebar();

  const editor = useEditor({
    editorProps,
    extensions: [...Extensions({ userId: user.id, contentId, storyId })],
    content: initialContent ?? undefined,
    onUpdate: ({ editor: instanceEditor }) => {
      onChange(instanceEditor.getJSON(), instanceEditor.getText());
    },
  });

  const characterCount = (editor?.storage.characterCount as
    | { characters: () => number; words: () => number }
    | undefined) ?? {
    characters: () => 0,
    words: () => 0,
  };

  return {
    editor,
    characterCount,
    tocSidebar,
  };
};
