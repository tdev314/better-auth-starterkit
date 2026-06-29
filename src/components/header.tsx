import { GitHubIcon, UserButton } from "@daveyplate/better-auth-ui"
import { headers } from "next/headers"
import Link from "next/link"
import { Settings } from "lucide-react"

import { auth } from "@/lib/auth"
import { ModeToggle } from "./mode-toggle"
import { Button } from "./ui/button"

export async function Header() {
    const session = await auth.api.getSession({ headers: await headers() }).catch(() => null)
    const isAdmin = session?.user?.role === "admin"

    return (
        <header className="sticky top-0 z-50 flex h-12 justify-between border-b bg-background/60 px-safe-or-4 backdrop-blur md:h-14 md:px-safe-or-6">
            <Link href="/" className="flex items-center gap-2">
                <svg
                    className="size-5"
                    fill="none"
                    height="45"
                    viewBox="0 0 60 45"
                    width="60"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        className="fill-black dark:fill-white"
                        clipRule="evenodd"
                        d="M0 0H15V45H0V0ZM45 0H60V45H45V0ZM20 0H40V15H20V0ZM20 30H40V45H20V30Z"
                        fillRule="evenodd"
                    />
                </svg>
                {process.env.APPLICATION_NAME || "BETTER-AUTH. STARTER"}
            </Link>

            <div className="flex items-center gap-2">
                {isAdmin && (
                    <Link href="/admin">
                        <Button
                            variant="outline"
                            size="icon"
                            className="size-8 rounded-full"
                        >
                            <Settings className="size-4" />
                        </Button>
                    </Link>
                )}

                {process.env.NEXT_PUBLIC_HIDE_GITHUB !== "true" && (
                    <Link
                        href="https://github.com/tdev314/better-auth-starterkit"
                        target="_blank"
                    >
                        <Button
                            variant="outline"
                            size="icon"
                            className="size-8 rounded-full"
                        >
                            <GitHubIcon />
                        </Button>
                    </Link>
                )}

                <ModeToggle />
                <UserButton size="icon" />
            </div>
        </header>
    )
}
