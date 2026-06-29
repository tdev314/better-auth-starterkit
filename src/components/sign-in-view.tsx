"use client"

import { AuthView } from "@daveyplate/better-auth-ui"
import { useEffect, useState } from "react"

import { NostrSignInButton } from "@/components/nostr-sign-in-button"

export function SignInView() {
    const [hasNostr, setHasNostr] = useState(false)

    useEffect(() => {
        if (typeof window !== "undefined" && window.nostr) {
            setHasNostr(true)
        }
    }, [])

    return (
        <AuthView
            path="sign-in"
            cardFooter={hasNostr ? <NostrSignInButton /> : undefined}
        />
    )
}
