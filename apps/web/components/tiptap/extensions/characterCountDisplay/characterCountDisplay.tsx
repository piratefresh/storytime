import React from "react";
import { type Editor } from "@tiptap/core";

export function CharacterCountDisplay({
  editor,
}: {
  editor: Editor;
}): JSX.Element | null {
  if (!editor.storage.characterCount) {
    return null; // or return null or any placeholder
  }

  return (
    <div className="flex gap-8 text-sm leading-none p-2 bg-neutral-900 border-t border-b border-border">
      <div> {editor.storage.characterCount.characters()} characters</div>

      <div> {editor.storage.characterCount.words()} words</div>
    </div>
  );
}
