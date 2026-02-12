# Deploying VerseAid to Vercel (GitHub)

With the repo connected to Vercel, each push to your connected branch triggers a build and deploy. The app uses **Vite** for the frontend and **Vercel serverless API routes** under `/api` for Stripe (health, checkout, webhook).

## 1. Environment variables in Vercel

In [Vercel Dashboard](https://vercel.com/dashboard) → your project → **Settings** → **Environment Variables**, add:

| Name | Value | Notes |
|------|--------|--------|
| `STRIPE_SECRET_KEY` | `sk_live_...` | From Stripe Dashboard → API keys |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | From Stripe webhook endpoint (see STRIPE_WEBHOOK_SETUP.md) |
| `FRONTEND_URL` | `https://verseaid.ai` | Origin of your site (for CORS and redirect URLs) |
| `VITE_STRIPE_API_URL` | `https://verseaid.ai/api` | **Required at build time** – API base URL |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | **Required at build time** – from Stripe |
| `VITE_ANTHROPIC_API_KEY` | (your key) | **Required at build time** if you use AI features |

Apply to **Production** (and Preview if you want them in preview deployments).

## 2. Deploy

- **Automatic:** Push to the branch connected to Vercel; it will run `npm run build` and deploy `dist/` plus the `api/` routes.
- **Manual:** In Vercel Dashboard, open the project and click **Redeploy** for the latest commit.

## 3. Stripe webhook URL

For Vercel, the Stripe webhook URL is:

**`https://verseaid.ai/api/webhook`**

Use this when adding the endpoint in [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks) and set `STRIPE_WEBHOOK_SECRET` in Vercel to the signing secret Stripe shows for that endpoint.

## 4. Local development

- **Frontend:** `npm run dev` (uses `VITE_*` from `.env`).
- **Backend (local):** Set `VITE_STRIPE_API_URL=http://localhost:3002` in `.env` and run `npm run server` so the app talks to your local Node server instead of Vercel’s `/api`.
