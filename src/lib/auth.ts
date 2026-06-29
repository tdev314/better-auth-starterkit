import { betterAuth, type BetterAuthPlugin } from "better-auth"
import { dash, sentinel } from "@better-auth/infra"
import { passkey, getAuthenticatorName } from "@better-auth/passkey"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { admin, jwt, openAPI } from "better-auth/plugins"
import { oauthProvider } from "@better-auth/oauth-provider"; 
import { invite } from "better-invite"

import { db } from "@/database/db"
import * as schema from "@/database/schema"
import { sendEmail } from "./email"

/** Bridges better-invite `$ERROR_CODES` to Better Auth’s `RawError` shape. See `docs/typescript-better-invite.md`. */
type FixErrorCodes<T> = Omit<T, "$ERROR_CODES"> & Pick<BetterAuthPlugin, "$ERROR_CODES">

const ALLOWED_SCOPES = ["openid", "profile", "email", "offline_access"] as const

const authOrigin = (
    process.env.BETTER_AUTH_URL || "http://localhost:3000"
).replace(/\/$/, "")

export const auth = betterAuth({
    // baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    appName: process.env.APPLICATION_NAME || "Better Auth StarterKit",
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
    emailVerification: {
        sendVerificationEmail: async ({ user, url }) => {
            void sendEmail({
                to: user.email,
                subject: "Verify your email address",
                text: `Click the link to verify your email: ${url}`,
            })
        },
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
    },
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url }) => {
            void sendEmail({
                to: user.email,
                subject: "Reset your password",
                text: `Click the link to reset your password: ${url}`,
            })
        },
    },
    disabledPaths: ["/token"],
    plugins: [
        admin(),
        passkey({
            rpName: process.env.APPLICATION_NAME || "Better Auth StarterKit",
            origin: authOrigin,
            rpID: new URL(authOrigin).hostname,
            registration: {
                afterVerification: async ({ verification }) => ({
                    name: getAuthenticatorName(
                        verification.registrationInfo?.aaguid,
                    ),
                }),
            },
        }),
        invite({
            async sendUserInvitation({ email, role, url }) {
                void sendEmail({
                    to: email,
                    subject: "You've been invited",
                    text: `You've been invited with the role "${role}". Accept the invitation: ${url}`,
                })
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
                oauthAuthServerConfig: true,
            },
        }),
    ]
})
