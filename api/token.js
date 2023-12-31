import { kv } from "@vercel/kv";
export default async function handler(req, res) {
  const apiKey = req.headers['x-api-key'];

  // Verify the API key
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).send('Unauthorized');
  }

  // Get tokens from KV
  let tokens = await kv.get("tokens");

  // If refresh token doesn't exist or has expired, direct user to get authorization code and token
  if (!tokens || !tokens.refresh_token || tokens.refresh_token_expires_in <= Date.now()) {
    return res.status(401).json({ error: "Refresh token expired or does not exist. Please get a new authorization code and token." });
  }

  // If access token expired, refresh the token
  if (tokens.expires_in <= Date.now()) {
    try {
      const tokenResponse = await fetch('https://api.digikey.com/v1/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          refresh_token: tokens.refresh_token,
          grant_type: 'refresh_token'
        })
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`Token refresh failed with status ${tokenResponse.status}: ${errorText}`);
      }

      const tokenData = await tokenResponse.json();
      let { access_token, refresh_token, expires_in, refresh_token_expires_in, token_type } = tokenData;

      // Calculate the exact timestamp when the tokens will expire.
      expires_in = Date.now() + expires_in * 1000;
      refresh_token_expires_in = Date.now() + refresh_token_expires_in * 1000;

      // Store the new tokens and expiry times to Vercel KV.
      await kv.set("tokens", {
        access_token, refresh_token, expires_in, refresh_token_expires_in, token_type
      }, { expires: new Date(refresh_token_expires_in) });

      // Update the tokens object with the new tokens and expiry times
      tokens = { access_token, refresh_token, expires_in, refresh_token_expires_in, token_type };

    } catch (error) {
      console.error('Error during token refresh:', error);
      return res.status(500).send('Error during token refresh');
    }
  }

  // Return the tokens
  res.status(200).json(tokens);
}