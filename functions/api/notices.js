import { json, errorResponse } from '../lib/auth.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 50);
  const category = url.searchParams.get('category');
  const id = url.searchParams.get('id');

  // Get single notice
  if (id) {
    const row = await env.DB.prepare(
      'SELECT n.*, u.name as author_name FROM notices n LEFT JOIN users u ON u.id = n.author_id WHERE n.id = ?1 AND n.deleted_at IS NULL'
    ).bind(id).first();
    if (!row) return errorResponse('Notice not found', 404);
    return json(row);
  }

  let query = 'SELECT id, title, slug, excerpt, category, publish_date, updated_at, attachment_url, attachment_name FROM notices WHERE deleted_at IS NULL AND is_published = 1';
  const params = [];
  if (category && category !== 'all') {
    query += ' AND category = ?' + (params.length + 1);
    params.push(category);
  }
  query += ' ORDER BY publish_date DESC LIMIT ?' + (params.length + 1);
  params.push(limit);

  const { results } = await env.DB.prepare(query).bind(...params).all();
  return json({ notices: results });
}
