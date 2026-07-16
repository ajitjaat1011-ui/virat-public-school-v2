/**
 * Stats API — counts of various content. D1 with /data fallback.
 */
import { loadStatic, isD1Available } from '../lib/data.js';

export async function onRequestGet(context) {
  const { env } = context;
  const out = { notices: 0, albums: 0, faculty: 0, results: 0, inquiries: 0 };
  if (isD1Available(env)) {
    try {
      out.notices   = (await env.DB.prepare('SELECT COUNT(*) as c FROM notices WHERE deleted_at IS NULL AND is_published = 1').first())?.c || 0;
      out.albums    = (await env.DB.prepare('SELECT COUNT(*) as c FROM gallery_albums WHERE deleted_at IS NULL AND is_published = 1').first())?.c || 0;
      out.faculty   = (await env.DB.prepare('SELECT COUNT(*) as c FROM faculty WHERE is_active = 1').first())?.c || 0;
      out.results   = (await env.DB.prepare('SELECT COUNT(*) as c FROM result_sets WHERE deleted_at IS NULL AND is_published = 1').first())?.c || 0;
      out.inquiries = (await env.DB.prepare("SELECT COUNT(*) as c FROM admission_inquiries WHERE status = 'NEW' AND deleted_at IS NULL").first())?.c || 0;
    } catch (e) {}
    return Response.json(out);
  }
  const [n, g, f, r] = await Promise.all([
    loadStatic(env, 'notices.json'),
    loadStatic(env, 'gallery.json'),
    loadStatic(env, 'faculty.json'),
    loadStatic(env, 'results.json')
  ]);
  out.notices = n?.notices?.length || 0;
  out.albums  = g?.albums?.length || 0;
  out.faculty = f?.faculty?.length || 0;
  out.results = r?.resultSets?.filter((s) => s.is_published !== false).length || 0;
  return Response.json(out);
}
