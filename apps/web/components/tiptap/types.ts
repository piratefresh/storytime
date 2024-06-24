import React from "react";
import { Editor as CoreEditor } from "@tiptap/core";
import { Editor } from "@tiptap/react";
import { EditorState } from "@tiptap/pm/state";
import { EditorView } from "@tiptap/pm/view";

export interface MenuProps {
  appendTo?: React.RefObject<any>;
  shouldHide?: boolean;
  editor: Editor;
}

export interface ShouldShowProps {
  editor?: CoreEditor;
  view: EditorView;
  state?: EditorState;
  oldState?: EditorState;
  from?: number;
  to?: number;
}
