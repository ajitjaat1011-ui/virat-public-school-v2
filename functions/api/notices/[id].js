/**
 * Single notice (by id or slug) — D1 with static fallback.
 */
import { errorResponse, loadStatic, isD1Available, jsonResponse } from '../../lib/data.js';

export async function onRequestGet(context) {
  const { env, params } = context;
  const id = params.id;

  if (isD1Available(env)) {
    const row = await env.DB.prepare(
      'SELECT n.*, u.name as author_name FROM notices n LEFT JOIN users u ON u.id = n.author_id WHERE (n.id = ?1 OR n.slug = ?1) AND n.deleted_at IS NULL AND n.is_published = 1'
    ).bind(id).first();
    if (row) return jsonResponse(row);
  }
  const all = loadStatic(env, 'notices.json')?.notices || [];
  const n = all.find((x) => x.id === id || x.slug === id);
  if (!n) return errorResponse('Notice not found', 404);
  return jsonResponse(n);
}
