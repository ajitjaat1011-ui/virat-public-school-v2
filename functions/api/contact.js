/**
 * Public contact form submission.
 */
import { json, errorResponse, cuid, rateLimit, cleanupRateLimits, audit } from '../lib/auth.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  await cleanupRateLimits(env);
  const limit = await rateLimit(env, `contact:${ip}`, 3, 600);
  if (limit.limited) {
    return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': String(limit.retryAfter) }
    });
  }

  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON', 400); }

  if (body.website) return json({ ok: true });

  for (const f of ['name', 'email', 'subject', 'message']) {
    if (!body[f] || String(body[f]).trim() === '') {
      return errorResponse(`Missing field: ${f}`);
    }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.email).trim())) {
    return errorResponse('Invalid email address');
  }

  const id = cuid();
  await env.DB.prepare(`
    INSERT INTO contact_messages (id, name, email, phone, subject, message)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6)
  `).bind(
    id,
    String(body.name).trim().slice(0, 100),
    String(body.email).trim().slice(0, 200),
    body.phone ? String(body.phone).trim().slice(0, 20) : null,
    String(body.subject).trim().slice(0, 200),
    String(body.message).trim().slice(0, 5000)
  ).run();

  await audit(env, null, 'contact.submit', 'ContactMessage', id, ip, null);
  return json({ ok: true });
}
