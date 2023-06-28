import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  const apiKey = req.headers['x-api-key'];

  // Verify the API key
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).send('Unauthorized');
  }

  // Get the tokens from Vercel KV.
  let tokens = await kv.get("tokens");

  // If refresh token doesn't exist or has expired
  if (!tokens || !tokens.refresh_token || tokens.refresh_token_expires_in <= Date.now()) {
    return res.status(404).json({ status: "Refresh token expired or does not exist." });
  }

  // If access token expired
  if (tokens.expires_in <= Date.now()) {
    return res.status(202).json({ status: "Access token expired but refresh token is valid." });
  }

  // If both tokens are valid
  res.status(200).json({ status: "Both tokens are valid." });
}
