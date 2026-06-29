import type { BetterAuthPlugin } from "better-auth"
import {
    createAuthEndpoint,
    sessionMiddleware,
    APIError,
} from "better-auth/api"

export const nostrLink = () => {
    return {
        id: "nostr-link",
        endpoints: {
            linkNostr: createAuthEndpoint(
                "/nostr/link",
                {
                    method: "POST",
                    use: [sessionMiddleware],
                    metadata: {
                        openapi: {
                            operationId: "linkNostr",
                            description:
                                "Link a Nostr public key to the authenticated user",
                        },
                    },
                },
                async (ctx) => {
                    const { unpackEventFromToken, validateEvent } =
                        await import("nostr-tools/nip98")

                    const userId = ctx.context.session.user.id

                    const token =
                        ctx.headers?.get("authorization") || ""
                    if (!token) {
                        throw new APIError("BAD_REQUEST", {
                            message: "Missing authorization token",
                        })
                    }

                    const body = (ctx.body || {}) as {
                        nonce?: string
                    }
                    const nonce =
                        typeof body.nonce === "string"
                            ? body.nonce.trim()
                            : ""
                    if (!nonce) {
                        throw new APIError("BAD_REQUEST", {
                            message: "Missing nonce",
                        })
                    }

                    const event = await unpackEventFromToken(
                        token,
                    ).catch((error: Error) => {
                        throw new APIError("BAD_REQUEST", {
                            message:
                                error.message || "Invalid token",
                        })
                    })

                    const linkUrl = new URL(ctx.request?.url ?? "")
                    linkUrl.search = ""
                    linkUrl.hash = ""
                    await validateEvent(
                        event,
                        linkUrl.toString(),
                        "post",
                        { nonce },
                    ).catch((error: Error) => {
                        throw new APIError("UNAUTHORIZED", {
                            message:
                                error.message || "Invalid event",
                        })
                    })

                    const verification =
                        await ctx.context.internalAdapter.consumeVerificationValue(
                            `nostr:${event.pubkey}`,
                        )
                    if (
                        !verification ||
                        verification.value !== nonce
                    ) {
                        throw new APIError("UNAUTHORIZED", {
                            message: "Invalid or expired nonce",
                        })
                    }

                    const existing =
                        await ctx.context.adapter.findOne<{
                            publicKey: string
                            userId: string
                        }>({
                            model: "nostrPubkey",
                            where: [
                                {
                                    field: "publicKey",
                                    value: event.pubkey,
                                },
                            ],
                        })

                    if (existing && existing.userId !== userId) {
                        throw new APIError("BAD_REQUEST", {
                            message:
                                "This Nostr key is already linked to another account",
                        })
                    }

                    if (existing && existing.userId === userId) {
                        return ctx.json(
                            { publicKey: event.pubkey },
                            { status: 200 },
                        )
                    }

                    await ctx.context.adapter.create({
                        model: "nostrPubkey",
                        data: {
                            publicKey: event.pubkey,
                            userId,
                            createdAt: new Date(),
                        },
                    })

                    return ctx.json(
                        { publicKey: event.pubkey },
                        { status: 200 },
                    )
                },
            ),
        },
    } satisfies BetterAuthPlugin
}
