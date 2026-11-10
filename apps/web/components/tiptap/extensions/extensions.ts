import Typography from "@tiptap/extension-typography";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { Markdown } from "tiptap-markdown";
import CharacterCount from "@tiptap/extension-character-count";
import { TableOfContents } from "@tiptap-pro/extension-table-of-contents";
import Table from "@tiptap/extension-table";
import FontFamily from "@tiptap/extension-font-family";
import UrlLink from "@tiptap/extension-link";
import { Underline } from "@tiptap/extension-underline";
import Dropcursor from "@tiptap/extension-dropcursor";
import { FileHandler } from "@tiptap-pro/extension-file-handler";
// Not a React hook despite its name: a plain async upload function.
import { useUploadImage as uploadImage } from "@/hooks/use-upload-image";
import { findSuggestionMatch } from "@/lib/editor/find-suggestion-match";
import { Float } from "./float";
import { CustomTooltipNode, Link } from "./node-link";
import { PageBreak } from "./page-break";
import { GenerateText } from "./generate-text";
import { TableOfContentsNode } from "./table-of-contents-node";
import { TableCell, TableHeader, TableRow } from "./table";
import { Heading } from "./heading";
import { FontSize } from "./font-size";
import { Column, Columns } from "./multi-column";
import { SlashCommand } from "./slash-command";
import { Document } from "./document";
// import Image from "../extensions/image";
import ImageBlock from "./image-block/image-block";
import { CodeBlock } from "./code-block/code-block";

export const Extensions = ({
  contentId,
  userId,
  storyId,
}: {
  contentId?: string;
  userId: string;
  storyId: string;
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
  UrlLink.configure({ openOnClick: false }),
  Underline,
  Link.configure({
    suggestion: {
      allowSpaces: true,
      findSuggestionMatch,
      items: () => {
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
      files.forEach((file) => {
        void (async () => {
          if (contentId) {
            const image = await uploadImage({
              file,
              contentId,
              storyId,
              userId,
            });

            if (image?.url) {
              currentEditor
                .chain()
                .setImageBlockAt({ pos, src: image.url })
                .focus()
                .run();
            }
          }
        })();
      });
    },
    onPaste: (currentEditor, files) => {
      files.forEach((file) => {
        void (async () => {
          if (contentId) {
            const image = await uploadImage({
              file,
              contentId,
              storyId,
              userId,
            });
            if (image?.url) {
              currentEditor
                .chain()
                .setImageBlockAt({
                  pos: currentEditor.state.selection.anchor,
                  src: image.url,
                })
                .focus()
                .run();
            }
          }
        })();
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
  SlashCommand,
  // GlobalDragHandle,
  // AutoJoiner,
  Dropcursor.configure({
    width: 2,
    class: "ProseMirror-dropcursor border-black",
  }),
  Markdown,
];
