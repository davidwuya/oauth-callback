import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  const apiKey = req.headers['x-api-key'];

  // Verify the API key
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).send('Unauthorized');
  }

  // Get the authorization data from Vercel KV.
  const authData = await kv.get("authorization_data");

  // Delete the data immediately after retrieval.
  await kv.del("authorization_data");

  res.status(200).json(authData);
}
