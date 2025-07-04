import { NowRequest, NowResponse } from '@vercel/node';
import { stripe } from './stripe';
import { PURCHASE_OPTIONS } from '../constants';

const SITE_URL = process.env.SITE_URL;

export default async (req: NowRequest, res: NowResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { priceId } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required.' });
    }
    
    const option = PURCHASE_OPTIONS.find(p => p.id === priceId);
    if (!option) {
        return res.status(404).json({ error: 'Purchase option not found.' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `InstaPhotoBooth - ${option.name} Pass`,
              description: option.features.join(', '),
            },
            unit_amount: option.price * 100, // Price in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${SITE_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}`,
      allow_promotion_codes: true,
      metadata: {
        duration: option.duration,
        email_limit: option.emailLimit,
        has_design_studio: String(option.hasDesignStudio),
      }
    });

    res.status(200).json({ url: session.url });

  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: `Internal Server Error: ${error.message}` });
  }
};