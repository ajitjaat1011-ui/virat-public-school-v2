/**
 * Gallery API — D1 with embedded static fallback.
 */
import { errorResponse, loadStatic, isD1Available, jsonResponse } from '../lib/data.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 50);

  if (isD1Available(env)) {
    const { results } = await env.DB.prepare(`
      SELECT a.id, a.title, a.slug, a.description, a.event_date, a.cover_url,
             (SELECT COUNT(*) FROM photos p WHERE p.album_id = a.id AND p.is_draft = 0) as photo_count
      FROM gallery_albums a
      WHERE a.deleted_at IS NULL AND a.is_published = 1
      ORDER BY a.event_date DESC
      LIMIT ?1
    `).bind(limit).all();
    return jsonResponse({ albums: results });
  }
  const data = loadStatic(env, 'gallery.json');
  if (!data) return errorResponse('No data', 500);
  return jsonResponse({ albums: (data.albums || []).slice(0, limit) });
}
