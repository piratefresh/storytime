"use client";

import { EditorContent, EditorContext, type JSONContent } from "@tiptap/react";
import React from "react";
import { type User } from "lucia";
import ImageBlockMenu from "../tiptap/extensions/image-block/components/image-block-menu";
import { ContentItemMenu } from "../tiptap/components/content-item-menu";
import { TextMenu } from "../tiptap/text-menu";
import { CharacterCountDisplay } from "../tiptap/extensions/characterCountDisplay";
import { Sidebar } from "../sidebar";
import { useBlockEditor } from "./use-block-editor";
import { useTabsStore } from "@/app/stores/tabs-provider";

interface BlockEditorProps {
  onChange: (
    content: JSONContent | string | null,
    plainTextContent: string
  ) => void;
  user: User;
  contentId?: string;
  content: JSONContent | string | null;
  storyId: string;
}

export function BlockEditor({
  user,
  onChange: handleOnChange,
  content,
  contentId,
  storyId,
}: BlockEditorProps): JSX.Element | null {
  const updateTabContent = useTabsStore((state) => state.updateTabContent);
  const { editor, tocSidebar } = useBlockEditor({
    onChange: (jsonContent, plainText) => {
      handleOnChange(jsonContent, plainText);
      updateTabContent({ tabId: contentId, content: jsonContent });
    },
    user,
    contentId,
    initialContent: content,
    storyId,
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
      <div className="flex flex-row h-full">
        <Sidebar isOpen={true} onClose={tocSidebar.close} editor={editor} />

        <div className="flex flex-col h-full w-full" ref={menuContainerRef}>
          <EditorContent
            className="flex-1 overflow-y-auto"
            editor={editor}
            ref={editorRef}
          />
          <ContentItemMenu editor={editor} />
          <TextMenu editor={editor} />

          <ImageBlockMenu editor={editor} appendTo={menuContainerRef} />
          <CharacterCountDisplay editor={editor} />
        </div>
      </div>
    </EditorContext.Provider>
  );
}
