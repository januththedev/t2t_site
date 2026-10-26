import knowledge from '../knowledge/generated.json' with { type: 'json' };
import { createChatService } from '../lib/chat-service.mjs';

const chat = createChatService({ knowledge });
const buckets = new Map();
const MAX_BODY = 16000;
const json = (body, status = 200, headers = {}) => Response.json(body, {
  status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers },
});

// Per-instance burst control only. OpenRouter account limits remain the global cap.
function allowed(request) {
  const ip = request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-forwarded-for') || 'local';
  const time = Date.now(); const bucket = buckets.get(ip);
  if (bucket && bucket.reset > time) { bucket.count++; return bucket.count <= 12; }
  for (const [key,value] of buckets) if (value.reset <= time) buckets.delete(key);
  if (buckets.size >= 2000) return false;
  buckets.set(ip, {count:1,reset:time+60000}); return true;
}
async function readBody(request) {
  if (Number(request.headers.get('content-length')) > MAX_BODY) throw new RangeError('body');
  if (!request.body) throw new SyntaxError('body');
  const reader = request.body.getReader(); const chunks = []; let length = 0;
  try {
    while (true) {
      const {done,value} = await reader.read(); if (done) break;
      length += value.byteLength;
      if (length > MAX_BODY) { await reader.cancel(); throw new RangeError('body'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
export async function POST(request) {
  const origin = request.headers.get('origin');
  if ((origin && origin !== new URL(request.url).origin) || request.headers.get('sec-fetch-site') === 'cross-site') return json({error:'Please use the chat on this website.'},403);
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return json({error:'Expected a JSON request.'},415);
  let body;
  try { body = await readBody(request); }
  catch (error) { return json({error:error instanceof RangeError ? 'Message is too large.' : 'Invalid JSON request.'},error instanceof RangeError ? 413 : 400); }
  if (!body || typeof body.message !== 'string' || !body.message.trim() || body.message.length > 1000) return json({error:'Please send a question between 1 and 1,000 characters.'},400);
  if (body.history !== undefined && (!Array.isArray(body.history) || body.history.length > 6 || body.history.some(item => !item || !['user','assistant'].includes(item.role) || typeof item.content !== 'string' || item.content.length > 1000))) return json({error:'Invalid conversation history.'},400);
  if (body.page !== undefined && (typeof body.page !== 'string' || body.page.length > 200 || !body.page.startsWith('/') || body.page.startsWith('//'))) return json({error:'Invalid page context.'},400);
  if (!allowed(request)) return json({error:'A little breather, please. Try again in a minute.'},429,{'Retry-After':'60'});
  try { return json(await chat({message:body.message.trim(),history:body.history || [],page:body.page || '/'})); }
  catch { console.error('T2T chat: request failed'); return json({error:'The guide is temporarily unavailable. Please try again.'},503); }
}
export function GET() { return json({error:'Use POST to send a question.'},405,{Allow:'POST'}); }
