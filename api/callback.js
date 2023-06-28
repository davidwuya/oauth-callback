export default async function handler(req, res) {
  // Get the authorization code and state from the query parameters.
  const { code, state } = req.query;

  if (state !== process.env.OAUTH_STATE) {
    return res.status(401).send('Unauthorized');
  }

  let redirect_uri = "https://".concat(process.env.VERCEL_URL, "/api/callback");

  // Perform the OAuth2 token exchange.
  try {
    const tokenResponse = await fetch('https://api.digikey.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Token exchange failed with status ${tokenResponse.status}: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    let { access_token, refresh_token, expires_in, refresh_token_expires_in, token_type } = tokenData;

    // Calculate the exact timestamp when the tokens will expire.
    expires_in = Date.now() + expires_in * 1000;
    refresh_token_expires_in = Date.now() + refresh_token_expires_in * 1000;

    // Store the tokens and expiry times to Vercel KV.
    await kv.set("tokens", {
      access_token, refresh_token, expires_in, refresh_token_expires_in, token_type
    }, { expires: new Date(refresh_token_expires_in) });

    res.status(200).send('Tokens stored successfully');
  } catch (error) {
    console.error('Error during token exchange:', error);
    res.status(500).send('Error during token exchange');
  }
}
