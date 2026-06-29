# Environment Variables

Copy `.env.example` to `.env` and fill in the values relevant to your deployment.

```bash
cp .env.example .env
```

---

## Required

These variables must be set for the application to start.

| Variable | Description |
|----------|-------------|
| `BETTER_AUTH_URL` | Public base URL of the auth server (e.g. `https://auth.example.com`). Used as the JWT issuer, OAuth audience, and resource identifier. Defaults to `http://localhost:3000` in development. |
| `BETTER_AUTH_SECRET` | Random secret used by Better Auth to sign sessions and tokens. Generate one with `openssl rand -hex 32`. |
| `DATABASE_URL` | PostgreSQL connection string (e.g. `postgresql://user:pass@host:5432/dbname`). Used by Drizzle ORM and Better Auth. |

---

## Better Auth

| Variable | Description |
|----------|-------------|
| `BETTER_AUTH_API_KEY` | API key for the Better Auth Dash plugin. Required for accessing the built-in Better Auth dashboard at `/api/auth/admin`. |

---

## OAuth Provider

These configure the OAuth 2.1 / OpenID Connect provider plugin.

| Variable | Description | Default |
|----------|-------------|---------|
| `OAUTH_ISSUER` | Override the JWT `iss` claim. Falls back to `BETTER_AUTH_URL`. | `BETTER_AUTH_URL` |
| `OAUTH_AUDIENCE` | Override the valid audience list for access tokens. Falls back to `BETTER_AUTH_URL`. | `BETTER_AUTH_URL` |

---

## Branding

Customize the app name, theme color, and asset URLs. All are optional.

| Variable | Description | Default |
|----------|-------------|---------|
| `APPLICATION_NAME` | Display name shown in the header, metadata, OG images, and PWA manifest. | `BETTER-AUTH. STARTER` |
| `NEXT_PUBLIC_PRIMARY_HUE` | OKLCH hue value (0-360) for the primary theme color. Set as `--primary-hue` CSS variable. | Theme default |
| `NEXT_PUBLIC_PRIMARY_CHROMA` | OKLCH chroma value for the primary theme color. Set as `--primary-chroma` CSS variable. | Theme default |
| `FAVICON_URL` | URL to a custom favicon. | `/icon.svg` |
| `ICON_URL` | URL to an apple-touch-icon / PWA icon. | `/apple-touch-icon.png` |
| `OPENGRAPH_IMAGE_URL` | URL to a custom Open Graph image for social previews. | Generated at runtime |
| `LOGO_URL` | URL to a custom logo image. | None |

---

## UI

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_HIDE_GITHUB` | Set to `"true"` to hide the GitHub link in the header. | Not set (link visible) |

---

## SMTP (Email)

Optional. When all required SMTP variables are set, emails (password reset, email verification, invitations) are sent via SMTP. Otherwise they are logged to the console.

| Variable | Description | Default |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server hostname (e.g. `smtp.gmail.com`, `smtp.resend.com`). | None (disabled) |
| `SMTP_PORT` | SMTP server port. | `587` |
| `SMTP_USER` | SMTP authentication username. | None (disabled) |
| `SMTP_PASS` | SMTP authentication password or API key. | None (disabled) |
| `SMTP_FROM` | Sender address (e.g. `"App Name <noreply@example.com>"`). | None (disabled) |

---

## Analytics (PostHog)

Optional. When `NEXT_PUBLIC_POSTHOG_KEY` is not set, PostHog is disabled entirely.

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project API key. Enables event tracking and user identification. | None (disabled) |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog API host URL. | `https://us.i.posthog.com` |

---

## Prefix conventions

| Prefix | Visibility |
|--------|------------|
| `NEXT_PUBLIC_` | Exposed to the browser. Safe only for non-secret values. |
| *(no prefix)* | Server-only. Never sent to the client. |
