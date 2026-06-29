const AUTH_BASE = "/api/auth"

function getLinkUrl() {
    const origin =
        typeof window !== "undefined" ? window.location.origin : ""
    return `${origin}${AUTH_BASE}/nostr/link`
}

async function getPublicKeyFromExtension(): Promise<string> {
    if (typeof window === "undefined" || !window.nostr) {
        throw new Error("Nostr extension not found")
    }
    return window.nostr.getPublicKey()
}

async function signTokenWithExtension(
    url: string,
    payload: Record<string, unknown>,
): Promise<string> {
    const { getToken } = await import("nostr-tools/nip98")
    if (!window.nostr) throw new Error("Nostr extension not found")
    const sign = window.nostr.signEvent.bind(window.nostr)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return getToken(url, "post", (e: any) => sign(e), true, payload)
}

export async function linkNostrKey(): Promise<{ publicKey: string }> {
    const publicKey = await getPublicKeyFromExtension()

    const nonceResponse = await fetch(`${AUTH_BASE}/nostr/nonce`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicKey }),
    })
    if (!nonceResponse.ok) {
        throw new Error("Failed to fetch nonce")
    }
    const { nonce } = (await nonceResponse.json()) as { nonce: string }

    const linkUrl = getLinkUrl()
    const token = await signTokenWithExtension(linkUrl, { nonce })

    const linkResponse = await fetch(`${AUTH_BASE}/nostr/link`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: token,
        },
        body: JSON.stringify({ nonce }),
    })

    if (!linkResponse.ok) {
        const err = (await linkResponse.json().catch(() => null)) as {
            message?: string
        } | null
        throw new Error(err?.message || "Failed to link Nostr key")
    }

    return (await linkResponse.json()) as { publicKey: string }
}
