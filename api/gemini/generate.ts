import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || typeof key !== 'string' || !key.trim()) return null;
  return new GoogleGenAI({
    apiKey: key.trim(),
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, systemInstruction, model = 'gemini-3.8-flash' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt in request body' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        text: `Under the active federated learning setup on METR-LA, FedAvg aggregates localized model updates across 4 RSU nodes to forecast highway traffic speeds while preserving edge privacy.`,
        isSimulated: true,
      });
    }

    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: systemInstruction ? { systemInstruction } : undefined,
      });
      return res.json({ text: response.text || '', isSimulated: false });
    } catch (genErr: any) {
      console.log('[Gemini API] Generate fallback active');
      return res.json({
        text: `Under the active federated learning setup on METR-LA, FedAvg aggregates localized model updates across 4 RSU nodes to forecast highway traffic speeds while preserving edge privacy.`,
        isSimulated: true,
      });
    }
  } catch (error: any) {
    console.error('Error in /api/gemini/generate:', error);
    res.json({
      text: 'Under the active federated learning configuration on METR-LA, FedAvg coordinates distributed edge training across RSU stations.',
      isSimulated: true,
    });
  }
}
