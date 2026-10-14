import type { APIRoute } from 'astro';
import { adminAuthorized, hideComment } from '../../../lib/comments';

export const prerender = false;

export const DELETE: APIRoute = async ({ request, params, url }) => {
  if (request.headers.get('origin') !== url.origin) return new Response(null, { status: 403 });
  if (!adminAuthorized(request.headers.get('X-Comments-Admin-Token'))) return new Response(null, { status: 401 });
  try {
    const hidden = await hideComment(params.id ?? '');
    return new Response(null, { status: hidden ? 204 : 404 });
  } catch {
    return new Response(null, { status: 500 });
  }
};
