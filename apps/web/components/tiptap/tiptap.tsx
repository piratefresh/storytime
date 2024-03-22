"use client";

import React from "react";
import { BubbleMenu, EditorProvider } from "@tiptap/react";

// extensions
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import { TextAlign } from "@tiptap/extension-text-align";
import Image from "./extensions/image";
import Float from "./extensions/float";
import StarterKit from "@tiptap/starter-kit";
import { MenuBar } from "./menubar";
import { EditorProps } from "@tiptap/pm/view";
import { CustomTooltipNode, Link } from "./extensions/node-link";
import { User } from "lucia";
import { useUploadImage } from "@/hooks/useUploadImage";
import { LineNumbers } from "./extensions/line-number";

const content = `
<h2>
  Hi there,
</h2>
<p>
  this is a <em>basic</em> example of <strong>tiptap</strong>. Sure, there are all kind of basic text styles you’d probably expect from a text editor. But wait until you see the lists:
</p>
<ul>
  <li>
    That’s a bullet list with one …
  </li> 
  <li>
    … or two list items.
  </li>
</ul>
<p>
  Isn’t that great? And all of that is editable. But wait, there’s more. Let’s try a code block:
</p>
<pre><code class="language-css">body {
display: none;
}</code></pre>
<p>
  I know, I know, this is impressive. It’s only the tip of the iceberg though. Give it a try and click a little bit around. Don’t forget to check the other examples too.
</p>
<blockquote>
  Wow, that’s amazing. Good work, boy! 👏
  <br />
  — Mom
</blockquote>
`;

const editorProps: EditorProps = {
  attributes: {
    class: "mt-8 prose prose-slate mx-auto pr-5 lg:prose-lg focus:outline-none",
  },
  handleDOMEvents: {
    keydown: (_view, event) => {
      // prevent default event listeners from firing when slash command is active
      if (["ArrowUp", "ArrowDown", "Enter"].includes(event.key)) {
        const slashCommand = document.querySelector("#slash-command");
        console.log("slashCommand", slashCommand);
        if (slashCommand) {
          return true;
        }
      }
    },
  },
};

const Tiptap = ({
  onChange,
  user,
  contentId,
}: {
  onChange: (content: string) => void;
  user: User | null;
  contentId?: string;
}) => {
  const extensions = React.useMemo(() => {
    const baseExtensions = [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Highlight,
      Typography,
      Color.configure({ types: [TextStyle.name] }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Float.configure({
        types: ["image", "node"],
      }),
      Link.configure({
        suggestion: {
          items: async ({ query }) => {
            return ["Fire", "Frost", "Wind", "Earth"].slice(0, 5);
          },
        },
      }),
      CustomTooltipNode,
      LineNumbers,
    ];

    // Conditionally add the Image extension if contentId is available
    if (contentId) {
      baseExtensions.push(
        Image.configure({
          allowBase64: true,
          accept: ["image/jpeg", "image/png"],
          maxFileSize: 1048576 * 10, // 10 MB
          uploadImage: async (file) => {
            // Assuming useUploadImage is defined elsewhere and properly handles the upload
            return await useUploadImage({ file, contentId });
          },
        })
      );
    }

    return baseExtensions;
  }, [contentId]);

  return (
    <div className="flex">
      <div className="flex flex-col rounded-md border">
        <EditorProvider
          editorProps={editorProps}
          extensions={extensions}
          content={content}
          slotBefore={<MenuBar />}
          onSelectionUpdate={(selection) => {}}
          onUpdate={({ editor }) => {
            const value = editor.getHTML();
            onChange(value);
          }}
          onCreate={({ editor }) => {
            const value = editor.getHTML();
            onChange(value);
          }}
        >
          <BubbleMenu>This is the bubble menu</BubbleMenu>
        </EditorProvider>
      </div>
    </div>
  );
};

export default Tiptap;
