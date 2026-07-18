/**
 * Public admission inquiry submission — DB-backed.
 * Accepts both camelCase and snake_case form data.
 */
import { cuid, sanitizeHtml } from '../lib/auth.js';
import { db } from '../lib/db.js';

function pick(body, ...keys) {
  for (const k of keys) {
    if (body[k] != null && String(body[k]).trim() !== '') return String(body[k]).trim();
  }
  return '';
}

function normalizePhone(raw) {
  // Strip +91, 91, spaces, dashes, parens
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
}

export async function onRequestPost(context) {
  const { request, env } = context;
  let body;
  try { body = await request.json(); } catch { return new Response('Invalid JSON', { status: 400 }); }

  // Honeypot
  if (body.website) return Response.json({ ok: true });

  const parentName  = pick(body, 'parentName', 'parent_name');
  const studentName = pick(body, 'studentName', 'student_name');
  const classSeeking = pick(body, 'classSeeking', 'class_seeking', 'applying_for', 'applyingFor');
  const phoneRaw    = pick(body, 'parentPhone', 'parent_phone', 'phone');
  const email       = pick(body, 'parentEmail', 'parent_email', 'email');
  const dob         = pick(body, 'dob');
  const address     = pick(body, 'address');
  const message     = pick(body, 'message');

  if (!parentName)   return jsonError('Please tell us the parent\'s name', 400);
  if (!studentName)  return jsonError('Please tell us the child\'s name', 400);
  if (!classSeeking) return jsonError('Please choose a class', 400);
  if (!phoneRaw)     return jsonError('Please share a phone number', 400);

  const phone = normalizePhone(phoneRaw);
  if (!/^[6-9]\d{9}$/.test(phone)) {
    return jsonError('Phone number must be 10 digits, starting with 6, 7, 8 or 9', 400);
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonError('Please enter a valid email address', 400);
  }

  // Idempotency: a double tap, browser retry, or repeated request with the same
  // child/phone/class in a short window returns the first successful inquiry.
  // This is intentionally server-side; disabling a button alone cannot prevent
  // network retries.
  try {
    const duplicate = await db(env).prepare(`SELECT id FROM admission_inquiries
      WHERE parent_phone = ?1 AND lower(student_name) = lower(?2) AND class_seeking = ?3
        AND deleted_at IS NULL AND created_at >= datetime('now', '-10 minutes')
      ORDER BY created_at DESC LIMIT 1`)
      .bind(phone, studentName, classSeeking).first();
    if (duplicate) {
      return Response.json({
        ok: true,
        duplicate: true,
        id: duplicate.id,
        reference: 'VPS-' + String(duplicate.id).slice(-6).toUpperCase()
      });
    }
  } catch (_) { /* continue if a legacy database cannot run the check */ }

  const id = cuid();
  try {
    await db(env).prepare(`INSERT INTO admission_inquiries
        (id, parent_name, student_name, dob, class_seeking, parent_phone, parent_email, address, message, status)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, 'NEW')`).bind(
      id,
      parentName.slice(0, 100),
      studentName.slice(0, 100),
      dob || null,
      classSeeking.slice(0, 40),
      phone,
      email ? email.slice(0, 200) : null,
      address ? address.slice(0, 500) : null,
      message ? sanitizeHtml(message).slice(0, 2000) : null
    ).run();

    await db(env).prepare(`INSERT INTO audit_log (id, user_id, action, entity, entity_id, ip, metadata) VALUES (?1, NULL, 'inquiry.create', 'AdmissionInquiry', ?2, ?3, ?4)`)
      .bind(cuid(), id, request.headers.get('CF-Connecting-IP') || '', JSON.stringify({ class: classSeeking })).run();

    return Response.json({
      ok: true,
      id,
      reference: 'VPS-' + String(id).slice(-6).toUpperCase()
    });
  } catch (e) {
    return jsonError('Could not save: ' + e.message, 500);
  }
}

function jsonError(msg, status) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestGet() {
  return new Response(JSON.stringify({
    info: 'POST application/json to submit an admission inquiry. See the inquiry form on /admissions.html'
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
