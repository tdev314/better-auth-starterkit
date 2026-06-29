import Link from "next/link"

import { LinkNostrKey } from "@/components/link-nostr-key"

export default function NostrAccountPage() {
    return (
        <main className="container self-center p-4 md:p-6">
            <div className="mx-auto flex max-w-md flex-col gap-6">
                <div className="flex flex-col gap-1.5">
                    <h1 className="font-semibold text-lg md:text-xl">
                        Nostr Key
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Link your Nostr public key to enable Nostr sign-in.
                        You need a NIP-07 browser extension (e.g. Alby, nos2x).
                    </p>
                </div>

                <LinkNostrKey />

                <Link
                    className="text-muted-foreground text-xs hover:text-foreground hover:underline"
                    href="/account/settings"
                >
                    Back to settings
                </Link>
            </div>
        </main>
    )
}
