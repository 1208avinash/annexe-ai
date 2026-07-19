/**
 * /api/chat.js — Vercel Serverless Function
 * Proxies requests from the browser to OpenRouter,
 * injecting the API key from the environment variable.
 *
 * Environment variable required (set in Vercel dashboard):
 *   OPENROUTER_API_KEY = sk-or-v1-...
 */

export const config = {
  runtime: 'edge', // Use Edge Runtime for streaming support
};

export default async function handler(req) {
  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Server misconfiguration: API key not set.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Forward the body from the browser unchanged
  const body = await req.text();

  // Forward select safe headers from the original request
  const origin = req.headers.get('origin') || '';
  const referer = req.headers.get('referer') || '';

  const upstreamResp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': referer || origin,
      'X-Title': 'ANNEXE AI Chatbot',
    },
    body,
  });

  // Stream the response back to the browser as-is
  return new Response(upstreamResp.body, {
    status: upstreamResp.status,
    headers: {
      'Content-Type': upstreamResp.headers.get('Content-Type') || 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}
