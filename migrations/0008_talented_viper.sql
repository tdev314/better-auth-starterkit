CREATE TABLE "nostr_pubkeys" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"public_key" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "nostr_pubkeys_public_key_unique" UNIQUE("public_key")
);
--> statement-breakpoint
ALTER TABLE "nostr_pubkeys" ADD CONSTRAINT "nostr_pubkeys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "nostrPubkeys_publicKey_uidx" ON "nostr_pubkeys" USING btree ("public_key");--> statement-breakpoint
CREATE INDEX "nostrPubkeys_userId_idx" ON "nostr_pubkeys" USING btree ("user_id");