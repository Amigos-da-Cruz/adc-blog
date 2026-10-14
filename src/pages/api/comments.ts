import type { APIRoute } from 'astro';
import { adminAuthorized, commentsConfigured, createComment, listArticleComments, listRecentComments, tooManyComments, visitorHash } from '../../lib/comments';
import { getArticle } from '../../lib/content';

export const prerender = false;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
}

export const GET: APIRoute = async ({ request, url }) => {
  if (!commentsConfigured()) return json({ error: 'Comentários ainda não configurados' }, 503);
  try {
    if (url.searchParams.get('admin') === '1') {
      if (!adminAuthorized(request.headers.get('X-Comments-Admin-Token'))) return json({ error: 'Acesso negado' }, 401);
      return json({ comments: await listRecentComments() });
    }
    const slug = url.searchParams.get('slug') ?? '';
    const article = slug ? await getArticle(slug) : null;
    if (!article) return json({ error: 'Artigo não encontrado' }, 404);
    return json({ comments: await listArticleComments(article.id) });
  } catch {
    return json({ error: 'Não foi possível carregar os comentários' }, 500);
  }
};

export const POST: APIRoute = async ({ request, url }) => {
  if (!commentsConfigured()) return json({ error: 'Comentários ainda não configurados' }, 503);
  if (request.headers.get('origin') !== url.origin) return json({ error: 'Origem inválida' }, 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'Formato inválido' }, 415);
  let data: Record<string, unknown>;
  try {
    data = await request.json();
  } catch {
    return json({ error: 'Pedido inválido' }, 400);
  }
  const slug = typeof data.slug === 'string' ? data.slug : '';
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const message = typeof data.message === 'string' ? data.message.trim() : '';
  const parentId = typeof data.parentId === 'string' ? data.parentId : null;
  if (data.website || name.length < 2 || name.length > 80 || message.length < 3 || message.length > 2000) return json({ error: 'Confirma o nome e o comentário' }, 400);
  const editor = adminAuthorized(request.headers.get('X-Comments-Admin-Token'));
  if (!editor) {
    const token = typeof data.turnstileToken === 'string' ? data.turnstileToken : '';
    if (!token) return json({ error: 'Valida a proteção anti spam' }, 400);
    const validation = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret: import.meta.env.TURNSTILE_SECRET_KEY!, response: token }),
    }).then((response) => response.json()).catch(() => null) as { success?: boolean } | null;
    if (!validation?.success) return json({ error: 'Validação anti spam falhou' }, 400);
  }
  try {
    const article = await getArticle(slug);
    if (!article) return json({ error: 'Artigo não encontrado' }, 404);
    const address = request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const ipHash = editor ? undefined : visitorHash(address);
    if (ipHash && await tooManyComments(ipHash)) return json({ error: 'Aguarda alguns minutos antes de voltar a comentar' }, 429);
    const comment = await createComment({
      articleId: article.id,
      articleSlug: article.slug,
      articleTitle: article.title,
      parentId,
      name: editor ? 'Amigos da Cruz' : name,
      message,
      authorRole: editor ? 'editor' : 'reader',
    });
    return json({ comment }, 201);
  } catch (error) {
    if (error instanceof Error && (error.message === 'Resposta inválida' || error.message === 'Comentário original indisponível')) return json({ error: error.message }, 400);
    return json({ error: 'Não foi possível publicar o comentário' }, 500);
  }
};
