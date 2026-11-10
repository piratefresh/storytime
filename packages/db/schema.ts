import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

// ---------------------------------------------------------------------------
// Auth (better-auth core tables; field names must match what better-auth expects)
// ---------------------------------------------------------------------------

export const user = pgTable("user", {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean().notNull().default(false),
  image: text(),
  ...timestamps,
});

export const session = pgTable(
  "session",
  {
    id: text().primaryKey(),
    expiresAt: timestamp().notNull(),
    token: text().notNull().unique(),
    ipAddress: text(),
    userAgent: text(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (t) => [index().on(t.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text().primaryKey(),
    accountId: text().notNull(),
    providerId: text().notNull(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: timestamp(),
    refreshTokenExpiresAt: timestamp(),
    scope: text(),
    password: text(),
    ...timestamps,
  },
  (t) => [index().on(t.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text().primaryKey(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp().notNull(),
    ...timestamps,
  },
  (t) => [index().on(t.identifier)],
);

// ---------------------------------------------------------------------------
// Story model (STO-1072)
// ---------------------------------------------------------------------------

export const project = pgTable(
  "project",
  {
    id: uuid().primaryKey().defaultRandom(),
    ownerId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text().notNull(),
    description: text().notNull().default(""),
    genre: text().array().notNull().default([]),
    ...timestamps,
  },
  // Routes are /stories/[title], so titles are unique per owner.
  (t) => [unique().on(t.ownerId, t.title)],
);

export const outlineKind = pgEnum("outline_kind", ["act", "chapter", "scene"]);

// Project → Act → Chapter → Scene as one ordered tree. Scenes are the documents.
// ponytail: nesting depth (act > chapter > scene) is not enforced in the DB yet;
// the old folder UI still allows arbitrary nesting. Add a check when the new outline UI lands.
export const outlineNode = pgTable(
  "outline_node",
  {
    id: uuid().primaryKey().defaultRandom(),
    projectId: uuid()
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    parentId: uuid().references((): AnyPgColumn => outlineNode.id, {
      onDelete: "cascade",
    }),
    kind: outlineKind().notNull(),
    title: text().notNull(),
    // Fractional ordering among siblings: insert between a and b with (a + b) / 2.
    position: doublePrecision().notNull().default(0),
    content: jsonb(), // Tiptap doc, scenes only
    ...timestamps,
  },
  (t) => [index().on(t.projectId), index().on(t.parentId)],
);

export const entity = pgTable(
  "entity",
  {
    id: uuid().primaryKey().defaultRandom(),
    projectId: uuid()
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    type: text().notNull(), // character, place, item, faction, …
    preset: text(),
    name: text().notNull(),
    aliases: text().array().notNull().default([]),
    description: text(),
    images: text().array().notNull().default([]),
    ...timestamps,
  },
  (t) => [index().on(t.projectId)],
);

// A field's value from a given chapter onwards; fromChapterId null = from the start.
export const fieldValue = pgTable(
  "field_value",
  {
    id: uuid().primaryKey().defaultRandom(),
    entityId: uuid()
      .notNull()
      .references(() => entity.id, { onDelete: "cascade" }),
    key: text().notNull(),
    value: jsonb().notNull(),
    fromChapterId: uuid().references(() => outlineNode.id, {
      onDelete: "cascade",
    }),
    ...timestamps,
  },
  (t) => [unique().on(t.entityId, t.key, t.fromChapterId).nullsNotDistinct()],
);

export const relationship = pgTable(
  "relationship",
  {
    id: uuid().primaryKey().defaultRandom(),
    projectId: uuid()
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    fromEntityId: uuid()
      .notNull()
      .references(() => entity.id, { onDelete: "cascade" }),
    toEntityId: uuid()
      .notNull()
      .references(() => entity.id, { onDelete: "cascade" }),
    type: text().notNull(),
    sinceChapterId: uuid().references(() => outlineNode.id, {
      onDelete: "cascade",
    }),
    ...timestamps,
  },
  (t) => [index().on(t.fromEntityId), index().on(t.toEntityId)],
);

// Derived from scene text; rebuilt on save.
export const mention = pgTable(
  "mention",
  {
    id: uuid().primaryKey().defaultRandom(),
    entityId: uuid()
      .notNull()
      .references(() => entity.id, { onDelete: "cascade" }),
    sceneId: uuid()
      .notNull()
      .references(() => outlineNode.id, { onDelete: "cascade" }),
    offset: integer().notNull(),
  },
  (t) => [index().on(t.sceneId), index().on(t.entityId)],
);

export const version = pgTable(
  "version",
  {
    id: uuid().primaryKey().defaultRandom(),
    sceneId: uuid()
      .notNull()
      .references(() => outlineNode.id, { onDelete: "cascade" }),
    content: jsonb().notNull(),
    createdAt: timestamp().notNull().defaultNow(),
  },
  (t) => [index().on(t.sceneId)],
);

export const mediaType = pgEnum("media_type", ["image", "video"]);

export const media = pgTable("media", {
  id: uuid().primaryKey().defaultRandom(),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  projectId: uuid().references(() => project.id, { onDelete: "cascade" }),
  type: mediaType().notNull(),
  url: text().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

export type User = typeof user.$inferSelect;
export type Project = typeof project.$inferSelect;
export type OutlineNode = typeof outlineNode.$inferSelect;
export type Entity = typeof entity.$inferSelect;
export type Media = typeof media.$inferSelect;
