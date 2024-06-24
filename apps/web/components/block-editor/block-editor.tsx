"use client";

import { EditorContent, EditorContext, JSONContent } from "@tiptap/react";
import { useBlockEditor } from "./use-block-editor";

import React from "react";
import { TextMenu } from "../tiptap/text-menu";
import { ContentItemMenu } from "../tiptap/components/content-item-menu";
import ImageBlockMenu from "../tiptap/extensions/image-block/components/image-block-menu";
import { User } from "lucia";
import { Sidebar } from "../sidebar";
import { CharacterCountDisplay } from "../tiptap/extensions/characterCountDisplay";

interface BlockEditorProps {
  onChange: (content: string) => void;
  user: User | null;
  contentId?: string;
  content: JSONContent | string | null;
}

export const BlockEditor = ({
  user,
  onChange: handleOnChange,
  content,
  contentId,
}: BlockEditorProps) => {
  const { editor, tocSidebar } = useBlockEditor({
    onChange: (content: string) => {
      if (handleOnChange) {
        handleOnChange(content);
      }
    },
    user,
    contentId,
    initialContent: content,
  });

  const providerValue = React.useMemo(() => {
    return {
      editor,
    };
  }, []);

  const editorRef = React.useRef<HTMLDivElement | null>(null);
  const menuContainerRef = React.useRef(null);

  if (!editor) return null;

  return (
    <EditorContext.Provider value={providerValue}>
      <div className="flex flex-row border bg-neutral-900 h-full">
        <Sidebar
          isOpen={tocSidebar.isOpen}
          onClose={tocSidebar.close}
          editor={editor}
        />

        <div
          className="relative flex flex-col flex-1 h-full"
          ref={menuContainerRef}
        >
          <EditorContent
            editor={editor}
            ref={editorRef}
            className="flex-1 overflow-y-auto"
          />
          <ContentItemMenu editor={editor} />
          <TextMenu editor={editor} />

          <ImageBlockMenu editor={editor} appendTo={menuContainerRef} />
          <CharacterCountDisplay />
        </div>
      </div>
    </EditorContext.Provider>
  );
};
