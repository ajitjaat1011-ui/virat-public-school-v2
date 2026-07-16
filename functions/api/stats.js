import { json } from '../lib/auth.js';

export async function onRequestGet(context) {
  const { env } = context;
  try {
    const notices = await env.DB.prepare('SELECT COUNT(*) as c FROM notices WHERE deleted_at IS NULL AND is_published = 1').first();
    const albums  = await env.DB.prepare('SELECT COUNT(*) as c FROM gallery_albums WHERE deleted_at IS NULL AND is_published = 1').first();
    const faculty = await env.DB.prepare('SELECT COUNT(*) as c FROM faculty WHERE is_active = 1').first();
    const results = await env.DB.prepare('SELECT COUNT(*) as c FROM result_sets WHERE deleted_at IS NULL AND is_published = 1').first();
    const inquiries = await env.DB.prepare("SELECT COUNT(*) as c FROM admission_inquiries WHERE status = 'NEW' AND deleted_at IS NULL").first();
    return json({
      notices: notices?.c || 0,
      albums:  albums?.c || 0,
      faculty: faculty?.c || 0,
      results: results?.c || 0,
      inquiries: inquiries?.c || 0
    });
  } catch (e) {
    return json({ notices: 0, albums: 0, faculty: 0, results: 0, inquiries: 0 });
  }
}
