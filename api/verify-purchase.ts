import { NowRequest, NowResponse } from '@vercel/node';
import { stripe } from './stripe';
import { db } from './helpers';

export default async (req: NowRequest, res: NowResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { stripeSessionId } = req.body;
    if (!stripeSessionId) {
      return res.status(400).json({ error: 'Stripe Session ID is required.' });
    }

    const stripeSession = await stripe.checkout.sessions.retrieve(stripeSessionId);
    if (stripeSession.payment_status !== 'paid') {
      return res.status(402).json({ error: 'Payment not completed.' });
    }
    
    const foundCode = await db.findCodeByStripeSessionId(stripeSessionId);

    if (!foundCode) {
      return res.status(404).json({ error: 'Purchase record not found yet. Please wait a moment or check your email for the code.' });
    }

    const activatedCode = await db.activateCode(foundCode.code);
     if (!activatedCode) {
        return res.status(500).json({ error: 'Could not activate code.' });
    }
    
    const session = {
      code: activatedCode.code,
      expiresAt: activatedCode.expiresAt,
      emailLimit: activatedCode.emailLimit,
      emailsSent: activatedCode.emailsSent,
      hasDesignStudio: activatedCode.hasDesignStudio,
      designLayout: activatedCode.designLayout,
    };
    
    res.status(200).json(session);

  } catch (error: any) {
    console.error('Purchase verification error:', error);
    res.status(500).json({ error: `Internal Server Error: ${error.message}` });
  }
};