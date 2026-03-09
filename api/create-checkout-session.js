import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-11-20.acacia' });
const origin = process.env.FRONTEND_URL || 'https://verseaid.ai';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify JWT from Authorization header
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = authHeader.slice(7);

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  try {
    const { priceId, isSubscription, planName, username, successUrl, cancelUrl, trialPeriodDays } = req.body || {};
    if (!priceId) return res.status(400).json({ error: 'priceId is required' });
    if (!username) return res.status(400).json({ error: 'username is required' });

    // Confirm the verified user matches the username in the request body
    const verifiedUsername = user.user_metadata?.full_name || user.email;
    if (verifiedUsername !== username) {
      return res.status(403).json({ error: 'username does not match authenticated user' });
    }

    if (successUrl && !successUrl.startsWith(origin)) {
      return res.status(400).json({ error: 'Invalid successUrl' });
    }
    if (cancelUrl && !cancelUrl.startsWith(origin)) {
      return res.status(400).json({ error: 'Invalid cancelUrl' });
    }

    const sessionParams = {
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: isSubscription ? 'subscription' : 'payment',
      success_url: successUrl || `${origin}?payment=success&type=${isSubscription ? 'subscription' : 'payment'}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${origin}?payment=cancel`,
      client_reference_id: username,
      metadata: { plan: planName || 'Premium', username },
    };
    if (isSubscription) {
      sessionParams.subscription_data = { metadata: { plan: planName || 'Premium', username } };
      if (trialPeriodDays && trialPeriodDays > 0) {
        sessionParams.subscription_data.trial_period_days = trialPeriodDays;
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Create checkout session error:', error.message);
    res.status(500).json({ error: 'Failed to create checkout session', message: error.message });
  }
}
