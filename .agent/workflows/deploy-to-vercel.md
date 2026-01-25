---
description: Deploy AI Bingo to Vercel with Postgres
---

# Deploying AI Bingo to Vercel

Since Vercel Serverless environment is ephemeral, we cannot use SQLite (`dev.db`) for production. We must switch to Vercel Postgres (or another Postgres provider like Supabase/Neon).

## Prerequisite: Database Migration

1.  **Install Vercel CLI** (Optional, or use Dashboard)
2.  **Create a Postgres Database** on Vercel Dashboard -> Storage -> Postgres -> Create.
3.  **Link the Project**:
    ```bash
    vercel link
    vercel env pull .env.development.local
    ```
    This will download `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING`.

## Step 1: Update Prisma Config for Production

We need to conditionally use Postgres in production. The easiest way is to update `prisma/schema.prisma` before deploying.

**Modify `prisma/schema.prisma`**:
```prisma
datasource db {
  provider = "postgresql" // Changed from sqlite
  url      = env("POSTGRES_PRISMA_URL") // Uses connection pooling
  directUrl = env("POSTGRES_URL_NON_POOLING") // For direct connection
}
```

> [!WARNING]
> This will break your local SQLite setup if you don't revert it. For a smoother workflow, developers often keep two schema files or use environment variables to switch providers (requires advanced setup). 
> **Simpler for now**: Just edit the file before pushing to git/deploying.

## Step 2: Environment Variables
Go to Vercel Project Settings -> Environment Variables and add:

- `GEMINI_API_KEY`: Your AI Studio key.
- `NEXT_PUBLIC_APP_URL`: Your Vercel domain (e.g., `https://ai-bingo.vercel.app`).
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (If using real email).
    - *Note*: Ethereal won't work well in Prod (you can't see the console logs). Use a real provider like Resend/SendGrid for magic links.
    - **Or**: Use "Simulated" mode but you won't be able to click the link easily.
    - **Recommendation**: Sign up for **Resend** (Free tier) and add API key.

## Step 3: Deployment
1.  Push code to GitHub.
2.  Import Repo in Vercel.
3.  Vercel will auto-detect Next.js.
4.  **Build Command**: `npx prisma generate && next build` (Default is usually fine, but Prisma needs generation).
5.  **Post-Install**: `npx prisma db push` (to sync schema with Vercel Postgres).

## Checklist
- [ ] Switched Prisma provider to `postgresql`.
- [ ] Added `GEMINI_API_KEY` in Vercel.
- [ ] Added `NEXT_PUBLIC_APP_URL` in Vercel.
- [ ] Ran `npx prisma db push` against prod DB.
