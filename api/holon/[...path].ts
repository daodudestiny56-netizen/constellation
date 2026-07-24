import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const pathParam = req.query.path;
  const pathStr = Array.isArray(pathParam) ? pathParam.join('/') : (pathParam || '');

  const baseUrl = process.env.HOLON_API_URL || 'https://holon.ontomorph.com';
  const targetUrl = `${baseUrl.replace(/\/$/, '')}/${pathStr}`;
  const apiKey = process.env.HOLON_KEY || process.env.VITE_HOLON_KEY || '';

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['X-DTP-API-Key'] = apiKey;
      headers['x-api-key'] = apiKey;
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

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
    return res.status(500).json({ error: 'HOLON proxy request failed', details: String(error) });
  }
}
