import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  const { code, state } = req.query;

  // Store the code and state to Vercel KV with 1-minute expiry.
  await kv.set("authorization_data", { code, state }, { expires: new Date(Date.now() + 60000) });

  // You could extend this to perform the OAuth2 token exchange here,
  // or do it elsewhere depending on your application design.

  res.status(200).send('Authorization data stored successfully');
}
