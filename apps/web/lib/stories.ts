import { cache } from "react";
import {
  and,
  asc,
  db,
  eq,
  inArray,
  isNull,
  ne,
  outlineNode,
  project,
} from "@repo/db";

// The editor UI still speaks story/folder/file. These are views over project and
// outline_node (act/chapter = folder, scene = file) until the new outline UI lands.
export interface StoryFile {
  id: string;
  name: string;
  folderId: string | null;
  storyId: string;
  content: unknown;
  type: string | null;
  url: string | null;
}

export interface StoryFolder {
  id: string;
  name: string;
  parentId: string | null;
  storyId: string;
  ownerId: string;
  file: StoryFile[];
}

export interface StoryWithFolder {
  id: string;
  title: string;
  description: string;
  genre: string[];
  ownerId: string;
  folder: StoryFolder[];
  file: StoryFile[];
}

export const getStories = cache(
  async (userId: string, title?: string): Promise<StoryWithFolder[]> => {
    const projects = await db
      .select()
      .from(project)
      .where(
        and(
          eq(project.ownerId, userId),
          title === undefined ? undefined : eq(project.title, title),
        ),
      )
      .orderBy(asc(project.title));
    if (projects.length === 0) return [];

    const nodes = await db
      .select()
      .from(outlineNode)
      .where(
        inArray(
          outlineNode.projectId,
          projects.map((p) => p.id),
        ),
      )
      .orderBy(asc(outlineNode.position), asc(outlineNode.title));

    return projects.map((p) => {
      const own = nodes.filter((n) => n.projectId === p.id);
      const file: StoryFile[] = own
        .filter((n) => n.kind === "scene")
        .map((n) => ({
          id: n.id,
          name: n.title,
          folderId: n.parentId,
          storyId: p.id,
          // The editor expects a JSON string (Prisma handed back the raw string).
          content: n.content === null ? null : JSON.stringify(n.content),
          type: null,
          url: null,
        }));
      const folder: StoryFolder[] = own
        .filter((n) => n.kind !== "scene")
        .map((n) => ({
          id: n.id,
          name: n.title,
          parentId: n.parentId,
          storyId: p.id,
          ownerId: p.ownerId,
          file: file.filter((f) => f.folderId === n.id),
        }));
      return { ...p, folder, file };
    });
  },
);

export const getStory = async (
  userId: string,
  title: string,
): Promise<StoryWithFolder | null> =>
  (await getStories(userId, title))[0] ?? null;

/** Throws unless the project exists and belongs to the user. */
export async function assertOwnsProject(
  projectId: string,
  userId: string,
): Promise<typeof project.$inferSelect> {
  const [p] = await db
    .select()
    .from(project)
    .where(and(eq(project.id, projectId), eq(project.ownerId, userId)));
  if (!p) throw new Error("Story not found");
  return p;
}

/**
 * First free title among a node's siblings: base, then `format(base, n)` for n = start, start+1, ….
 * Pass `excludeId` when renaming so the node doesn't collide with itself.
 */
export async function uniqueSiblingTitle({
  projectId,
  parentId,
  base,
  start = 1,
  format = (b, n) => `${b} ${n.toString()}`,
  excludeId,
}: {
  projectId: string;
  parentId: string | null;
  base: string;
  start?: number;
  format?: (base: string, n: number) => string;
  excludeId?: string;
}): Promise<string> {
  const rows = await db
    .select({ title: outlineNode.title })
    .from(outlineNode)
    .where(
      and(
        eq(outlineNode.projectId, projectId),
        parentId
          ? eq(outlineNode.parentId, parentId)
          : isNull(outlineNode.parentId),
        excludeId ? ne(outlineNode.id, excludeId) : undefined,
      ),
    );
  const taken = new Set(rows.map((r) => r.title));
  let title = base;
  for (let i = start; taken.has(title); i++) title = format(base, i);
  return title;
}
