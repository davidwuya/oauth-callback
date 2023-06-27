// api/getAuthCode.js
import { kv } from "@vercel/kv";

export default async function handler(req, res) {
    const { state } = req.query;
    const apiKey = req.headers['x-api-key'];
    
    // Check if the API key matches the one in the environment variables
    if (apiKey !== process.env.API_KEY) {
        res.status(403).json({ error: 'Invalid API key' });
        return;
    }

    // Retrieve the auth code from Vercel KV
    const code = await kv.get(`auth_code_${state}`);
    
    if (code) {
        res.status(200).json({ code });
    } else {
        res.status(404).json({ error: 'Auth code not found' });
    }
}
