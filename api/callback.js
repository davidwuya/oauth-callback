import { kv } from "@vercel/kv";
import axios from 'axios';

export default async function handler(req, res) {
  const { code, state } = req.query;

  // Store the code and state to Vercel KV with 1-minute expiry.
  await kv.set("authorization_data", { code, state }, { expires: new Date(Date.now() + 60000) });

  // Perform the OAuth2 token exchange.
  const tokenResponse = await axios.post('https://api.digikey.com/v1/oauth2/token', {
    code: code,
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    redirect_uri: 'https://your-vercel-app/api/oauth-callback',
    grant_type: 'authorization_code'
  }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  // Check if the request was successful.
  if (tokenResponse.status === 200) {
    // Get the access token from the response.
    const accessToken = tokenResponse.data.access_token;

    // Store the access token to Vercel KV.
    await kv.set("access_token", accessToken, { expires: new Date(Date.now() + 60000) });

    res.status(200).send('Access token stored successfully');
  } else {
    res.status(500).send('Failed to exchange authorization code for access token');
  }
}
