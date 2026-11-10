import React from "react";
import { type Editor } from "@tiptap/core";
import { type CharacterCountStorage } from "@tiptap/extension-character-count";

export function CharacterCountDisplay({
  editor,
}: {
  editor: Editor;
}): React.JSX.Element | null {
  const characterCount = editor.storage.characterCount as
    | CharacterCountStorage
    | undefined;

  if (!characterCount) {
    return null; // or return null or any placeholder
  }

  return (
    <div className="flex gap-8 text-sm leading-none p-2 bg-neutral-900 border-t border-b border-border">
      <div> {characterCount.characters()} characters</div>

      <div> {characterCount.words()} words</div>
    </div>
  );
}
