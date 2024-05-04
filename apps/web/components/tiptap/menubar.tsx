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
import { cn } from "@/lib/utils";

export const MenuBar = () => {
  const [activeFormat, setActiveFormat] = React.useState("paragraph");
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  function toggleLineNumbers() {
    if (!editor) {
      return null;
    }

    const currentSetting = editor.extensionManager.extensions.find(
      (ext) => ext.name === "lineNumbers"
    )?.options.showLineNumbers;

    if (currentSetting !== undefined) {
      const transaction = editor.view.state.tr.setMeta("lineNumbers", {
        showLineNumbers: !currentSetting,
      });

      editor.view.dispatch(transaction);
    } else {
      console.error("Line numbers extension not found.");
    }
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
        className={cn(
          "p-1 rounded-sm relative hover:bg-primary hover:text-white",
          {
            [isActive]: editor.isActive("bold"),
          }
        )}
      >
        <Bold size={24} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={cn(
          "p-1 rounded-sm relative hover:bg-primary hover:text-white",
          {
            [isActive]: editor.isActive("italic"),
          }
        )}
      >
        <Italic size={24} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={cn(
          "p-1 rounded-sm relative hover:bg-primary hover:text-white",
          {
            [isActive]: editor.isActive("strike"),
          }
        )}
      >
        <Strikethrough size={24} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={cn(
          "p-1 rounded-sm relative hover:bg-primary hover:text-white",
          {
            [isActive]: editor.isActive("code"),
          }
        )}
      >
        <Code size={24} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().unsetAllMarks().run()}
        className={cn(
          "p-1 rounded-sm relative hover:bg-primary hover:text-white"
        )}
      >
        <RemoveFormatting size={24} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().clearNodes().run()}
        className={cn(
          "p-1 rounded-sm relative hover:bg-primary hover:text-white"
        )}
      >
        <RemoveFormatting size={24} />
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
        className={cn(
          "p-1 rounded-sm relative hover:bg-primary hover:text-white",
          {
            [isActive]: editor.isActive("bulletList"),
          }
        )}
      >
        <List size={24} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          "p-1 rounded-sm relative hover:bg-primary hover:text-white",
          {
            [isActive]: editor.isActive("orderedList"),
          }
        )}
      >
        <ListOrdered size={24} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={cn(
          "p-1 rounded-sm relative hover:bg-primary hover:text-white",
          {
            [isActive]: editor.isActive("codeBlock"),
          }
        )}
      >
        <Code size={24} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn(
          "p-1 rounded-sm relative hover:bg-primary hover:text-white",
          {
            [isActive]: editor.isActive("blockquote"),
          }
        )}
      >
        <TextQuote size={24} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className={cn(
          "p-1 rounded-sm relative hover:bg-primary hover:text-white"
        )}
      >
        <MoveHorizontal size={24} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHardBreak().run()}
        className={cn(
          "p-1 rounded-sm relative hover:bg-primary hover:text-white"
        )}
      >
        <Minus size={24} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className={cn(
          "p-1 rounded-sm relative hover:bg-primary hover:text-white"
        )}
      >
        <Undo size={24} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className={cn(
          "p-1 rounded-sm relative hover:bg-primary hover:text-white"
        )}
      >
        <Redo size={24} />
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
        className={cn(
          "p-1 rounded-sm relative hover:bg-primary hover:text-white",
          {
            [isActive]: editor.isActive({ textAlign: "left" }),
          }
        )}
      >
        <AlignLeft size={24} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={cn(
          "p-1 rounded-sm relative hover:bg-primary hover:text-white",
          {
            [isActive]: editor.isActive({ textAlign: "center" }),
          }
        )}
      >
        <AlignCenter size={24} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={cn(
          "p-1 rounded-sm relative hover:bg-primary hover:text-white",
          {
            [isActive]: editor.isActive({ textAlign: "right" }),
          }
        )}
      >
        <AlignRight size={24} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        className={cn(
          "p-1 rounded-sm relative hover:bg-primary hover:text-white",
          {
            [isActive]: editor.isActive({ textAlign: "justify" }),
          }
        )}
      >
        <AlignJustify size={24} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().unsetTextAlign().run()}
      >
        <Baseline size={24} />
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
        className={cn(
          "p-1 rounded-sm relative hover:bg-primary hover:text-white",
          {
            [isActive]: editor.isActive({ float: "left" }),
          }
        )}
      >
        <AlignLeft size={24} />
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
        className={cn(
          "p-1 rounded-sm relative hover:bg-primary hover:text-white",
          {
            [isActive]: editor.isActive({ float: "right" }),
          }
        )}
      >
        <AlignRight size={24} />
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
        className={cn(
          "p-1 rounded-sm relative hover:bg-primary hover:text-white"
        )}
      >
        unset float
      </button>

      <button
        type="button"
        onClick={() => editor.commands.setPageBreak()}
        className={cn(
          "p-1 rounded-sm relative hover:bg-primary hover:text-white"
        )}
      >
        Page Break
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().unsetPageBreak()}
        className={cn(
          "p-1 rounded-sm relative hover:bg-primary hover:text-white"
        )}
      >
        Un Page Break
      </button>
      <button onClick={() => toggleLineNumbers()}>Toggle Line Numbers</button>
    </div>
  );
};
