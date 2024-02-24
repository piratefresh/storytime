"use client";

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

const extensions = [
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
    },
  }),
  Highlight,
  Typography,
  Image.configure({
    allowBase64: true,
  }),
  Color.configure({ types: [TextStyle.name] }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Float.configure({
    types: ["image", "node"], // Allow float node types
  }),
  Link.configure({
    suggestion: {
      items: async ({ query }) => {
        return [
          "Lea Thompson",
          "Cyndi Lauper",
          "Tom Cruise",
          "Madonna",
          "Jerry Hall",
          "Joan Collins",
          "Winona Ryder",
          "Christina Applegate",
          "Alyssa Milano",
          "Molly Ringwald",
          "Ally Sheedy",
          "Debbie Harry",
          "Olivia Newton-John",
          "Elton John",
          "Michael J. Fox",
          "Axl Rose",
          "Emilio Estevez",
          "Ralph Macchio",
          "Rob Lowe",
          "Jennifer Grey",
          "Mickey Rourke",
          "John Cusack",
          "Matthew Broderick",
          "Justine Bateman",
          "Lisa Bonet",
        ].slice(0, 5);
      },
    },
  }),
  CustomTooltipNode,
];

const editorProps: EditorProps = {
  attributes: {
    class: "mt-8 prose prose-slate mx-auto lg:prose-lg focus:outline-none",
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

const Tiptap = ({ onChange }) => {
  return (
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
  );
};

export default Tiptap;
