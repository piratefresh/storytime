CREATE TYPE "public"."media_type" AS ENUM('image', 'video');--> statement-breakpoint
CREATE TYPE "public"."outline_kind" AS ENUM('act', 'chapter', 'scene');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"type" text NOT NULL,
	"preset" text,
	"name" text NOT NULL,
	"aliases" text[] DEFAULT '{}' NOT NULL,
	"description" text,
	"images" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "field_value" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_id" uuid NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"from_chapter_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "field_value_entityId_key_fromChapterId_unique" UNIQUE NULLS NOT DISTINCT("entity_id","key","from_chapter_id")
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"project_id" uuid,
	"type" "media_type" NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mention" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_id" uuid NOT NULL,
	"scene_id" uuid NOT NULL,
	"offset" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outline_node" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"parent_id" uuid,
	"kind" "outline_kind" NOT NULL,
	"title" text NOT NULL,
	"position" double precision DEFAULT 0 NOT NULL,
	"content" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"genre" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "project_ownerId_title_unique" UNIQUE("owner_id","title")
);
--> statement-breakpoint
CREATE TABLE "relationship" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"from_entity_id" uuid NOT NULL,
	"to_entity_id" uuid NOT NULL,
	"type" text NOT NULL,
	"since_chapter_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "version" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scene_id" uuid NOT NULL,
	"content" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entity" ADD CONSTRAINT "entity_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_value" ADD CONSTRAINT "field_value_entity_id_entity_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entity"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_value" ADD CONSTRAINT "field_value_from_chapter_id_outline_node_id_fk" FOREIGN KEY ("from_chapter_id") REFERENCES "public"."outline_node"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mention" ADD CONSTRAINT "mention_entity_id_entity_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entity"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mention" ADD CONSTRAINT "mention_scene_id_outline_node_id_fk" FOREIGN KEY ("scene_id") REFERENCES "public"."outline_node"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outline_node" ADD CONSTRAINT "outline_node_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outline_node" ADD CONSTRAINT "outline_node_parent_id_outline_node_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."outline_node"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationship" ADD CONSTRAINT "relationship_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationship" ADD CONSTRAINT "relationship_from_entity_id_entity_id_fk" FOREIGN KEY ("from_entity_id") REFERENCES "public"."entity"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationship" ADD CONSTRAINT "relationship_to_entity_id_entity_id_fk" FOREIGN KEY ("to_entity_id") REFERENCES "public"."entity"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationship" ADD CONSTRAINT "relationship_since_chapter_id_outline_node_id_fk" FOREIGN KEY ("since_chapter_id") REFERENCES "public"."outline_node"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "version" ADD CONSTRAINT "version_scene_id_outline_node_id_fk" FOREIGN KEY ("scene_id") REFERENCES "public"."outline_node"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_index" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "entity_project_id_index" ON "entity" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "mention_scene_id_index" ON "mention" USING btree ("scene_id");--> statement-breakpoint
CREATE INDEX "mention_entity_id_index" ON "mention" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "outline_node_project_id_index" ON "outline_node" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "outline_node_parent_id_index" ON "outline_node" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "relationship_from_entity_id_index" ON "relationship" USING btree ("from_entity_id");--> statement-breakpoint
CREATE INDEX "relationship_to_entity_id_index" ON "relationship" USING btree ("to_entity_id");--> statement-breakpoint
CREATE INDEX "session_user_id_index" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_index" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "version_scene_id_index" ON "version" USING btree ("scene_id");