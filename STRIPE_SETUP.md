# Stripe Backend API Setup Guide

This guide will help you set up the Stripe backend API for VerseAid.ai payment processing.

## Prerequisites

- Node.js 20.x installed
- A Stripe account (sign up at https://stripe.com)
- Your Stripe API keys from the Stripe Dashboard

## Step 1: Install Dependencies

Run the following command to install all required dependencies:

```bash
npm install
```

This will install:
- `express` - Web server framework
- `stripe` - Stripe SDK
- `cors` - CORS middleware
- `dotenv` - Environment variable management
- `concurrently` - Run frontend and backend together (dev dependency)

## Step 2: Get Your Stripe API Keys

1. Go to https://dashboard.stripe.com/apikeys
2. Copy your **Publishable key** (starts with `pk_`)
3. Copy your **Secret key** (starts with `sk_`)

**Important:** 
- Use **Test keys** for development (`pk_test_...` and `sk_test_...`)
- Use **Live keys** for production (`pk_live_...` and `sk_live_...`)

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Stripe secret key:
   ```
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
   ```

3. Make sure your `.env` file includes:
   ```
   VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
   PORT=3001
   FRONTEND_URL=http://localhost:5173
   VITE_STRIPE_API_URL=http://localhost:3001
   ```

**Note:** The `.env` file is already in `.gitignore` and won't be committed to git.

## Step 4: Verify Stripe Price IDs

Make sure your Stripe Price IDs in `src/App.jsx` match your Stripe Dashboard:

- `STRIPE_PRICE_ID_MONTHLY` - Monthly subscription price ID
- `STRIPE_PRICE_ID_ANNUAL` - Annual subscription price ID  
- `STRIPE_PRICE_ID_LIFETIME` - One-time payment price ID

You can find/create these in Stripe Dashboard → Products.

## Step 5: Start the Backend Server

### Development (with auto-reload):
```bash
npm run dev:server
```

### Production:
```bash
npm run server
```

The server will start on `http://localhost:3001` (or the PORT you specified).

### Test the server:
Visit `http://localhost:3001/health` - you should see:
```json
{"status":"ok","message":"Stripe API server is running"}
```

## Step 6: Start the Frontend

In a **separate terminal**, start the frontend:

```bash
npm run dev
```

Or run both together:
```bash
npm run dev:all
```

## Step 7: Test the Payment Flow

1. Make sure both frontend and backend are running
2. Log in to your app
3. Click "Upgrade" or try to access a premium feature
4. Select a payment plan
5. You should be redirected to Stripe Checkout
6. Use Stripe test card: `4242 4242 4242 4242`
7. Use any future expiry date and any CVC

## Troubleshooting

### "Failed to create checkout session"
- Check that your Stripe secret key is correct in `.env`
- Make sure the backend server is running
- Check the backend console for error messages

### "Backend API URL not configured"
- Make sure `VITE_STRIPE_API_URL` is set in your `.env` file
- Restart the frontend dev server after adding environment variables

### CORS errors
- Make sure `FRONTEND_URL` in `.env` matches your frontend URL
- Default is `http://localhost:5173` for Vite

### Stripe redirect not working
- Verify your `STRIPE_PUBLISHABLE_KEY` in `src/App.jsx` matches your Stripe Dashboard
- Make sure you're using the same mode (test/live) for both keys

## Production Deployment

### Environment Variables for Production:

1. Use **live** Stripe keys (not test keys)
2. Set `FRONTEND_URL` to your production domain
3. Set `VITE_STRIPE_API_URL` to your production backend URL
4. Set up webhook endpoint (optional but recommended):
   - In Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://your-domain.com/webhook`
   - Copy the webhook secret to `STRIPE_WEBHOOK_SECRET` in `.env`

### Deploy Backend:

The backend can be deployed to:
- Heroku
- Railway
- Render
- AWS Lambda (with modifications)
- Any Node.js hosting service

Make sure to:
- Set all environment variables in your hosting platform
- Keep your Stripe secret key secure (never commit it)
- Enable HTTPS for production

## API Endpoints

### `POST /create-checkout-session`
Creates a Stripe Checkout Session.

**Request Body:**
```json
{
  "priceId": "price_1234567890",
  "isSubscription": true,
  "planName": "Monthly Premium",
  "username": "user123",
  "successUrl": "http://localhost:5173?payment=success&type=subscription",
  "cancelUrl": "http://localhost:5173?payment=cancel",
  "trialPeriodDays": 3
}
```

**Response:**
```json
{
  "sessionId": "cs_test_1234567890"
}
```

### `GET /health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "Stripe API server is running"
}
```

### `POST /webhook`
Stripe webhook endpoint for handling events (optional).

## Support

If you encounter issues:
1. Check the backend console for error messages
2. Check the browser console for frontend errors
3. Verify all environment variables are set correctly
4. Test the `/health` endpoint to ensure the server is running
