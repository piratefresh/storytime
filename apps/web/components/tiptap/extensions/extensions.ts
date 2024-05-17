import Typography from "@tiptap/extension-typography";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import { Float } from "./float";
import { CustomTooltipNode, Link } from "./node-link";
import { LineNumbers } from "./line-number";
import { PageBreak } from "./page-break";
import { Markdown } from "tiptap-markdown";
import CharacterCount from "@tiptap/extension-character-count";
import { GenerateText } from "./generateText";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
export { Underline } from "@tiptap/extension-underline";
import { TableOfContentsNode } from "./tableOfContentsNode";
import { TableOfContents } from "@/components/tableOfContents/TableOfContents";
import Table from "@tiptap/extension-table";
import { TableCell, TableHeader, TableRow } from "./table";
import { Heading } from "./heading";
import { FontSize } from "./fontSize";
import FontFamily from "@tiptap/extension-font-family";
import { User } from "lucia";

const lowlight = createLowlight(common);

export const Extensions = ({ user }: { user: User }) => [
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false,
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false,
    },
    codeBlock: false,
  }),
  Color,
  CodeBlockLowlight.configure({
    lowlight,
    defaultLanguage: null,
  }),
  CustomTooltipNode,
  CharacterCount,
  Float.configure({
    types: ["image", "node"],
  }),
  FontFamily.configure({
    types: ["textStyle"],
  }),
  FontSize,
  GenerateText.configure({
    getReplacementText: (inputText) => "test", // Example: convert to uppercase
  }),
  Heading.configure({
    levels: [1, 2, 3, 4, 5, 6],
  }),
  Highlight.configure({ multicolor: true }),
  LineNumbers.configure({
    showLineNumbers: true, // Use state to pass down the configuration
  }),
  Link.configure({
    suggestion: {
      items: async ({ query }) => {
        return ["Fire", "Frost", "Wind", "Earth"].slice(0, 5);
      },
    },
  }),
  Markdown,
  PageBreak,
  Table,
  TableCell,
  TableHeader,
  TableRow,
  TableOfContents,
  TableOfContentsNode,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  TextStyle,
  Typography,
];
