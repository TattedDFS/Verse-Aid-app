import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
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
    if (!priceId) {
      return res.status(400).json({ error: 'priceId is required' });
    }

    if (!username) {
      return res.status(400).json({ error: 'username is required' });
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
      success_url: successUrl || `${process.env.FRONTEND_URL || 'http://localhost:5173'}?payment=success&type=${isSubscription ? 'subscription' : 'payment'}`,
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
      if (trialPeriodDays && trialPeriodDays > 0) {
        sessionParams.subscription_data.trial_period_days = trialPeriodDays;
      }
    }

    // Create the checkout session
    const session = await stripe.checkout.sessions.create(sessionParams);

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      message: error.message 
    });
  }
});

// Webhook endpoint for Stripe events (optional, for handling subscription updates)
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // For development, you can skip webhook signature verification
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Checkout session completed:', session.id);
      // Here you could update your database, send confirmation emails, etc.
      break;
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      console.log('Subscription updated:', subscription.id);
      // Handle subscription updates
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

app.listen(PORT, () => {
  console.log(`🚀 Stripe API server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`💳 Checkout endpoint: http://localhost:${PORT}/create-checkout-session`);
});
