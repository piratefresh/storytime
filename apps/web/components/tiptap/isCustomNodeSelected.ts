import CharacterCount from '@tiptap/extension-character-count';
import { Editor } from '@tiptap/react';

import { GenerateText } from './extensions/generateText';
import CustomImage from './extensions/image';
import ImageBlock from './extensions/image-block/image-block';
import { Image } from './extensions/image/image';
import { CustomTooltipNode, Link } from './extensions/node-link';
import { PageBreak } from './extensions/page-break';

export const isTableGripSelected = (node: HTMLElement) => {
  let container = node;

  while (container && !['TD', 'TH'].includes(container.tagName)) {
    container = container.parentElement!;
  }

  const gripColumn =
    container &&
    container.querySelector &&
    container.querySelector('a.grip-column.selected');
  const gripRow =
    container &&
    container.querySelector &&
    container.querySelector('a.grip-row.selected');

  if (gripColumn || gripRow) {
    return true;
  }

  return false;
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
    Image.name,
  ];

  return (
    customNodes.some((type) => editor.isActive(type)) ||
    isTableGripSelected(node)
  );
};

export default isCustomNodeSelected;
