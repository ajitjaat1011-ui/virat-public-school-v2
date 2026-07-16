/**
 * Gallery album detail — D1 with embedded static fallback.
 */
import { errorResponse, loadStatic, isD1Available, jsonResponse } from '../../lib/data.js';

export async function onRequestGet(context) {
  const { env, params } = context;
  const slug = params.slug;

  if (isD1Available(env)) {
    const album = await env.DB.prepare(
      'SELECT * FROM gallery_albums WHERE (id = ?1 OR slug = ?1) AND deleted_at IS NULL AND is_published = 1'
    ).bind(slug).first();
    if (!album) return errorResponse('Album not found', 404);
    const { results: photos } = await env.DB.prepare(
      'SELECT id, url, thumbnail_url, caption, sort_order FROM photos WHERE album_id = ?1 AND is_draft = 0 ORDER BY sort_order ASC, created_at ASC'
    ).bind(album.id).all();
    return jsonResponse({ ...album, photos });
  }
  const data = loadStatic(env, 'gallery.json');
  const a = (data?.albums || []).find((x) => x.slug === slug || x.id === slug);
  if (!a) return errorResponse('Album not found', 404);
  return jsonResponse(a);
}
