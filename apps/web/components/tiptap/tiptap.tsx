"use client";

import React from "react";
import { EditorProvider } from "@tiptap/react";

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
import { TextMenu } from "./text-menu";
import { Extensions } from "./extensions/extensions";
import { ColorPicker } from "./components/colorpicker";
import ImageBlockMenu from "./extensions/image-block/components/image-block-menu";
import { ContentItemMenu } from "./components/content-item-menu";
import { TableOfContents } from "../table-of-contents";

const content = `
<h1>Character Profile: Tony Soprano</h1><img src="https://mg-storytime-dev.s3.us-east-2.amazonaws.com/f9caf6d50f3045ed1b67c06a626bb64a10725d7e2b893fd3deaca037dabd6eb6" alt="" data-width="100%" data-align="center"><p><span data-tooltip="Fire" data-meta="Tooltips are used to describe or identify an element. In most scenarios, tooltips help the user understand the meaning, function or alt-text of an element.">Fire</span></p><ul class="tight" data-tight="true"><li><p><strong>Name:</strong> Tony Soprano</p></li><li><p><strong>Nickname:</strong> "Tony" or "T"</p></li><li><p><strong>Age:</strong> Late 40s to early 50s</p></li><li><p><strong>Occupation:</strong> Mafia boss</p></li></ul><p>Physical Description</p><ul class="tight" data-tight="true"><li><p><strong>Appearance:</strong> Stocky build, receding hairline, often seen in tailored suits</p></li><li><p><strong>Style:</strong> Classic and sophisticated, exuding authority and power</p></li></ul><p>Personality</p><ul class="tight" data-tight="true"><li><p><strong>Complex:</strong> Tony is a multifaceted character, capable of both kindness and ruthlessness.</p></li><li><p><strong>Conflicted:</strong> He struggles with the demands of his criminal lifestyle and the desire for a more conventional family life.</p></li><li><p><strong>Charismatic:</strong> Despite his flaws, Tony possesses a magnetic charm that draws people to him.</p></li><li><p><strong>Protective:</strong> He is fiercely loyal to his family and will go to great lengths to ensure their safety and well-being.</p></li></ul><p>Background</p><ul class="tight" data-tight="true"><li><p><strong>Family:</strong> Born into an Italian-American family with ties to the mob, Tony was groomed from a young age to take over the family business.</p></li><li><p><strong>Upbringing:</strong> Raised in a tough neighborhood in New Jersey, Tony learned the ways of the streets early on.</p></li><li><p><strong>Education:</strong> Despite limited formal education, Tony is street-smart and shrewd in business dealings.</p></li><li><p><strong>Personal Struggles:</strong> Tony grapples with mental health issues, including depression and anxiety, which he tries to manage through therapy.</p></li></ul><p>Plot Points</p><ul class="tight" data-tight="true"><li><p><strong>Family Dynamics:</strong> The series delves into Tony's complicated relationships with his wife, children, and extended family, exploring the tensions between his criminal life and his desire for a normal family.</p></li><li><p><strong>Power Struggles:</strong> As the head of the Soprano crime family, Tony must navigate the treacherous waters of organized crime, dealing with rival factions and internal power struggles.</p></li><li><p><strong>Psychological Depth:</strong> Through therapy sessions with Dr. Jennifer Melfi, Tony confronts his inner demons and grapples with questions of morality and identity.</p></li><li><p><strong>Legacy:</strong> Ultimately, Tony's story is one of legacy and mortality, as he grapples with the consequences of his actions and the legacy he will leave behind.</p></li></ul>
`;

const editorProps: EditorProps = {
  attributes: {
    class:
      "mt-8 prose prose-sm prose-slate mx-auto pl-8 max-w-none flex-1 lg:prose-sm focus:outline-none dark:prose-invert",
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
  contentId = "224d5576-cc92-40c8-b662-0edbb98d7e60",
}: {
  onChange?: (content: string) => void;
  user: User | null;
  contentId?: string;
}) => {
  // const extensions = React.useMemo(() => {
  //   const baseExtensions = [
  //     StarterKit.configure({
  //       bulletList: {
  //         keepMarks: true,
  //         keepAttributes: false,
  //       },
  //       orderedList: {
  //         keepMarks: true,
  //         keepAttributes: false,
  //       },
  //     }),
  //     Highlight,
  //     Typography,
  //     Color.configure({ types: [TextStyle.name] }),
  //     TextAlign.configure({ types: ["heading", "paragraph"] }),
  //     Float.configure({
  //       types: ["image", "node"],
  //     }),
  //     Link.configure({
  //       suggestion: {
  //         items: async ({ query }) => {
  //           return ["Fire", "Frost", "Wind", "Earth"].slice(0, 5);
  //         },
  //       },
  //     }),
  //     CustomTooltipNode,
  //     LineNumbers.configure({
  //       showLineNumbers: true, // Use state to pass down the configuration
  //     }),
  //     PageBreak,
  //     Markdown,
  //     CharacterCount,
  //     GenerateText.configure({
  //       getReplacementText: (inputText) => "test", // Example: convert to uppercase
  //     }),
  //   ];

  //   // Conditionally add the Image extension if contentId is available
  //   if (contentId) {
  //     baseExtensions.push(
  //       Image.configure({
  //         allowBase64: true,
  //         accept: ["image/jpeg", "image/png"],
  //         maxFileSize: 1048576 * 10, // 10 MB
  //         uploadImage: async (file) => {
  //           // Assuming useUploadImage is defined elsewhere and properly handles the upload
  //           return await useUploadImage({ file, contentId });
  //         },
  //       })
  //     );
  //   }

  //   return baseExtensions;
  // }, [contentId]);

  return (
    <div className="flex">
      <div className="flex flex-col rounded-md border">
        <EditorProvider
          editorProps={editorProps}
          // extensions={extensions}
          extensions={[...Extensions({ user, contentId })]}
          content={content}
          slotBefore={
            <div className="w-full h-full overflow-hidden">
              <div className="w-full h-full p-6 overflow-auto">
                <TableOfContents />
              </div>
            </div>
          }
          slotAfter={<CharacterCountDisplay />}
          onSelectionUpdate={(selection) => {}}
          onUpdate={({ editor }) => {
            const value = editor.getHTML();
            console.log("value: ", value);
            console.log("markdown: ", editor.storage.markdown.getMarkdown());
            if (onChange) {
              onChange(value);
            }
          }}
          onCreate={({ editor }) => {
            const value = editor.getHTML();
            if (onChange) {
              onChange(value);
            }
          }}
        >
          <TextMenu />
          <ContentItemMenu />
          <ImageBlockMenu />
        </EditorProvider>
      </div>
    </div>
  );
};

export default Tiptap;
