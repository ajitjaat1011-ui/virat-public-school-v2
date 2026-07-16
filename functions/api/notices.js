/**
 * Notices API — D1 if available, else static fallback.
 */
import { errorResponse, loadStatic, isD1Available, jsonResponse } from '../lib/data.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 50);
  const category = url.searchParams.get('category');
  const id = url.searchParams.get('id');

  // Single notice
  if (id) {
    if (isD1Available(env)) {
      const row = await env.DB.prepare(
        'SELECT n.*, u.name as author_name FROM notices n LEFT JOIN users u ON u.id = n.author_id WHERE n.id = ?1 AND n.deleted_at IS NULL'
      ).bind(id).first();
      if (row) return jsonResponse(row);
    }
    const data = loadStatic(env, 'notices.json');
    const all = data?.notices || [];
    const n = all.find((x) => x.id === id || x.slug === id);
    if (!n) return errorResponse('Notice not found', 404);
    return jsonResponse(n);
  }

  // List
  if (isD1Available(env)) {
    let query = 'SELECT id, title, slug, excerpt, category, publish_date, updated_at, attachment_url, attachment_name FROM notices WHERE deleted_at IS NULL AND is_published = 1';
    const params = [];
    if (category && category !== 'all') {
      query += ' AND category = ?' + (params.length + 1);
      params.push(category);
    }
    query += ' ORDER BY publish_date DESC LIMIT ?' + (params.length + 1);
    params.push(limit);
    const { results } = await env.DB.prepare(query).bind(...params).all();
    return jsonResponse({ notices: results });
  }

  let list = loadStatic(env, 'notices.json')?.notices || [];
  if (category && category !== 'all') list = list.filter((n) => n.category === category);
  return jsonResponse({ notices: list.slice(0, limit) });
}
