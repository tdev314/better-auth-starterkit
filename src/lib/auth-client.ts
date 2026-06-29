import { createAuthClient } from "better-auth/react"
import { type BetterAuthPlugin } from "better-auth"
import { passkeyClient } from "@better-auth/passkey/client"
import { adminClient } from "better-auth/client/plugins"
import { dashClient, sentinelClient } from "@better-auth/infra/client"
import { oauthProviderClient } from "@better-auth/oauth-provider/client"
import { inviteClient, type invite } from "better-invite"
import posthog from "@/lib/posthog"

/** See `docs/typescript-better-invite.md` — must match server `invite()` shim. */
type FixErrorCodes<T> = Omit<T, "$ERROR_CODES"> & Pick<BetterAuthPlugin, "$ERROR_CODES">

const authEventsByPath: Record<string, string> = {
  "/change-email": "email_changed",
  "/change-password": "password_changed",
  "/update-user": "profile_updated",
  "/passkey/verify-authentication": "passkey_sign_in",
  "/passkey/verify-registration": "passkey_added",
  "/passkey/delete-passkey": "passkey_deleted",
}

export const authClient = createAuthClient({
  plugins: [
    passkeyClient(),
    adminClient(),
    dashClient(),
    sentinelClient({
      autoSolveChallenge: true,
      ...(process.env.NEXT_PUBLIC_BETTER_AUTH_IDENTIFY_URL && {
        identifyUrl: process.env.NEXT_PUBLIC_BETTER_AUTH_IDENTIFY_URL,
      }),
    }),
    oauthProviderClient(),
    inviteClient() as unknown as {
      id: "invite"
      $InferServerPlugin: FixErrorCodes<ReturnType<typeof invite>>
    },
  ],
  fetchOptions: {
    onSuccess: (ctx) => {
      if (typeof window === "undefined") return
      const path = new URL(ctx.response.url).pathname
      for (const [suffix, event] of Object.entries(authEventsByPath)) {
        if (path.endsWith(suffix)) {
          posthog.capture(event)
          break
        }
      }
    },
  },
})
