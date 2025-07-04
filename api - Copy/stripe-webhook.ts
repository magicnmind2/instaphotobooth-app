import { NowRequest, NowResponse } from '@vercel/node';
import { stripe } from './stripe';
import Stripe from 'stripe';
import { db } from './helpers';
import { sendAccessCodeByEmail } from './email';
import { buffer } from 'micro';

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req: NowRequest, res: NowResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event: Stripe.Event;

  try {
    if (!sig || !STRIPE_WEBHOOK_SECRET) {
      throw new Error("Stripe signature or secret is missing.");
    }
    event = stripe.webhooks.constructEvent(buf, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      
      const customerEmail = session.customer_details?.email;
      const duration = parseInt(session.metadata?.duration || '3600');
      const emailLimit = parseInt(session.metadata?.email_limit || '150');
      const hasDesignStudio = session.metadata?.has_design_studio === 'true';

      if (!customerEmail) {
        console.error("No customer email found in checkout session.");
        return res.status(400).json({ error: 'Customer email is missing.' });
      }

      try {
        const newCode = await db.createCode({
            durationSeconds: duration,
            emailLimit: emailLimit,
            hasDesignStudio: hasDesignStudio,
        });
        
        db.linkStripeSession(newCode.code, session.id);
        await sendAccessCodeByEmail(customerEmail, newCode.code);

        console.log(`Successfully processed payment for ${customerEmail} and sent code ${newCode.code}.`);
      } catch (err: any) {
        console.error(`Failed to process purchase for ${customerEmail}:`, err.message);
        return res.status(500).json({ error: 'Failed to fulfill purchase.' });
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).json({ received: true });
};