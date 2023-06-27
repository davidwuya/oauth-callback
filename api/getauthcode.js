// api/getAuthCode.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { state } = req.query;
  const apiKey = req.headers['x-api-key'];
  const kvUrl = process.env.KV_URL;

  // Check if the API key matches the one in the environment variables
  if (apiKey !== process.env.API_KEY) {
    res.status(403).json({ error: 'Invalid API key' });
    return;
  }

  // Retrieve the auth code from Vercel KV
  const response = await fetch(`${kvUrl}/auth_code_${state}`, {
    headers: {
      'Authorization': `Bearer ${process.env.KV_REST_API_READ_ONLY_TOKEN}`,
    },
  });

  if (!response.ok) {
    res.status(404).json({ error: 'Auth code not found' });
    return;
  }

  const data = await response.json();
  res.status(200).json({ code: data.value });
}
