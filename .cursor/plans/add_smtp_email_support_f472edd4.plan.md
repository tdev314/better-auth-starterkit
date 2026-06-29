---
name: Add SMTP Email Support
overview: Add conditional SMTP email support using nodemailer that activates when SMTP environment variables are present, falling back to console.log stubs when they're not. This is independent of the Better Auth dashboard.
todos:
  - id: add-nodemailer
    content: Install nodemailer and @types/nodemailer
    status: completed
  - id: create-email-util
    content: Create src/lib/email.ts with conditional SMTP transporter
    status: completed
  - id: wire-auth-config
    content: Update src/lib/auth.ts to use sendEmail for reset password, email verification, and invitations
    status: completed
  - id: update-env-example
    content: Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM to .env.example
    status: completed
  - id: update-docs
    content: Document SMTP variables in docs/environment-variables.md
    status: completed
isProject: false
---

# Add Conditional SMTP Support

## Approach

Create a reusable email utility powered by `nodemailer` that is conditionally enabled based on the presence of SMTP environment variables. When SMTP vars are missing, the existing console.log fallback behavior is preserved. This has no dependency on the Better Auth dashboard (`dash()` plugin).

## Environment Variables

New SMTP variables (all optional -- if any required ones are missing, SMTP is disabled):

- `SMTP_HOST` -- SMTP server hostname (e.g. `smtp.gmail.com`, `smtp.resend.com`)
- `SMTP_PORT` -- SMTP port (defaults to `587`)
- `SMTP_USER` -- SMTP auth username
- `SMTP_PASS` -- SMTP auth password / API key
- `SMTP_FROM` -- Sender address (e.g. `"App Name <noreply@example.com>"`)

## Files to Create/Modify

### 1. New file: `src/lib/email.ts`

A small utility that:
- Checks for `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM` at module load
- If present, creates a nodemailer transporter and exports a `sendEmail` function
- If missing, exports a no-op that logs to console
- Exports a boolean `smtpEnabled` for conditional logic elsewhere

```typescript
import nodemailer from "nodemailer"

const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const SMTP_FROM = process.env.SMTP_FROM

export const smtpEnabled = !!(SMTP_HOST && SMTP_USER && SMTP_PASS && SMTP_FROM)

const transporter = smtpEnabled
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  : null

export async function sendEmail(opts: { to: string; subject: string; text: string; html?: string }) {
  if (!transporter) {
    console.log(`[Email] To: ${opts.to} | Subject: ${opts.subject}`)
    console.log(`[Email] ${opts.text}`)
    return
  }
  await transporter.sendMail({ from: SMTP_FROM, ...opts })
}
```

### 2. Modify: [`src/lib/auth.ts`](src/lib/auth.ts)

- Import `sendEmail` from `./email`
- Replace the `sendResetPassword` console.log stub with a call to `sendEmail`
- Add `emailVerification.sendVerificationEmail` that also calls `sendEmail`
- Replace the invite plugin's `sendUserInvitation` console.log stub with a call to `sendEmail`

The key point: `sendEmail` already handles the fallback internally, so the auth config doesn't need conditionals.

### 3. Modify: [`.env.example`](.env.example)

Add the SMTP variables with comments.

### 4. Modify: [`docs/environment-variables.md`](docs/environment-variables.md)

Document the new SMTP variables in the optional section.

### 5. Add dependency: `nodemailer` + `@types/nodemailer`

```bash
pnpm add nodemailer
pnpm add -D @types/nodemailer
```

## Design Decisions

- **No coupling to dashboard**: The email utility is a standalone module imported by `auth.ts`. The `dash()` plugin is unaffected.
- **Graceful fallback**: If SMTP vars are absent, behavior is identical to today (console.log). No errors thrown.
- **Single responsibility**: `src/lib/email.ts` owns all SMTP logic. Auth config just calls `sendEmail`.
- **Secure defaults**: TLS is auto-enabled for port 465; STARTTLS is used for other ports (nodemailer default).
