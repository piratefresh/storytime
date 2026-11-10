import { type Editor } from "@tiptap/react";
import { useCallback } from "react";
import { type ShouldShowProps } from "../types";
import isCustomNodeSelected from "../is-custom-node-selected";
import isTextSelected from "../is-text-selected";

const stringAttr = (value: unknown) =>
  typeof value === "string" && value ? value : undefined;

export const useTextmenuStates = (editor: Editor) => {
  const shouldShow = useCallback(
    ({ view, from }: ShouldShowProps) => {
      const domAtPos = view.domAtPos(from ?? 0).node as HTMLElement;
      const nodeDOM = view.nodeDOM(from ?? 0) as HTMLElement | null;
      const node = nodeDOM ?? domAtPos;

      if (isCustomNodeSelected(editor, node)) {
        return false;
      }

      return isTextSelected({ editor });
    },
    [editor]
  );

  return {
    isBold: editor.isActive("bold"),
    isItalic: editor.isActive("italic"),
    isStrike: editor.isActive("strike"),
    isUnderline: editor.isActive("underline"),
    isCode: editor.isActive("code"),
    isSubscript: editor.isActive("subscript"),
    isSuperscript: editor.isActive("superscript"),
    isAlignLeft: editor.isActive({ textAlign: "left" }),
    isAlignCenter: editor.isActive({ textAlign: "center" }),
    isAlignRight: editor.isActive({ textAlign: "right" }),
    isAlignJustify: editor.isActive({ textAlign: "justify" }),
    currentColor: stringAttr(editor.getAttributes("textStyle").color),
    currentHighlight: stringAttr(editor.getAttributes("highlight").color),
    currentFont: stringAttr(editor.getAttributes("textStyle").fontFamily),
    currentSize: stringAttr(editor.getAttributes("textStyle").fontSize),
    shouldShow,
  };
};
