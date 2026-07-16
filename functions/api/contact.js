/**
 * Public contact form submission. D1 optional.
 */
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

  if (env.DB) {
    const id = 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
    try {
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
    } catch (e) {}
  }
  return Response.json({ ok: true });
}
