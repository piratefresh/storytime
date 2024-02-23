import { Editor, useCurrentEditor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  CodeSquare,
  TextQuote,
  X,
  CheckSquare,
  Type,
  Hash,
  ListChecks,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ArrowLeft,
  ArrowRight,
  Image,
  LucideIcon,
  MoveHorizontal,
  Minus,
  Undo,
  Redo,
  RemoveFormatting,
  Baseline,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";

export const MenuBar = () => {
  const [activeFormat, setActiveFormat] = React.useState("paragraph");
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  const updateActiveFormat = () => {
    if (editor.isActive("paragraph")) {
      setActiveFormat("paragraph");
    } else if (editor.isActive("heading", { level: 1 })) {
      setActiveFormat("h1");
    } else if (editor.isActive("heading", { level: 2 })) {
      setActiveFormat("h2");
    } else if (editor.isActive("heading", { level: 3 })) {
      setActiveFormat("h3");
    } else if (editor.isActive("heading", { level: 4 })) {
      setActiveFormat("h4");
    } else if (editor.isActive("heading", { level: 5 })) {
      setActiveFormat("h5");
    } else if (editor.isActive("heading", { level: 6 })) {
      setActiveFormat("h6");
    } else {
      setActiveFormat("paragraph");
    }
  };

  editor.on("selectionUpdate", ({ editor }) => {
    updateActiveFormat();
  });

  const applyFormat = (format: string) => {
    switch (format) {
      case "paragraph":
        editor.chain().focus().setParagraph().run();
        break;
      case "h1":
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case "h2":
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case "h3":
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        break;
      case "h4":
        editor.chain().focus().toggleHeading({ level: 4 }).run();
        break;
      case "h5":
        editor.chain().focus().toggleHeading({ level: 5 }).run();
        break;
      case "h6":
        editor.chain().focus().toggleHeading({ level: 6 }).run();
        break;
      // Add more cases as needed
    }
    setActiveFormat(format.charAt(0).toUpperCase() + format.slice(1)); // Update state to reflect active format
  };

  const isActive = "bg-black text-white";

  return (
    <div className="flex flex-wrap gap-2 bg-accent p-2">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? isActive : ""}
      >
        <Bold />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? isActive : ""}
      >
        <Italic />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={editor.isActive("strike") ? isActive : ""}
      >
        <Strikethrough />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={editor.isActive("code") ? isActive : ""}
      >
        <Code />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().unsetAllMarks().run()}
        className={editor.isActive("code") ? isActive : ""}
      >
        <RemoveFormatting />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().clearNodes().run()}
        className={editor.isActive("code") ? isActive : ""}
      >
        <RemoveFormatting />
      </button>
      <Select value={activeFormat}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={activeFormat} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            value="paragraph"
            onSelect={() => applyFormat("paragraph")}
          >
            Paragraph
          </SelectItem>
          <SelectItem value="h1" onSelect={() => applyFormat("h1")}>
            Heading 1
          </SelectItem>
          <SelectItem value="h2" onSelect={() => applyFormat("h2")}>
            Heading 2
          </SelectItem>
          <SelectItem value="h3" onSelect={() => applyFormat("h3")}>
            Heading 3
          </SelectItem>
          <SelectItem value="h4" onSelect={() => applyFormat("h4")}>
            Heading 4
          </SelectItem>
          <SelectItem value="h5" onSelect={() => applyFormat("h5")}>
            Heading 5
          </SelectItem>
          <SelectItem value="h6" onSelect={() => applyFormat("h6")}>
            Heading 6
          </SelectItem>
        </SelectContent>
      </Select>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive("bulletList") ? isActive : ""}
      >
        <List />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive("orderedList") ? isActive : ""}
      >
        <ListOrdered />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={editor.isActive("codeBlock") ? isActive : ""}
      >
        <Code />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive("blockquote") ? isActive : ""}
      >
        <TextQuote />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className={editor.isActive("code") ? isActive : ""}
      >
        <MoveHorizontal />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHardBreak().run()}
        className={editor.isActive("code") ? isActive : ""}
      >
        <Minus />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className={editor.isActive("code") ? isActive : ""}
      >
        <Undo />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className={editor.isActive("code") ? isActive : ""}
      >
        <Redo />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setColor("#958DF1").run()}
        className={
          editor.isActive("textStyle", { color: "#958DF1" }) ? isActive : ""
        }
      >
        purple
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={editor.isActive({ textAlign: "left" }) ? isActive : ""}
      >
        <AlignLeft />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={editor.isActive({ textAlign: "center" }) ? isActive : ""}
      >
        <AlignCenter />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={editor.isActive({ textAlign: "right" }) ? isActive : ""}
      >
        <AlignRight />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        className={editor.isActive({ textAlign: "justify" }) ? isActive : ""}
      >
        <AlignJustify />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().unsetTextAlign().run()}
      >
        <Baseline />
      </button>
      <button
        type="button"
        onClick={() =>
          editor
            .chain()
            .focus()
            .updateAttributes("image", { float: "left" })
            .run()
        }
        className={editor.isActive("code") ? isActive : ""}
      >
        <AlignLeft />
      </button>
      <button
        type="button"
        onClick={() =>
          editor
            .chain()
            .focus()
            .updateAttributes("image", { float: "right" })
            .run()
        }
        className={editor.isActive("code") ? isActive : ""}
      >
        <AlignRight />
      </button>
      <button
        type="button"
        onClick={() =>
          editor
            .chain()
            .focus()
            .updateAttributes("image", { float: "none" })
            .run()
        }
        className={editor.isActive("code") ? isActive : ""}
      >
        unset float
      </button>
    </div>
  );
};
