import type { NostrEvent, EventTemplate } from "nostr-tools/core"

declare global {
    interface Window {
        nostr?: {
            getPublicKey(): Promise<string>
            signEvent(event: EventTemplate): Promise<NostrEvent>
        }
    }
}
