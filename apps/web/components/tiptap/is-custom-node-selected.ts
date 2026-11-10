import { type Editor } from "@tiptap/react";
import CharacterCount from "@tiptap/extension-character-count";
import { CustomTooltipNode, Link } from "./extensions/node-link";
import { PageBreak } from "./extensions/page-break";
import { GenerateText } from "./extensions/generate-text";
import CustomImage from "./extensions/image";
import ImageBlock from "./extensions/image-block/image-block";
import ImageUpload from "./extensions/document/image-upload/image-upload";
import { Image } from "./extensions/image/image";

export const isTableGripSelected = (node: HTMLElement) => {
  let container: HTMLElement | null = node;

  while (container && !["TD", "TH"].includes(container.tagName)) {
    container = container.parentElement;
  }

  const gripColumn = container?.querySelector("a.grip-column.selected");
  const gripRow = container?.querySelector("a.grip-row.selected");

  return Boolean(gripColumn) || Boolean(gripRow);
};

export const isCustomNodeSelected = (editor: Editor, node: HTMLElement) => {
  const customNodes = [
    CustomTooltipNode.name,
    PageBreak.name,
    CharacterCount.name,
    GenerateText.name,
    Link.name,
    CustomImage.name,
    ImageBlock.name,
    ImageUpload.name,
    Image.name,
  ];

  return (
    customNodes.some((type) => editor.isActive(type)) ||
    isTableGripSelected(node)
  );
};

export default isCustomNodeSelected;
