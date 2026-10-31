import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const key = process.env.GEMINI_API_KEY;
  res.json({
    status: 'ok',
    hasGeminiKey: !!(key && key.trim().length > 0),
    serverTime: new Date().toISOString(),
  });
}
