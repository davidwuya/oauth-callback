// api/callback.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { code, state } = req.query;
  const kvUrl = process.env.KV_URL;

  // Save the auth code to Vercel KV
  const response = await fetch(`${kvUrl}/auth_code_${state}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.KV_REST_API_TOKEN}`,
    },
    body: JSON.stringify({ value: code }),
  });

  if (!response.ok) {
    res.status(500).json({ error: 'Failed to save auth code' });
    return;
  }

  // Optionally, you can redirect the user to a success page
  res.redirect('/success');
}
