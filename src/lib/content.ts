import { createClient } from '@sanity/client';
import type { toHTML } from '@portabletext/to-html';

export type ArticleKind = 'noticia' | 'comentario';

export interface ArticleSummary {
  slug: string;
  title: string;
  kind: ArticleKind;
  category: string;
  excerpt: string;
  publishedAt: string;
  author?: string;
}

export interface ArticleSource {
  title: string;
  publisher?: string;
  date?: string;
  url?: string;
}

export interface Article extends ArticleSummary {
  id: string;
  introduction?: string;
  body?: Parameters<typeof toHTML>[0];
  sources?: ArticleSource[];
}

const projectId = import.meta.env.SANITY_PROJECT_ID;
const dataset = import.meta.env.SANITY_DATASET || 'production';

const client = projectId
  ? createClient({ projectId, dataset, apiVersion: '2026-01-01', useCdn: false, perspective: 'published' })
  : undefined;

const summaryFields = `
  "slug": slug.current,
  title,
  kind,
  category,
  excerpt,
  publishedAt,
  "author": author->name
`;

export async function getArticles(kind?: ArticleKind): Promise<ArticleSummary[]> {
  if (!client) return [];
  return client.fetch(
    `*[_type == "article" && defined(slug.current) && defined(publishedAt) && publishedAt <= now() && ($kind == null || kind == $kind)]
      | order(publishedAt desc) { ${summaryFields} }`,
    { kind: kind ?? null },
  );
}

export async function getArticle(slug: string): Promise<Article | null> {
  if (!client) return null;
  return client.fetch(
    `*[_type == "article" && slug.current == $slug && defined(publishedAt) && publishedAt <= now()][0] {
      "id": _id, ${summaryFields}, introduction, body, sources[]{title, publisher, date, url}
    }`,
    { slug },
  );
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('pt-PT', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Lisbon' }).format(new Date(value));
}
