import { NowRequest, NowResponse } from '@vercel/node';
import { db } from './helpers';
import { DesignLayout } from '../types';

export default async (req: NowRequest, res: NowResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { code, designLayout } = req.body as { code: string; designLayout: DesignLayout };

    if (!code || !designLayout) {
      return res.status(400).json({ error: 'Session code and design layout are required.' });
    }

    const session = await db.findCode(code);
    if (!session || !session.used || session.expiresAt < Date.now()) {
        return res.status(403).json({ error: 'Invalid or expired session.' });
    }

    if (!session.hasDesignStudio) {
        return res.status(403).json({ error: 'This pass does not include the Design Studio feature.' });
    }
    
    const success = await db.saveDesign(code, designLayout);

    if (success) {
      res.status(200).json({ message: 'Design saved successfully.' });
    } else {
      res.status(404).json({ error: 'Session not found.' });
    }

  } catch (error: any) {
    console.error('Save design error:', error);
    res.status(500).json({ error: 'Failed to save design.' });
  }
};