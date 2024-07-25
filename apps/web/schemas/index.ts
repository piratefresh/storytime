import { z } from "zod";

export const createFolderSchema = z.object({
  storyId: z.string().trim().min(1, {
    message: "Story ID is required.",
  }),
  name: z.string().trim().nullable().optional(),
  parentId: z.string().trim().nullable().optional(),
});

export const createFileSchema = z.object({
  storyId: z.string().trim().min(1, {
    message: "Story ID is required.",
  }),
  name: z.string().trim().nullable().optional(),
  folderId: z.string().trim().nullable().optional(),
});

const baseSchema = z.object({
  storyId: z.string().trim().min(1, {
    message: "Story ID is required.",
  }),
  name: z.string().min(1).trim(),
  type: z.enum(["file", "folder"], {
    required_error: "Type must be specified as either 'file' or 'folder'",
    invalid_type_error: "Type must be either 'file' or 'folder'",
  }),
});

const fileSchema = baseSchema.extend({
  type: z.literal("file"),
  fileId: z.string().min(1, {
    message: "File ID is required when type is file.",
  }),
});

const folderSchema = baseSchema.extend({
  type: z.literal("folder"),
  folderId: z.string().min(1, {
    message: "Folder ID is required when type is folder.",
  }),
});

export const renameSchema = z.discriminatedUnion("type", [
  fileSchema,
  folderSchema,
]);

export const deleteSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("file"),
    fileId: z.string().min(1, {
      message: "File ID is required when type is file.",
    }),
  }),
  z.object({
    type: z.literal("folder"),
    folderId: z.string().min(1, {
      message: "Folder ID is required when type is folder.",
    }),
  }),
]);

export const updateSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("file"),
    fileId: z.string().min(1, {
      message: "File ID is required when type is file.",
    }),
    parentId: z.string().min(1, {
      message: "Parent ID is required when moving to different Folder.",
    }),
    storyId: z.string().trim().min(1, {
      message: "Story ID is required.",
    }),
  }),
  z.object({
    type: z.literal("folder"),
    folderId: z.string().min(1, {
      message: "Folder ID is required when type is folder.",
    }),
    parentId: z.string().min(1, {
      message: "Parent ID is required when moving to different Folder.",
    }),
    storyId: z.string().trim().min(1, {
      message: "Story ID is required.",
    }),
  }),
]);
