import React from "react";
import { useCurrentEditor } from "@tiptap/react";

export function CharacterCountDisplay() {
  const { editor } = useCurrentEditor();

  if (!editor || !editor.storage.characterCount) {
    return <div>Loading...</div>; // or return null or any placeholder
  }

  return (
    <>
      <div className="flex gap-8 justify-end text-sm">
        <div> {editor.storage.characterCount.characters()} characters</div>

        <div> {editor.storage.characterCount.words()} words</div>
      </div>
    </>
  );
}
