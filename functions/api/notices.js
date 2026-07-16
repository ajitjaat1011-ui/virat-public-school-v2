/**
 * Notices API — reads from D1 if available, falls back to /data/notices.json
 */
import { errorResponse } from '../lib/data.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 50);
  const category = url.searchParams.get('category');
  const id = url.searchParams.get('id');

  // Get single notice
  if (id) {
    if (env.DB) {
      const row = await env.DB.prepare(
        'SELECT n.*, u.name as author_name FROM notices n LEFT JOIN users u ON u.id = n.author_id WHERE n.id = ?1 AND n.deleted_at IS NULL'
      ).bind(id).first();
      if (row) return Response.json(row);
    }
    // Fallback to static data
    const data = await loadStaticNotices(env);
    const n = data.find((x) => x.id === id || x.slug === id);
    if (!n) return errorResponse('Notice not found', 404);
    return Response.json(n);
  }

  // List
  if (env.DB) {
    let query = 'SELECT id, title, slug, excerpt, category, publish_date, updated_at, attachment_url, attachment_name FROM notices WHERE deleted_at IS NULL AND is_published = 1';
    const params = [];
    if (category && category !== 'all') {
      query += ' AND category = ?' + (params.length + 1);
      params.push(category);
    }
    query += ' ORDER BY publish_date DESC LIMIT ?' + (params.length + 1);
    params.push(limit);
    const { results } = await env.DB.prepare(query).bind(...params).all();
    return Response.json({ notices: results });
  }
  // Fallback
  let list = await loadStaticNotices(env);
  if (category && category !== 'all') list = list.filter((n) => n.category === category);
  return Response.json({ notices: list.slice(0, limit) });
}

async function loadStaticNotices(env) {
  try {
    const origin = env.ORIGIN_URL || 'https://virat-public-school-v2.pages.dev';
    const r = await fetch(origin + '/data/notices.json');
    if (!r.ok) return [];
    const data = await r.json();
    return data.notices || [];
  } catch (e) {
    return [];
  }
}
