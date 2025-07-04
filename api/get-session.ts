import { NowRequest, NowResponse } from '@vercel/node';
import { db } from './helpers';

export default async (req: NowRequest, res: NowResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'A valid code is required.' });
    }

    const foundCode = await db.findCode(code);

    if (!foundCode) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    if (foundCode.expiresAt < Date.now()) {
      return res.status(403).json({ error: 'Session has expired.' });
    }

    // Return the session object to the client
    const session = {
      code: foundCode.code,
      expiresAt: foundCode.expiresAt,
    };

    res.status(200).json(session);

  } catch (error: any) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};