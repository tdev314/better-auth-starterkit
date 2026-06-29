"use client"

import { ZapIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { linkNostrKey } from "@/lib/nostr-link-client"
import { Button } from "./ui/button"

export function LinkNostrKey() {
    const [isPending, setIsPending] = useState(false)
    const [linkedKey, setLinkedKey] = useState<string | null>(null)
    const [hasExtension, setHasExtension] = useState(false)

    useEffect(() => {
        if (typeof window !== "undefined" && window.nostr) {
            setHasExtension(true)
        }
    }, [])

    async function handleLink() {
        setIsPending(true)
        try {
            const { publicKey } = await linkNostrKey()
            setLinkedKey(publicKey)
            toast.success("Nostr key linked successfully")
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Failed to link Nostr key",
            )
        } finally {
            setIsPending(false)
        }
    }

    if (!hasExtension) {
        return (
            <p className="text-muted-foreground text-sm">
                Install a Nostr browser extension (NIP-07) to link your key.
            </p>
        )
    }

    if (linkedKey) {
        return (
            <div className="flex flex-col gap-2">
                <p className="text-sm">Nostr key linked:</p>
                <code className="break-all rounded bg-muted px-2 py-1 text-xs">
                    {linkedKey}
                </code>
            </div>
        )
    }

    return (
        <Button disabled={isPending} onClick={handleLink}>
            <ZapIcon />
            {isPending ? "Linking..." : "Link Nostr Key"}
        </Button>
    )
}
