import type { APIRoute } from 'astro';
import { createClient } from '@sanity/client';
import { getArticle } from '../../lib/content';

function articleUrl(slug: string, result: string): string {
  return `/artigos/${encodeURIComponent(slug)}?comment=${result}#comentarios`;
}

export const POST: APIRoute = async ({ request, redirect }) => {
  const projectId = import.meta.env.SANITY_PROJECT_ID;
  const dataset = import.meta.env.SANITY_DATASET || 'production';
  const token = import.meta.env.SANITY_WRITE_TOKEN;
  const turnstileSecret = import.meta.env.TURNSTILE_SECRET_KEY;
  const turnstileSiteKey = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY;
  if (!projectId || !token || !turnstileSecret || !turnstileSiteKey) {
    return new Response('Comentários indisponíveis.', { status: 503 });
  }

  const origin = request.headers.get('origin');
  if (origin) {
    try {
      if (new URL(origin).host !== new URL(request.url).host) return new Response('Origem inválida.', { status: 403 });
    } catch { return new Response('Origem inválida.', { status: 403 }); }
  }
  const size = Number(request.headers.get('content-length') || 0);
  if (size > 10_000) return new Response('Pedido demasiado grande.', { status: 413 });

  let form: FormData;
  try { form = await request.formData(); } catch { return new Response('Pedido inválido.', { status: 400 }); }
  const slug = String(form.get('slug') || '');
  if (!/^[a-z0-9-]{1,96}$/.test(slug)) return new Response('Artigo inválido.', { status: 400 });
  if (form.get('website')) return redirect(articleUrl(slug, 'received'), 303);

  const name = String(form.get('name') || '').trim().replace(/\s+/g, ' ');
  const message = String(form.get('message') || '').trim();
  const startedAt = Number(form.get('startedAt'));
  const elapsed = Date.now() - startedAt;
  if (name.length < 2 || name.length > 80 || message.length < 3 || message.length > 2000
    || !Number.isFinite(elapsed) || elapsed < 2500 || elapsed > 86_400_000) {
    return redirect(articleUrl(slug, 'invalid'), 303);
  }

  const article = await getArticle(slug);
  if (!article) return new Response('Artigo não encontrado.', { status: 404 });

  const turnstileToken = String(form.get('cf-turnstile-response') || '');
  if (!turnstileToken || turnstileToken.length > 2048) return redirect(articleUrl(slug, 'challenge'), 303);
  try {
    const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret: turnstileSecret, response: turnstileToken }),
      signal: AbortSignal.timeout(8000),
    });
    const result = await verification.json() as { success?: boolean; hostname?: string };
    if (!result.success || (!import.meta.env.DEV && result.hostname !== new URL(request.url).hostname)) {
      return redirect(articleUrl(slug, 'challenge'), 303);
    }
  } catch {
    return redirect(articleUrl(slug, 'error'), 303);
  }

  try {
    const client = createClient({ projectId, dataset, apiVersion: '2026-01-01', useCdn: false, token });
    await client.create({
      _id: `drafts.comment-${crypto.randomUUID()}`,
      _type: 'comment',
      article: { _type: 'reference', _ref: article.id },
      name,
      message,
      submittedAt: new Date().toISOString(),
    });
    return redirect(articleUrl(slug, 'received'), 303);
  } catch {
    return redirect(articleUrl(slug, 'error'), 303);
  }
};
