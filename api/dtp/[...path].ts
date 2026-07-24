import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const pathParam = req.query.path;
  const pathStr = Array.isArray(pathParam) ? pathParam.join('/') : (pathParam || '');

  const baseUrl = process.env.DTP_API_URL || 'https://api.ontomorph.com';
  const targetUrl = `${baseUrl.replace(/\/$/, '')}/${pathStr}`;
  const apiKey = process.env.DTP_KEY || process.env.VITE_DTP_KEY || '';

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['X-DTP-API-Key'] = apiKey;
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    // Forward any extra headers from request if needed
    if (req.headers['authorization']) {
      headers['Authorization'] = req.headers['authorization'] as string;
    }

    const fetchOptions: RequestInit = {
      method: req.method || 'GET',
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const apiRes = await fetch(targetUrl, fetchOptions);
    const data = await apiRes.json();

    return res.status(apiRes.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'DTP proxy request failed', details: String(error) });
  }
}
