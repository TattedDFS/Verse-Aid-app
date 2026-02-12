# Stripe Webhook Setup for VerseAid

Use these steps to receive Stripe events (e.g. successful payments, subscription updates) on your server.

## 1. Decide your webhook URL

Your backend must be reachable at a public URL. Examples:

- If the Node server is at the same domain as the app:  
  **`https://verseaid.ai/webhook`** (if the API is at the root)  
  or **`https://verseaid.ai/api/webhook`** (if the API is under `/api`).

Use the **exact** URL where you deploy the server. The frontend `VITE_STRIPE_API_URL` must match the same base (e.g. `https://verseaid.ai` or `https://verseaid.ai/api`).

## 2. Create the webhook in Stripe Dashboard

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks).
2. Click **Add endpoint**.
3. **Endpoint URL:** Enter your webhook URL (e.g. `https://verseaid.ai/webhook` or `https://verseaid.ai/api/webhook`).
4. **Events to send:** Choose **Select events**, then add:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
5. Click **Add endpoint**.

## 3. Get the signing secret

1. Open the webhook you just created.
2. Under **Signing secret**, click **Reveal**.
3. Copy the value (it starts with `whsec_`).

## 4. Add the secret to your environment

In your `.env` file (on the server that runs the Node app), set:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx
```

Restart the Node server after changing `.env`. In production, the server **requires** `STRIPE_WEBHOOK_SECRET`; if it is missing, webhook requests will return 500.

## 5. Test (optional)

In the Stripe Dashboard, open your webhook endpoint and use **Send test webhook** to send a test event. Check your server logs to confirm the event is received and signature verification succeeds.
