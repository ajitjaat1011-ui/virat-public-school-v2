/**
 * Public contact form submission — DB-backed.
 */
import { cuid } from '../lib/auth.js';
import { db } from '../lib/db.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  let body;
  try { body = await request.json(); } catch { return new Response('Invalid JSON', { status: 400 }); }

  if (body.website) return Response.json({ ok: true });

  for (const f of ['name', 'email', 'subject', 'message']) {
    if (!body[f] || String(body[f]).trim() === '') {
      return new Response(JSON.stringify({ error: 'Missing field: ' + f }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
  }

  const id = cuid();
  try {
    await db(env).prepare(`INSERT INTO contact_messages (id, name, email, phone, subject, message) VALUES (?1, ?2, ?3, ?4, ?5, ?6)`).bind(
      id,
      String(body.name).trim().slice(0, 100),
      String(body.email).trim().slice(0, 200),
      body.phone ? String(body.phone).trim().slice(0, 20) : null,
      String(body.subject).trim().slice(0, 200),
      String(body.message).trim().slice(0, 5000)
    ).run();
    await db(env).prepare(`INSERT INTO audit_log (id, user_id, action, entity, entity_id, ip) VALUES (?1, NULL, 'contact.submit', 'ContactMessage', ?2, ?3)`)
      .bind(cuid(), id, request.headers.get('CF-Connecting-IP') || '').run();
  } catch (e) {
    // Log but don't fail the user submission
    console.error('Contact submit DB error:', e.message);
  }
  return Response.json({ ok: true });
}

export async function onRequestGet() {
  return new Response(JSON.stringify({
    info: 'POST application/json to send a contact message. See the form on /contact.html'
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type',
      'Access-Control-Max-Age': '86400'
    }
  });
}
