import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-11-20.acacia' });
const origin = process.env.FRONTEND_URL || 'https://verseaid.ai';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId, isSubscription, planName, username, successUrl, cancelUrl, trialPeriodDays } = req.body || {};
    if (!priceId) return res.status(400).json({ error: 'priceId is required' });
    if (!username) return res.status(400).json({ error: 'username is required' });

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
    console.error('Create checkout session error:', error);
    res.status(500).json({ error: 'Failed to create checkout session', message: error.message });
  }
}
