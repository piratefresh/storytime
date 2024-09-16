"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useTabsStore } from "@/app/stores/tabs-provider";
import { User } from "@repo/db";
import { TableOfContentData } from "@tiptap-pro/extension-table-of-contents";
import { EditorContent, EditorContext, type JSONContent } from "@tiptap/react";

import { useEditorInstance } from "../editor-provider";
import { ContentItemMenu } from "../tiptap/components/content-item-menu";
import { CharacterCountDisplay } from "../tiptap/extensions/characterCountDisplay";
import ImageBlockMenu from "../tiptap/extensions/image-block/components/image-block-menu";
import { TextMenu } from "../tiptap/text-menu";
import { useToCContext } from "../toc-provider";
import { useBlockEditor } from "./use-block-editor";

interface BlockEditorProps {
  onChange: (content: JSONContent, plainTextContent: string) => void;
  user: User;
  contentId?: string;
  content: JSONContent;
  storyId: string;
  isActive?: boolean;
}

export function BlockEditor({
  isActive = false,
  user,
  onChange: handleOnChange,
  content,
  contentId,
  storyId,
}: BlockEditorProps): JSX.Element | null {
  const updateTabContent = useTabsStore((state) => state.updateTabContent);
  const { updateToCItems, getToCItems } = useToCContext();
  const { setEditor, editorContentRef } = useEditorInstance();
  const menuContainerRef = useRef(null);

  const { editor, tocSidebar } = useBlockEditor({
    onChange: (jsonContent, plainText) => {
      if (!jsonContent || !plainText || !contentId) return;
      handleOnChange(jsonContent, plainText);
      updateTabContent({ tabId: contentId, content: jsonContent });
    },
    onToCChange: (items) =>
      contentId ? updateToCItems(contentId, items) : null,
    user,
    contentId,
    initialContent: content,
    storyId,
  });

  const providerValue = useMemo(() => {
    return {
      editor,
    };
  }, [editor]);

  useEffect(() => {
    if (editor) {
      console.log("setting editor in BlockEditor");
      setEditor(editor);
    }
  }, [editor, setEditor]);

  useEffect(() => {
    if (isActive) {
      editor?.commands.focus();
    }
  }, [isActive, editor]);

  if (!editor) return null;

  const toCItems = contentId ? getToCItems(contentId) : [];

  return (
    <EditorContext.Provider value={providerValue}>
      <div className="flex h-full flex-row" ref={menuContainerRef}>
        <div className="relative flex h-full flex-1 flex-col overflow-hidden">
          <EditorContent
            ref={editorContentRef}
            className="mb-[70px] flex-1 overflow-y-auto"
            editor={editor}
          />
          <ContentItemMenu editor={editor} />
          <TextMenu editor={editor} />
          <ImageBlockMenu appendTo={menuContainerRef} editor={editor} />
          <CharacterCountDisplay editor={editor} />
        </div>
      </div>
    </EditorContext.Provider>
  );
}
