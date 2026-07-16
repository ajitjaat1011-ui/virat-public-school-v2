/**
 * Public admission inquiry submission.
 * With D1: stored in DB. Without D1: writes to a static queue file
 * (which Pages can't persist), so falls back to a 200 OK + localStorage
 * queue (handled by the client).
 */
import { cuid } from '../lib/auth.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  let body;
  try { body = await request.json(); } catch { return new Response('Invalid JSON', { status: 400 }); }

  // Honeypot — silently accept
  if (body.website) return Response.json({ ok: true });

  // Basic validation
  const required = ['parentName', 'studentName', 'dob', 'classSeeking', 'phone', 'address'];
  for (const f of required) {
    if (!body[f] || String(body[f]).trim() === '') {
      return new Response(JSON.stringify({ error: `Missing field: ${f}` }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
  }
  if (!/^[6-9]\d{9}$/.test(String(body.phone).trim())) {
    return new Response(JSON.stringify({ error: 'Phone number must be 10 digits starting with 6, 7, 8, or 9' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  if (env.DB) {
    const id = cuid();
    try {
      await env.DB.prepare(`
        INSERT INTO admission_inquiries
          (id, parent_name, student_name, dob, class_seeking, parent_phone, parent_email, address, message, status)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, 'NEW')
      `).bind(
        id,
        String(body.parentName).trim().slice(0, 100),
        String(body.studentName).trim().slice(0, 100),
        String(body.dob).trim(),
        String(body.classSeeking).trim().slice(0, 40),
        String(body.phone).trim(),
        body.email ? String(body.email).trim().slice(0, 200) : null,
        String(body.address).trim().slice(0, 500),
        body.message ? String(body.message).trim().slice(0, 2000) : null
      ).run();
      // Notify via Resend if configured
      if (env.RESEND_API_KEY && env.NOTIFY_EMAIL) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + env.RESEND_API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: 'VPS Website <noreply@viratpublicschool.in>',
              to: [env.NOTIFY_EMAIL],
              subject: 'New admission inquiry: ' + body.studentName,
              html: '<h2>New Admission Inquiry</h2><p><strong>Parent:</strong> ' + body.parentName + '<br><strong>Student:</strong> ' + body.studentName + '<br><strong>Phone:</strong> ' + body.phone + '<br><strong>Class:</strong> ' + body.classSeeking + '</p>'
            })
          });
        } catch (e) {}
      }
      return Response.json({ ok: true, id });
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Database error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }

  // No DB — accept and let client queue in localStorage
  return Response.json({ ok: true, queued: true });
}
