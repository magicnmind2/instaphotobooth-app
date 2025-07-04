import { NowRequest, NowResponse } from '@vercel/node';
import { sendPhotoByEmail } from './email';
import { db } from './helpers';

export default async (req: NowRequest, res: NowResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { email, imageDataUrl, code } = req.body;

    if (!email || !imageDataUrl || !code) {
      return res.status(400).json({ error: 'Email, image data, and session code are required.' });
    }

    // --- Abuse Prevention ---
    // 1. Check if the session code is valid and active
    const session = await db.findCode(code);
    if (!session || !session.used || session.expiresAt < Date.now()) {
        return res.status(403).json({ error: 'Invalid or expired session.' });
    }

    // 2. Check if the email limit for this code has been reached
    const canSend = await db.checkAndIncrementEmailCount(code);
    if (!canSend) {
        return res.status(429).json({ error: 'Email limit for this pass has been reached.' });
    }
    
    // --- Send Email ---
    if (!imageDataUrl.startsWith('data:image/jpeg;base64,') && !imageDataUrl.startsWith('data:image/png;base64,')) {
        return res.status(400).json({ error: 'Invalid image data format.' });
    }
    
    await sendPhotoByEmail({ to: email, imageDataUrl });

    res.status(200).json({ message: 'Email sent successfully.' });

  } catch (error: any) {
    console.error('Send photo error:', error);
    res.status(500).json({ error: 'Failed to send photo email.' });
  }
};