'use client';

import { BlockEditor } from '@/components/block-editor/block-editor';
import { Prisma, User } from '@repo/db';
import { JSONContent } from '@tiptap/core';

import { updateStory } from '../../actions/update-story';

interface StoryEditorProps {
  storyId: string;
  user: User;
  content: JSONContent | Prisma.JsonValue | string | null;
}

export function StoryEditor({ storyId, user, content }: StoryEditorProps) {
  return (
    <BlockEditor
      storyId={storyId}
      contentId={storyId}
      user={user}
      content={JSON.parse(JSON.stringify(content))}
      onChange={(updatedContent) =>
        void updateStory({ storyId, content: updatedContent })
      }
    />
  );
}
