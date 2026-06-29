import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text("role"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
});

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
  },
  (table) => [index("sessions_userId_idx").on(table.userId)],
);

export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("accounts_userId_idx").on(table.userId)],
);

export const verifications = pgTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verifications_identifier_idx").on(table.identifier)],
);

export const twoFactors = pgTable(
  "two_factors",
  {
    id: text("id").primaryKey(),
    secret: text("secret").notNull(),
    backupCodes: text("backup_codes").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    verified: boolean("verified").default(true),
    failedVerificationCount: integer("failed_verification_count").default(0),
    lockedUntil: timestamp("locked_until"),
  },
  (table) => [
    index("twoFactors_secret_idx").on(table.secret),
    index("twoFactors_userId_idx").on(table.userId),
  ],
);

export const passkeys = pgTable(
  "passkeys",
  {
    id: text("id").primaryKey(),
    name: text("name"),
    publicKey: text("public_key").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    credentialID: text("credential_id").notNull(),
    counter: integer("counter").notNull(),
    deviceType: text("device_type").notNull(),
    backedUp: boolean("backed_up").notNull(),
    transports: text("transports"),
    createdAt: timestamp("created_at"),
    aaguid: text("aaguid"),
  },
  (table) => [
    index("passkeys_userId_idx").on(table.userId),
    index("passkeys_credentialID_idx").on(table.credentialID),
  ],
);

export const invites = pgTable("invites", {
  id: text("id").primaryKey(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  maxUses: integer("max_uses").notNull(),
  createdByUserId: text("created_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "set null" }),
  redirectToAfterUpgrade: text("redirect_to_after_upgrade"),
  shareInviterName: boolean("share_inviter_name").notNull(),
  email: text("email"),
  emails: text("emails").array(),
  role: text("role").notNull(),
  newAccount: boolean("new_account"),
  status: text("status", {
    enum: ["pending", "rejected", "canceled", "used"],
  }).notNull(),
});

export const inviteUses = pgTable("invite_uses", {
  id: text("id").primaryKey(),
  inviteId: text("invite_id")
    .notNull()
    .references(() => invites.id, { onDelete: "set null" }),
  usedAt: timestamp("used_at").notNull(),
  usedByUserId: text("used_by_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
});

export const nostrPubkeys = pgTable(
  "nostr_pubkeys",
  {
    id: text("id").primaryKey(),
    name: text("name"),
    publicKey: text("public_key").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull(),
  },
  (table) => [
    uniqueIndex("nostrPubkeys_publicKey_uidx").on(table.publicKey),
    index("nostrPubkeys_userId_idx").on(table.userId),
  ],
);

export const jwkss = pgTable("jwkss", {
  id: text("id").primaryKey(),
  publicKey: text("public_key").notNull(),
  privateKey: text("private_key").notNull(),
  createdAt: timestamp("created_at").notNull(),
  expiresAt: timestamp("expires_at"),
});

export const oauthClients = pgTable(
  "oauth_clients",
  {
    id: text("id").primaryKey(),
    clientId: text("client_id").notNull().unique(),
    clientSecret: text("client_secret"),
    disabled: boolean("disabled").default(false),
    skipConsent: boolean("skip_consent"),
    enableEndSession: boolean("enable_end_session"),
    subjectType: text("subject_type"),
    scopes: text("scopes").array(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
    name: text("name"),
    uri: text("uri"),
    icon: text("icon"),
    contacts: text("contacts").array(),
    tos: text("tos"),
    policy: text("policy"),
    softwareId: text("software_id"),
    softwareVersion: text("software_version"),
    softwareStatement: text("software_statement"),
    redirectUris: text("redirect_uris").array().notNull(),
    postLogoutRedirectUris: text("post_logout_redirect_uris").array(),
    tokenEndpointAuthMethod: text("token_endpoint_auth_method"),
    grantTypes: text("grant_types").array(),
    responseTypes: text("response_types").array(),
    public: boolean("public"),
    type: text("type"),
    requirePKCE: boolean("require_pkce"),
    referenceId: text("reference_id"),
    metadata: jsonb("metadata"),
  },
  (table) => [index("oauthClients_userId_idx").on(table.userId)],
);

export const oauthRefreshTokens = pgTable(
  "oauth_refresh_tokens",
  {
    id: text("id").primaryKey(),
    token: text("token").notNull().unique(),
    clientId: text("client_id")
      .notNull()
      .references(() => oauthClients.clientId, { onDelete: "cascade" }),
    sessionId: text("session_id").references(() => sessions.id, {
      onDelete: "set null",
    }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    referenceId: text("reference_id"),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull(),
    revoked: timestamp("revoked"),
    authTime: timestamp("auth_time"),
    scopes: text("scopes").array().notNull(),
  },
  (table) => [
    index("oauthRefreshTokens_clientId_idx").on(table.clientId),
    index("oauthRefreshTokens_sessionId_idx").on(table.sessionId),
    index("oauthRefreshTokens_userId_idx").on(table.userId),
  ],
);

export const oauthAccessTokens = pgTable(
  "oauth_access_tokens",
  {
    id: text("id").primaryKey(),
    token: text("token").notNull().unique(),
    clientId: text("client_id")
      .notNull()
      .references(() => oauthClients.clientId, { onDelete: "cascade" }),
    sessionId: text("session_id").references(() => sessions.id, {
      onDelete: "set null",
    }),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    referenceId: text("reference_id"),
    refreshId: text("refresh_id").references(() => oauthRefreshTokens.id, {
      onDelete: "cascade",
    }),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull(),
    scopes: text("scopes").array().notNull(),
  },
  (table) => [
    index("oauthAccessTokens_clientId_idx").on(table.clientId),
    index("oauthAccessTokens_sessionId_idx").on(table.sessionId),
    index("oauthAccessTokens_userId_idx").on(table.userId),
    index("oauthAccessTokens_refreshId_idx").on(table.refreshId),
  ],
);

export const oauthConsents = pgTable(
  "oauth_consents",
  {
    id: text("id").primaryKey(),
    clientId: text("client_id")
      .notNull()
      .references(() => oauthClients.clientId, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    referenceId: text("reference_id"),
    scopes: text("scopes").array().notNull(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => [
    index("oauthConsents_clientId_idx").on(table.clientId),
    index("oauthConsents_userId_idx").on(table.userId),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  twoFactors: many(twoFactors),
  passkeys: many(passkeys),
  invites: many(invites),
  inviteUses: many(inviteUses),
  nostrPubkeys: many(nostrPubkeys),
  oauthClients: many(oauthClients),
  oauthRefreshTokens: many(oauthRefreshTokens),
  oauthAccessTokens: many(oauthAccessTokens),
  oauthConsents: many(oauthConsents),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  users: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
  oauthRefreshTokens: many(oauthRefreshTokens),
  oauthAccessTokens: many(oauthAccessTokens),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  users: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const twoFactorsRelations = relations(twoFactors, ({ one }) => ({
  users: one(users, {
    fields: [twoFactors.userId],
    references: [users.id],
  }),
}));

export const passkeysRelations = relations(passkeys, ({ one }) => ({
  users: one(users, {
    fields: [passkeys.userId],
    references: [users.id],
  }),
}));

export const invitesRelations = relations(invites, ({ one, many }) => ({
  users: one(users, {
    fields: [invites.createdByUserId],
    references: [users.id],
  }),
  inviteUses: many(inviteUses),
}));

export const inviteUsesRelations = relations(inviteUses, ({ one }) => ({
  invites: one(invites, {
    fields: [inviteUses.inviteId],
    references: [invites.id],
  }),
  users: one(users, {
    fields: [inviteUses.usedByUserId],
    references: [users.id],
  }),
}));

export const nostrPubkeysRelations = relations(nostrPubkeys, ({ one }) => ({
  users: one(users, {
    fields: [nostrPubkeys.userId],
    references: [users.id],
  }),
}));

export const oauthClientsRelations = relations(
  oauthClients,
  ({ one, many }) => ({
    users: one(users, {
      fields: [oauthClients.userId],
      references: [users.id],
    }),
    oauthRefreshTokens: many(oauthRefreshTokens),
    oauthAccessTokens: many(oauthAccessTokens),
    oauthConsents: many(oauthConsents),
  }),
);

export const oauthRefreshTokensRelations = relations(
  oauthRefreshTokens,
  ({ one, many }) => ({
    oauthClients: one(oauthClients, {
      fields: [oauthRefreshTokens.clientId],
      references: [oauthClients.clientId],
    }),
    sessions: one(sessions, {
      fields: [oauthRefreshTokens.sessionId],
      references: [sessions.id],
    }),
    users: one(users, {
      fields: [oauthRefreshTokens.userId],
      references: [users.id],
    }),
    oauthAccessTokens: many(oauthAccessTokens),
  }),
);

export const oauthAccessTokensRelations = relations(
  oauthAccessTokens,
  ({ one }) => ({
    oauthClients: one(oauthClients, {
      fields: [oauthAccessTokens.clientId],
      references: [oauthClients.clientId],
    }),
    sessions: one(sessions, {
      fields: [oauthAccessTokens.sessionId],
      references: [sessions.id],
    }),
    users: one(users, {
      fields: [oauthAccessTokens.userId],
      references: [users.id],
    }),
    oauthRefreshTokens: one(oauthRefreshTokens, {
      fields: [oauthAccessTokens.refreshId],
      references: [oauthRefreshTokens.id],
    }),
  }),
);

export const oauthConsentsRelations = relations(oauthConsents, ({ one }) => ({
  oauthClients: one(oauthClients, {
    fields: [oauthConsents.clientId],
    references: [oauthClients.clientId],
  }),
  users: one(users, {
    fields: [oauthConsents.userId],
    references: [users.id],
  }),
}));
