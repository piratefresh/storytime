import React from "react";
import { useCurrentEditor } from "@tiptap/react";

export function CharacterCountDisplay() {
  const { editor } = useCurrentEditor();

  if (!editor || !editor.storage.characterCount) {
    return null; // or return null or any placeholder
  }

  return (
    <div className="flex gap-8 text-sm p-2 border-t border-border">
      <div> {editor.storage.characterCount.characters()} characters</div>

      <div> {editor.storage.characterCount.words()} words</div>
    </div>
  );
}
