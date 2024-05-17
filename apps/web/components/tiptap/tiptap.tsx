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
import { CharacterCountDisplay } from "./extensions/characterCountDisplay/characterCountDisplay";
import { GenerateText } from "./extensions/generateText";
import { Toolbar } from "../ui/toolbar";

const content = `
# Character Profile: Tony Soprano

## Basic Information
- **Name:** Tony Soprano
- **Nickname:** "Tony" or "T"
- **Age:** Late 40s to early 50s
- **Occupation:** Mafia boss

## Physical Description
- **Appearance:** Stocky build, receding hairline, often seen in tailored suits
- **Style:** Classic and sophisticated, exuding authority and power

## Personality
- **Complex:** Tony is a multifaceted character, capable of both kindness and ruthlessness.
- **Conflicted:** He struggles with the demands of his criminal lifestyle and the desire for a more conventional family life.
- **Charismatic:** Despite his flaws, Tony possesses a magnetic charm that draws people to him.
- **Protective:** He is fiercely loyal to his family and will go to great lengths to ensure their safety and well-being.

## Background
- **Family:** Born into an Italian-American family with ties to the mob, Tony was groomed from a young age to take over the family business.
- **Upbringing:** Raised in a tough neighborhood in New Jersey, Tony learned the ways of the streets early on.
- **Education:** Despite limited formal education, Tony is street-smart and shrewd in business dealings.
- **Personal Struggles:** Tony grapples with mental health issues, including depression and anxiety, which he tries to manage through therapy.

## Plot Points
- **Family Dynamics:** The series delves into Tony's complicated relationships with his wife, children, and extended family, exploring the tensions between his criminal life and his desire for a normal family.
- **Power Struggles:** As the head of the Soprano crime family, Tony must navigate the treacherous waters of organized crime, dealing with rival factions and internal power struggles.
- **Psychological Depth:** Through therapy sessions with Dr. Jennifer Melfi, Tony confronts his inner demons and grapples with questions of morality and identity.
- **Legacy:** Ultimately, Tony's story is one of legacy and mortality, as he grapples with the consequences of his actions and the legacy he will leave behind.


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

// We memorize the button so each button is not rerendered
// on every editor state change
const MemoButton = React.memo(Toolbar.Button);
// const MemoColorPicker = React.memo(ColorPicker)
// const MemoFontFamilyPicker = React.memo(FontFamilyPicker)
// const MemoFontSizePicker = React.memo(FontSizePicker)
// const MemoContentTypePicker = React.memo(ContentTypePicker)

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
      GenerateText.configure({
        getReplacementText: (inputText) => "test", // Example: convert to uppercase
      }),
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
          <BubbleMenu
            tippyOptions={{ popperOptions: { placement: "top-start" } }}
            editor={editor}
            pluginKey="textMenu"
            shouldShow={states.shouldShow}
            updateDelay={100}
          >
            <Toolbar.Wrapper>
              <MemoButton
                tooltip="Bold"
                tooltipShortcut={["Mod", "B"]}
                onClick={commands.onBold}
                active={states.isBold}
              >
                <Icon name="Bold" />
              </MemoButton>
              <Toolbar.Divider />
            </Toolbar.Wrapper>
          </BubbleMenu>
        </EditorProvider>
      </div>
    </div>
  );
};

export default Tiptap;
