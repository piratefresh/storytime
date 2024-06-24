"use client";

import { BlockEditor } from "@/components/block-editor/block-editor";
import { User } from "lucia";
import { updateStory } from "../../actions/update-story";
import { JSONContent } from "@tiptap/core";
import { Prisma } from "@repo/db";

interface StoryEditorProps {
  storyId: string;
  user: User | null;
  content: JSONContent | Prisma.JsonValue | string | null;
}

export const StoryEditor = ({ storyId, user, content }: StoryEditorProps) => {
  return (
    <BlockEditor
      contentId={storyId}
      user={user}
      content={JSON.parse(JSON.stringify(content))}
      onChange={(updatedContent) =>
        updateStory({ storyId, content: updatedContent })
      }
    />
  );
};
