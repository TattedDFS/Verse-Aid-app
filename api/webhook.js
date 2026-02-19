import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-11-20.acacia' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const data = event.data.object;

  if (event.type === 'checkout.session.completed') {
    const customerId = data.customer;
    const subscriptionId = data.subscription;
    const customerEmail = data.customer_details?.email;

    let tier = 'monthly';
    if (data.amount_total === 4999) tier = 'yearly';
    if (data.amount_total === 8999) tier = 'lifetime';

    const { error } = await supabase
      .from('profiles')
      .update({
        stripe_customer_id: customerId,
        subscription_id: subscriptionId,
        subscription_tier: tier,
        subscription_status: 'active',
      })
      .eq('email', customerEmail);

    if (error) {
      console.error('Supabase update error:', error.message);
      return res.status(500).json({ error: 'Database update failed' });
    }

    console.log(`Premium activated for ${customerEmail} - tier: ${tier}`);
  }

  if (event.type === 'customer.subscription.deleted') {
    const customerId = data.customer;

    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_tier: 'free',
        subscription_status: 'cancelled',
        subscription_id: null,
      })
      .eq('stripe_customer_id', customerId);

    if (error) {
      console.error('Supabase cancel error:', error.message);
    }

    console.log(`Subscription cancelled for customer: ${customerId}`);
  }

  res.status(200).json({ received: true });
}