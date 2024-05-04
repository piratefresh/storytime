"use client";

import React from "react";
import { BubbleMenu, EditorProvider } from "@tiptap/react";

// extensions
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import { TextAlign } from "@tiptap/extension-text-align";
import CharacterCount from "@tiptap/extension-character-count";
import { Markdown } from "tiptap-markdown";

import Image from "./extensions/image";
import Float from "./extensions/float";
import StarterKit from "@tiptap/starter-kit";
import { MenuBar } from "./menubar";
import { EditorProps } from "@tiptap/pm/view";
import { CustomTooltipNode, Link } from "./extensions/node-link";
import { User } from "lucia";
import { useUploadImage } from "@/hooks/useUploadImage";
import { LineNumbers } from "./extensions/line-number";
import { PageBreak } from "./extensions/page-break";
import { CharacterCountDisplay } from "./characterCount/characterCount";

const content = `
# A Quiet Evening

## By Jane Doe

### Chapter 1: The Unexpected Guest

It was a cold and stormy night, the wind howled outside and the rain battered against the windows. Inside, the Smith's cozy living room was a stark contrast, with the warm glow of a fire and the soft ticking of the grandfather clock.

Sarah was curled up on the sofa, lost in a book, when she heard a faint knock at the door. Puzzled, she glanced at the clock. *Who could it be at this hour?* she wondered.

She stood up and walked cautiously to the door. Peering through the peephole, she saw a shadowy figure standing outside. Taking a deep breath, she opened the door.

"Hello, may I help you?" she asked, her voice trembling slightly.

"Good evening, ma'am. I'm terribly sorry to bother you," the man began, his hat in his hands, "but my car broke down just up the road, and my phone is dead. Could I use your phone to call for a tow truck?"

Sarah hesitated for a moment, then nodded and stepped aside to let him in.

### Chapter 2: An Intriguing Conversation

As the stranger stepped into the light, Sarah could see he was a young man, not much older than she was, with a kind face and earnest eyes. She led him to the telephone in the kitchen, then made them both a cup of tea.

While he talked on the phone, Sarah couldn't help but notice the unusual pendant he wore around his neck. It was a silver wolf, its eyes set with small green stones.

"Thank you for the tea, and for letting me use your phone," the man said as he hung up.

"It's no trouble at all," Sarah replied. "It's such a nasty night to be stuck outside. What's your name?"

"I'm Michael," he said, "and I can't thank you enough for your kindness tonight."

As they sipped their tea, the storm outside seemed to grow even more fierce. They talked about many things, finding they had much in common. Before long, Sarah felt as if she had known Michael for years.

### Chapter 3: The Night Takes a Turn

The conversation flowed easily until the lights flickered and went out, plunging the room into darkness. The wind screamed like a banshee, making the house creak and groan.

"Don't worry," Michael said, his voice calm, "It's just the storm. It should pass soon."

But Sarah felt a chill that had nothing to do with the wind. There was something about the night, about Michael, that didn't seem quite right...

---

*To be continued...*

`;

const editorProps: EditorProps = {
  attributes: {
    class:
      "mt-8 prose-sm prose-slate mx-auto px-8 lg:prose-sm focus:outline-none dark:prose-invert",
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
      LineNumbers.configure({
        showLineNumbers: true, // Use state to pass down the configuration
      }),
      PageBreak,
      Markdown,
      CharacterCount,
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
          slotAfter={<CharacterCountDisplay />}
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
