// api/callback.js
import { kv } from "@vercel/kv";

export default async function handler(req, res) {
    const { code, state } = req.query;

    // Save the auth code to Vercel KV
    await kv.set(`auth_token_${state}`, code);

    // Optionally, you can redirect the user to a success page
    res.redirect('/success');
}