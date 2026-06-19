import { betterAuth, type BetterAuthPlugin } from "better-auth"
import { dash, sentinel } from "@better-auth/infra"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { admin, jwt, openAPI } from "better-auth/plugins"
import { oauthProvider } from "@better-auth/oauth-provider"; 
import { invite } from "better-invite"

import { db } from "@/database/db"
import * as schema from "@/database/schema"

/** Bridges better-invite `$ERROR_CODES` to Better Auth’s `RawError` shape. See `docs/typescript-better-invite.md`. */
type FixErrorCodes<T> = Omit<T, "$ERROR_CODES"> & Pick<BetterAuthPlugin, "$ERROR_CODES">

const ALLOWED_SCOPES = ["openid", "profile", "email", "offline_access"] as const

export const auth = betterAuth({
    experimental: {
        joins: true,
    },
    session: {
        storeSessionInDatabase: true,
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60,
        },
    },
    database: drizzleAdapter(db, {
        provider: "pg",
        usePlural: true,
        schema
    }),
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url }, request) => {
            // Replace with your email provider (e.g. Resend, SendGrid, Nodemailer)
            console.log(`[Reset Password] ${user.email}: ${url}`)
        },
    },
    disabledPaths: ["/token"],
    plugins: [
        admin(),
        invite({
            async sendUserInvitation({ email, role, url, token, newAccount }) {
                console.log(`[Invite] ${email} (role: ${role}, new: ${newAccount}): ${url}`)
            },
        }) as unknown as FixErrorCodes<ReturnType<typeof invite>>,
        dash(), 
        sentinel(),
        openAPI(),
        jwt({
            jwt: {
                issuer: process.env.BETTER_AUTH_URL || process.env.OAUTH_ISSUER || "http://localhost:3000",
            },
        }),
        oauthProvider({
            loginPage: "/auth/sign-in",
            consentPage: "/consent",
            scopes: [...ALLOWED_SCOPES],
            validAudiences: [
                process.env.BETTER_AUTH_URL || process.env.OAUTH_AUDIENCE || "http://localhost:3000",
            ],
            allowDynamicClientRegistration: true,
            allowUnauthenticatedClientRegistration: false,
            allowPublicClientPrelogin: false,
            clientRegistrationAllowedScopes: [...ALLOWED_SCOPES],
            rateLimit: {
                register: { window: 60, max: 3 },
                authorize: { window: 60, max: 20 },
                token: { window: 60, max: 15 },
                revoke: { window: 60, max: 10 },
                introspect: { window: 60, max: 20 },
                userinfo: { window: 60, max: 30 },
            },
            customAccessTokenClaims: async ({ user }) => (
                user?.role ? { roles: [user.role] } : {}
            ),
            customIdTokenClaims: async ({ user }) => (
                user.role ? { roles: [user.role] } : {}
            ),
            customUserInfoClaims: async ({ user }) => (
                user.role ? { roles: [user.role] } : {}
            ),
            advertisedMetadata: {
                claims_supported: [
                    "sub", "iss", "aud", "exp", "iat", "sid", "scope", "azp",
                    "email", "email_verified",
                    "name", "picture", "given_name", "family_name",
                    "roles",
                ],
            },
            silenceWarnings: {
                openidConfig: true,
                oauthConfig: true,
            },
        }),
    ]
})
