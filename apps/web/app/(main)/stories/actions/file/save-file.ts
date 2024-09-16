'use server';

import { validateRequest } from '@/lib/auth';
import { db } from '@/lib/db';
import { saveFileSchema } from '@/schemas';
import { type FormResponse, type FormState } from '@/types';
import { revalidatePath } from 'next/cache';
import { ZodError } from 'zod';

export async function saveFile(
  state: FormState,
  data: FormData,
  skipRevalidation?: boolean,
): Promise<FormResponse> {
  const { session } = await validateRequest();
  if (!session) {
    throw new ZodError([
      {
        path: ['auth'],
        code: 'custom',
        message: 'This action requires authentication.',
      },
    ]);
  }

  const parsedData = saveFileSchema.parse({
    fileId: data.get('fileId'),
    content: data.get('content'),
    storyId: data.get('storyId'),
  });

  const { fileId, storyId, content } = parsedData;

  try {
    const file = await db.file.update({
      where: {
        id: fileId,
        storyId,
      },
      data: {
        content: JSON.parse(content ?? ''),
      },
      include: {
        story: true,
      },
    });

    if (!file.story) {
      throw new ZodError([
        {
          path: ['story'],
          code: 'custom',
          message: 'story not found, cannot rename.',
        },
      ]);
    }

    if (!skipRevalidation) {
      revalidatePath(`/`);
    }

    return { message: `Content saved.`, status: 'success' };
  } catch (error) {
    // Log the error for debugging; this is particularly useful during development
    console.error('Error during database operation:', error);

    return {
      status: 'error',
      message: 'Failed to rename file',
    };
  }
}
