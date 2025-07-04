import { NowRequest, NowResponse } from '@vercel/node';
import { db } from './helpers';

export default async (req: NowRequest, res: NowResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { code } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'A valid code is required.' });
    }

    const foundCode = await db.findCode(code);

    if (!foundCode) {
      return res.status(404).json({ error: 'Code not found.' });
    }

    if (foundCode.used && foundCode.expiresAt < Date.now()) {
      return res.status(403).json({ error: 'This code has expired.' });
    }
    
    const activatedCode = await db.activateCode(code);

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
    console.error('Activation error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};