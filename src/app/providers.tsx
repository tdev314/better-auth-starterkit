"use client"

import { AuthUIProvider } from "@daveyplate/better-auth-ui"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ThemeProvider } from "next-themes"
import type { ReactNode } from "react"
import { Suspense } from "react"
import { Toaster } from "sonner"

import { authClient } from "@/lib/auth-client"
import { PHProvider } from "@/components/posthog-provider"
import { PostHogIdentify } from "@/components/posthog-identify"
import { PostHogPageView } from "@/components/posthog-page-view"

export function Providers({ children }: { children: ReactNode }) {
    const router = useRouter()

    return (
        <PHProvider>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <AuthUIProvider
                    authClient={authClient}
                    navigate={router.push}
                    replace={router.replace}
                    onSessionChange={() => {
                        router.refresh()
                    }}
                    Link={Link}
                    redirectTo="/account/settings"
                    passkey
                >
                    <Suspense fallback={null}>
                        <PostHogPageView />
                    </Suspense>
                    <PostHogIdentify />

                    {children}

                    <Toaster />
                </AuthUIProvider>
            </ThemeProvider>
        </PHProvider>
    )
}
