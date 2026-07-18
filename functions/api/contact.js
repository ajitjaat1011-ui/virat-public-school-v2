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

  const name = String(body.name).trim().slice(0, 100);
  const email = String(body.email).trim().toLowerCase().slice(0, 200);
  const subject = String(body.subject).trim().slice(0, 200);
  const message = String(body.message).trim().slice(0, 5000);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Please enter a valid email address' }, { status: 400 });
  }

  // Server-side duplicate protection for double taps and browser retries.
  try {
    const duplicate = await db(env).prepare(`SELECT id FROM contact_messages
      WHERE lower(email) = lower(?1) AND subject = ?2 AND message = ?3
        AND deleted_at IS NULL AND created_at >= datetime('now', '-10 minutes')
      ORDER BY created_at DESC LIMIT 1`)
      .bind(email, subject, message).first();
    if (duplicate) {
      return Response.json({ ok: true, duplicate: true, reference: 'MSG-' + String(duplicate.id).slice(-6).toUpperCase() });
    }
  } catch (_) { /* continue for legacy databases */ }

  const id = cuid();
  try {
    await db(env).prepare(`INSERT INTO contact_messages (id, name, email, phone, subject, message) VALUES (?1, ?2, ?3, ?4, ?5, ?6)`).bind(
      id,
      name,
      email,
      body.phone ? String(body.phone).trim().slice(0, 20) : null,
      subject,
      message
    ).run();
    await db(env).prepare(`INSERT INTO audit_log (id, user_id, action, entity, entity_id, ip) VALUES (?1, NULL, 'contact.submit', 'ContactMessage', ?2, ?3)`)
      .bind(cuid(), id, request.headers.get('CF-Connecting-IP') || '').run();
  } catch (e) {
    console.error('Contact submit DB error:', e.message);
    return Response.json({ error: 'We could not save your message. Please try again.' }, { status: 500 });
  }
  return Response.json({ ok: true, reference: 'MSG-' + String(id).slice(-6).toUpperCase() });
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
