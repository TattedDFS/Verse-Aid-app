import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Validate Stripe secret key before initializing
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY || typeof STRIPE_SECRET_KEY !== 'string' || !STRIPE_SECRET_KEY.startsWith('sk_')) {
  console.error('Missing or invalid STRIPE_SECRET_KEY. Set STRIPE_SECRET_KEY in your .env file (e.g. sk_test_... or sk_live_...).');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Webhook must get raw body for Stripe signature verification — register before express.json()
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set. Set it in .env before receiving webhooks.');
    return res.status(500).send('Webhook not configured');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      console.log('Checkout session completed:', event.data.object.id);
      break;
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      console.log('Subscription updated:', event.data.object.id);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  res.json({ received: true });
});

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Stripe API server is running' });
});

// Create Stripe Checkout Session endpoint
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { 
      priceId, 
      isSubscription, 
      planName, 
      username, 
      successUrl, 
      cancelUrl,
      trialPeriodDays 
    } = req.body;

    // Validate required fields
    if (!priceId || typeof priceId !== 'string' || !priceId.trim()) {
      return res.status(400).json({ error: 'priceId must be a non-empty string' });
    }

    if (!username) {
      return res.status(400).json({ error: 'username is required' });
    }

    const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
    if (successUrl && !successUrl.startsWith(allowedOrigin)) {
      return res.status(400).json({ error: 'Invalid successUrl' });
    }
    if (cancelUrl && !cancelUrl.startsWith(allowedOrigin)) {
      return res.status(400).json({ error: 'Invalid cancelUrl' });
    }

    // Build session parameters
    const sessionParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: isSubscription ? 'subscription' : 'payment',
      // Stripe replaces {CHECKOUT_SESSION_ID} in success_url when redirecting; frontend reads session_id from URL
      success_url: successUrl || `${process.env.FRONTEND_URL || 'http://localhost:5173'}?payment=success&type=${isSubscription ? 'subscription' : 'payment'}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL || 'http://localhost:5173'}?payment=cancel`,
      client_reference_id: username,
      metadata: {
        plan: planName || 'Premium',
        username: username,
      },
    };

    // Add subscription-specific options (trial period, etc.)
    if (isSubscription) {
      sessionParams.subscription_data = {
        metadata: {
          plan: planName || 'Premium',
          username: username,
        },
      };

      // Add trial period if specified
      if (trialPeriodDays !== undefined && trialPeriodDays !== null) {
        if (!Number.isInteger(trialPeriodDays) || trialPeriodDays <= 0) {
          return res.status(400).json({ error: 'trialPeriodDays must be a positive integer' });
        }
        sessionParams.subscription_data.trial_period_days = trialPeriodDays;
      }
    }

    // Create the checkout session
    const session = await stripe.checkout.sessions.create(sessionParams);

    // Return url for redirect (redirectToCheckout was removed in Stripe.js 2025); sessionId kept for frontend success URL handling
    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      message: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Stripe API server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`💳 Checkout endpoint: http://localhost:${PORT}/create-checkout-session`);
});
