import Typography from "@tiptap/extension-typography";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { Float } from "./float";
import { CustomTooltipNode, Link } from "./node-link";
import { LineNumbers } from "./line-number";
import { PageBreak } from "./page-break";
import { Markdown } from "tiptap-markdown";
import CharacterCount from "@tiptap/extension-character-count";
import { GenerateText } from "./generateText";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { Underline } from "@tiptap/extension-underline";
import { TableOfContentsNode } from "./tableOfContentsNode";
import { TableOfContents } from "@tiptap-pro/extension-table-of-contents";
import Table from "@tiptap/extension-table";
import { TableCell, TableHeader, TableRow } from "./table";
import { Heading } from "./heading";
import { FontSize } from "./fontSize";
import FontFamily from "@tiptap/extension-font-family";
import { User } from "lucia";
import GlobalDragHandle from "tiptap-extension-global-drag-handle";
import AutoJoiner from "tiptap-extension-auto-joiner";
import { Column, Columns } from "./multi-column";
import { SlashCommand } from "./slash-command";
import { Selection } from "./selection";
import Dropcursor from "@tiptap/extension-dropcursor";
import { Document } from "./document";
// import Image from "../extensions/image";
import { Image } from "./image/image";
import { FileHandler } from "@tiptap-pro/extension-file-handler";
import ImageUpload from "./document/image-upload/image-upload";
import ImageBlock from "./image-block/image-block";
import { useUploadImage } from "@/hooks/use-upload-image";
import { SuggestionMatch, Trigger } from "@tiptap/suggestion";
import { findSuggestionMatch } from "@/lib/editor/findSuggestionMatch";

const lowlight = createLowlight(common);

export const Extensions = ({
  contentId,
  user,
}: {
  contentId?: string;
  user?: User | null;
}) => [
  StarterKit.configure({
    document: false,
    dropcursor: false,
    heading: false,
    horizontalRule: false,
    blockquote: false,
    codeBlock: false,
  }),
  Document,
  Color,
  CodeBlockLowlight.configure({
    lowlight,
    defaultLanguage: null,
  }),
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
          const image = await useUploadImage({ file, contentId });

          if (image.url) {
            currentEditor
              .chain()
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
          const image = await useUploadImage({ file, contentId });
          if (image.url) {
            return currentEditor
              .chain()
              .setImageBlockAt({
                pos: currentEditor.state.selection.anchor,
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
  TableOfContents,
  TableOfContentsNode,
  TaskItem.configure({
    nested: true,
  }),
  TaskList,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  TextStyle,
  Typography,
  // Selection,
  // SlashCommand,
  // GlobalDragHandle,
  // AutoJoiner,
  Dropcursor.configure({
    width: 2,
    class: "ProseMirror-dropcursor border-black",
  }),
  Markdown,
];
