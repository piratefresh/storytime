import { table } from "console";
import { useUploadImage } from "@/hooks/use-upload-image";
import { findSuggestionMatch } from "@/lib/editor/findSuggestionMatch";
import { FileHandler } from "@tiptap-pro/extension-file-handler";
import {
  getHierarchicalIndexes,
  TableOfContentData,
  TableOfContents,
  TableOfContentsStorage,
} from "@tiptap-pro/extension-table-of-contents";
import CharacterCount from "@tiptap/extension-character-count";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Color from "@tiptap/extension-color";
import Dropcursor from "@tiptap/extension-dropcursor";
import FontFamily from "@tiptap/extension-font-family";
import Highlight from "@tiptap/extension-highlight";
import Table from "@tiptap/extension-table";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Typography from "@tiptap/extension-typography";
import { Underline } from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import { SuggestionMatch, Trigger } from "@tiptap/suggestion";
import { common, createLowlight } from "lowlight";
import { User } from "lucia";
import AutoJoiner from "tiptap-extension-auto-joiner";
import GlobalDragHandle from "tiptap-extension-global-drag-handle";
import { Markdown } from "tiptap-markdown";

import { CodeBlock } from "./code-block/code-block";
import { Document } from "./document";
import { Float } from "./float";
import { FontSize } from "./fontSize";
import { GenerateText } from "./generateText";
import { Heading } from "./heading";
import ImageBlock from "./image-block/image-block";
// import Image from "../extensions/image";
import { Image } from "./image/image";
import { LineNumbers } from "./line-number";
import { Column, Columns } from "./multi-column";
import { CustomTooltipNode, Link } from "./node-link";
import { PageBreak } from "./page-break";
import { Selection } from "./selection";
import { SlashCommand } from "./slash-command";
import { TableCell, TableHeader, TableRow } from "./table";

const CustomDocument = Document.extend({
  content: "heading block*",
});

export const Extensions = ({
  contentId,
  userId,
  storyId,
  onToCChange,
}: {
  contentId?: string;
  userId: string;
  storyId: string;
  onToCChange: (items: TableOfContentData) => void;
}) => [
  StarterKit.configure({
    document: false,
    dropcursor: false,
    heading: false,
    horizontalRule: false,
    blockquote: false,
    codeBlock: false,
  }),
  CustomDocument,
  Color,
  CodeBlock,
  Column,
  Columns,
  CustomTooltipNode,
  CharacterCount,
  Float.configure({
    types: ["image", "node"],
  }),
  FontFamily.configure({
    types: ["textStyle"],
  }),
  FontSize,
  GenerateText,
  Heading.configure({
    levels: [1, 2, 3, 4, 5, 6],
  }),
  Highlight.configure({ multicolor: true }),
  // LineNumbers.configure({
  //   showLineNumbers: false, // Use state to pass down the configuration
  // }),
  Link.configure({
    suggestion: {
      allowSpaces: true,
      findSuggestionMatch,
      items: async ({ query }) => {
        return [
          {
            name: "Fire",
            text: "Tooltips are used to describe or identify an element. In most scenarios, tooltips help the user understand the meaning, function or alt-text of an element.",
          },
          {
            name: "Frost",
            text: "Tooltips are used to describe or identify an element. In most scenarios, tooltips help the user understand the meaning, function or alt-text of an element.",
          },
          {
            name: "Wind",
            text: "Tooltips are used to describe or identify an element. In most scenarios, tooltips help the user understand the meaning, function or alt-text of an element.",
          },
          {
            name: "Earth",
            text: "Tooltips are used to describe or identify an element. In most scenarios, tooltips help the user understand the meaning, function or alt-text of an element.",
          },
        ].slice(0, 5);
      },
    },
  }),
  ImageBlock.configure({
    allowBase64: true,
  }),
  // ImageUpload.configure({}),
  FileHandler.configure({
    allowedMimeTypes: ["image/png", "image/jpeg", "image/gif", "image/webp"],
    onDrop: (currentEditor, files, pos) => {
      files.forEach(async () => {
        const file = files[0];
        console.log("file", file);
        if (file && contentId) {
          const image = await useUploadImage({
            file,
            contentId,
            storyId,
            userId,
          });
          // @ts-expect-error - figure out later
          if (image.url) {
            currentEditor
              .chain()
              // @ts-expect-error - figure out later
              .setImageBlockAt({ pos, src: image.url })
              .focus()
              .run();
          }
        }
      });
    },
    onPaste: (currentEditor, files) => {
      files.forEach(async () => {
        const file = files[0];
        if (file && contentId) {
          const image = await useUploadImage({
            file,
            contentId,
            storyId,
            userId,
          });
          // @ts-expect-error - figure out later
          if (image.url) {
            return currentEditor
              .chain()
              .setImageBlockAt({
                pos: currentEditor.state.selection.anchor,
                // @ts-expect-error - figure out later
                src: image.url,
              })
              .focus()
              .run();
          }
        }
      });
    },
  }),

  PageBreak,
  Table,
  TableCell,
  TableHeader,
  TableRow,
  TableOfContents.configure({
    getIndex: getHierarchicalIndexes,
    onUpdate(content) {
      onToCChange(content);
    },
  }),
  // TableOfContentsNode,
  TaskItem.configure({
    nested: true,
  }),
  TaskList,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  TextStyle,
  Typography,
  // Selection,
  SlashCommand,
  // GlobalDragHandle,
  // AutoJoiner,
  Dropcursor.configure({
    width: 2,
    class: "ProseMirror-dropcursor border-black",
  }),
  Markdown,
];
