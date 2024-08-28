import { type JSONContent, useEditor } from "@tiptap/react";
import { type EditorProps } from "@tiptap/pm/view";
import { type User } from "lucia";
import { useSidebar } from "@/hooks/useSidebar";
import { Extensions } from "../tiptap/extensions/extensions";

interface BlockEditorProps {
  onChange: (
    content: JSONContent | string | null,
    plainTextContent: string
  ) => void;
  user: User;
  contentId?: string;
  initialContent?: JSONContent | string | null;
  storyId: string;
}

const INITIAL_CONTENT = `
<h1>Character Profile: Tony Soprano</h1><img src="https://mg-storytime-dev.s3.us-east-2.amazonaws.com/f9caf6d50f3045ed1b67c06a626bb64a10725d7e2b893fd3deaca037dabd6eb6" alt="" data-width="100%" data-align="center"><p><span data-tooltip="Fire" data-meta="Tooltips are used to describe or identify an element. In most scenarios, tooltips help the user understand the meaning, function or alt-text of an element.">Fire</span></p><ul class="tight" data-tight="true"><li><p><strong>Name:</strong> Tony Soprano</p></li><li><p><strong>Nickname:</strong> "Tony" or "T"</p></li><li><p><strong>Age:</strong> Late 40s to early 50s</p></li><li><p><strong>Occupation:</strong> Mafia boss</p></li></ul><p>Physical Description</p><ul class="tight" data-tight="true"><li><p><strong>Appearance:</strong> Stocky build, receding hairline, often seen in tailored suits</p></li><li><p><strong>Style:</strong> Classic and sophisticated, exuding authority and power</p></li></ul><p>Personality</p><ul class="tight" data-tight="true"><li><p><strong>Complex:</strong> Tony is a multifaceted character, capable of both kindness and ruthlessness.</p></li><li><p><strong>Conflicted:</strong> He struggles with the demands of his criminal lifestyle and the desire for a more conventional family life.</p></li><li><p><strong>Charismatic:</strong> Despite his flaws, Tony possesses a magnetic charm that draws people to him.</p></li><li><p><strong>Protective:</strong> He is fiercely loyal to his family and will go to great lengths to ensure their safety and well-being.</p></li></ul><p>Background</p><ul class="tight" data-tight="true"><li><p><strong>Family:</strong> Born into an Italian-American family with ties to the mob, Tony was groomed from a young age to take over the family business.</p></li><li><p><strong>Upbringing:</strong> Raised in a tough neighborhood in New Jersey, Tony learned the ways of the streets early on.</p></li><li><p><strong>Education:</strong> Despite limited formal education, Tony is street-smart and shrewd in business dealings.</p></li><li><p><strong>Personal Struggles:</strong> Tony grapples with mental health issues, including depression and anxiety, which he tries to manage through therapy.</p></li></ul><p>Plot Points</p><ul class="tight" data-tight="true"><li><p><strong>Family Dynamics:</strong> The series delves into Tony's complicated relationships with his wife, children, and extended family, exploring the tensions between his criminal life and his desire for a normal family.</p></li><li><p><strong>Power Struggles:</strong> As the head of the Soprano crime family, Tony must navigate the treacherous waters of organized crime, dealing with rival factions and internal power struggles.</p></li><li><p><strong>Psychological Depth:</strong> Through therapy sessions with Dr. Jennifer Melfi, Tony confronts his inner demons and grapples with questions of morality and identity.</p></li><li><p><strong>Legacy:</strong> Ultimately, Tony's story is one of legacy and mortality, as he grapples with the consequences of his actions and the legacy he will leave behind.</p></li></ul>
`;

const editorProps: EditorProps = {
  attributes: {
    class:
      "prose prose-sm prose-slate mx-auto pl-20 max-w-none min-h-full flex-1 bg-neutral-900 lg:prose-sm focus:outline-none dark:prose-invert",
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

export const useBlockEditor = ({
  onChange,
  user,
  contentId,
  initialContent,
  storyId,
}: BlockEditorProps) => {
  const tocSidebar = useSidebar();

  const editor = useEditor({
    editorProps,
    extensions: [...Extensions({ userId: user.id, contentId, storyId })],
    content: initialContent ?? undefined,
    onUpdate: ({ editor: instanceEditor }) => {
      onChange(instanceEditor.getJSON(), instanceEditor.getText());
    },
  });

  const characterCount: {
    characters: () => number;
    words: () => number;
  } = editor?.storage.characterCount || {
    characters: () => 0,
    words: () => 0,
  };

  return {
    editor,
    characterCount,
    tocSidebar,
  };
};
