/**
 * Public admission inquiry submission.
 * Honeypot-protected, rate-limited.
 */
import { json, errorResponse, cuid, rateLimit, cleanupRateLimits, audit } from '../lib/auth.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  await cleanupRateLimits(env);
  const limit = await rateLimit(env, `inquiry:${ip}`, 3, 600);
  if (limit.limited) {
    return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': String(limit.retryAfter) }
    });
  }

  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON', 400); }

  // Honeypot — silently accept and discard
  if (body.website) return json({ ok: true });

  // Validate
  const required = ['parentName', 'studentName', 'dob', 'classSeeking', 'phone', 'address'];
  for (const f of required) {
    if (!body[f] || String(body[f]).trim() === '') {
      return errorResponse(`Missing field: ${f}`);
    }
  }
  // Phone: 10 digits starting with 6-9
  if (!/^[6-9]\d{9}$/.test(String(body.phone).trim())) {
    return errorResponse('Phone number must be 10 digits starting with 6, 7, 8, or 9');
  }
  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.email))) {
    return errorResponse('Invalid email address');
  }

  const id = cuid();
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

  await audit(env, null, 'inquiry.create', 'AdmissionInquiry', id, ip, { class: body.classSeeking });

  // Send notification email if Resend is configured
  if (env.RESEND_API_KEY && env.NOTIFY_EMAIL) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'VPS Website <noreply@viratpublicschool.in>',
          to: [env.NOTIFY_EMAIL],
          subject: 'New admission inquiry: ' + body.studentName,
          html: `<h2>New Admission Inquiry</h2>
            <p><strong>Parent:</strong> ${escapeHtml(body.parentName)}<br>
            <strong>Student:</strong> ${escapeHtml(body.studentName)}<br>
            <strong>DOB:</strong> ${escapeHtml(body.dob)}<br>
            <strong>Class:</strong> ${escapeHtml(body.classSeeking)}<br>
            <strong>Phone:</strong> ${escapeHtml(body.phone)}<br>
            <strong>Email:</strong> ${escapeHtml(body.email || '—')}<br>
            <strong>Address:</strong> ${escapeHtml(body.address)}<br>
            <strong>Message:</strong> ${escapeHtml(body.message || '—')}</p>
            <p><a href="https://virat-public-school.pages.dev/admin/inquiries">View in admin →</a></p>`
        })
      });
    } catch (e) { /* don't fail the request if email fails */ }
  }

  return json({ ok: true, id });
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );
}
