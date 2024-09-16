"use client";

import {
  createContext,
  MutableRefObject,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { type Editor } from "@tiptap/core";

interface EditorContextType {
  setEditor: (editor: Editor | null) => void;
  editor: Editor | null;
  editorContentRef: MutableRefObject<HTMLDivElement | null> | null;
}

export const EditorContext = createContext<EditorContextType>({
  setEditor: () => null,
  editor: null,
  editorContentRef: null,
});

export function EditorProvider({ children }: { children: ReactNode }) {
  const [editor, setEditorState] = useState<Editor | null>(null);
  const editorContentRef = useRef<HTMLDivElement | null>(null);

  const setEditor = useCallback((newEditor: Editor | null) => {
    setEditorState(newEditor);
  }, []);

  const contextValue = useMemo(
    () => ({
      setEditor,
      editor,
      editorContentRef,
    }),
    [setEditor, editor, editorContentRef],
  );

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  );
}

export const useEditorInstance = () => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error("useEditorInstance must be used within a EditorProvider");
  }
  return context;
};
