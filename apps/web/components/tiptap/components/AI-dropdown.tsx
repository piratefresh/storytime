"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Toolbar } from "@/components/ui/toolbar";
import { Selection } from "@tiptap/pm/state";
import { Editor } from "@tiptap/react";
import React from "react";
import { useTextmenuCommands } from "../hooks/useTextmenuCommands";
import { generate } from "@/app/actions/ai/generateText";
import { CoreMessage } from "ai";
import { readStreamableValue } from "ai/rsc";
import { Markdown } from "tiptap-markdown";

const getTextFromSelection = (editor: Editor) => {
  if (!editor || !editor.state.selection) {
    return ""; // Return empty string if no editor or no selection
  }

  const { from, to } = editor.state.selection;
  // Check if there's an actual range selected, otherwise from and to will be the same
  if (from === to) {
    return ""; // Return empty string if no range is selected
  }

  // Retrieve the text between the from and to positions in the document
  // const text = editor.state.doc.textBetween(from, to, " ");

  const slice = editor.state.selection.content();

  const text = editor.storage.markdown.serializer.serialize(slice.content);

  return text;
};

export function AIDropdown({
  container,
  editor,
}: {
  container: HTMLDivElement | null;
  editor: Editor;
}) {
  const [storedSelection, setStoredSelection] =
    React.useState<Selection | null>(null);
  const [conversation, setConversation] = React.useState<CoreMessage[]>([]);
  const [generation, setGeneration] = React.useState<string>("");

  // Log the current stored selection for debugging

  const handleMouseDown = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevents event from bubbling up to elements that might handle it further (like your editor)

    // Get the current selected text when the mouse is pressed on the input
    const currentText = getTextFromSelection(editor);

    // Check if the editor has a current selection and store it
    if (editor && !storedSelection) {
      setStoredSelection(editor.state.selection);
    }
  };

  const handleKeyDown = async (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      const currentText = getTextFromSelection(editor);
      const inputValue = event.currentTarget.value;

      const prompt = `
            DOCUMENTS:
            ${editor.storage.markdown.getMarkdown()}
            ---
            PROMPT:
            ${inputValue}
            ---
            OVERRIDE:
            ${currentText}
     
          `;

      const { output } = await generate(prompt);
      let textContent = "";

      for await (const delta of readStreamableValue(output)) {
        textContent = `${textContent}${delta}`;

        editor.commands.generateText(textContent);
        setGeneration(textContent);
      }
      const selection = editor.view.state.selection;
      editor
        .chain()
        .focus()
        .insertContentAt(
          {
            from: selection.from,
            to: selection.to,
          },
          textContent
        )
        .run();
      console.log("textContent: ", textContent);
    }
  };

  return (
    <DropdownMenu modal={false} open>
      <DropdownMenuTrigger asChild>
        <Toolbar.Button
          className="text-purple-500 hover:text-purple-600 active:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300 dark:active:text-purple-400"
          activeClassname="text-purple-600 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-200"
        >
          <Icon name="Sparkles" className="mr-1" />
          AI Tools
          <Icon name="ChevronDown" className="w-2 h-2 ml-1" />
        </Toolbar.Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-black"
        side="top"
        align="end"
        alignOffset={-135}
        portalProps={{ container }}
      >
        <Input
          className="bg-black w-60"
          onMouseDown={handleMouseDown}
          onKeyDown={handleKeyDown}
          placeholder="Prompt"
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
