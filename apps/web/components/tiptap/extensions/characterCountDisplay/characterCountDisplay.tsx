import React from "react";
import { type Editor } from "@tiptap/core";

export const CharacterCountDisplay = ({
  editor,
}: {
  editor: Editor;
}): JSX.Element | null => {
  if (!editor.storage.characterCount) {
    return null; // or return null or any placeholder
  }

  return (
    <div className="fixed bottom-0 flex w-full gap-8 border-b border-t border-border bg-neutral-900 p-2 text-sm leading-none">
      <div>{editor.storage.characterCount.characters()} characters</div>

      <div>{editor.storage.characterCount.words()} words</div>
    </div>
  );
};
