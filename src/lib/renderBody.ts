import { createImageUrlBuilder } from '@sanity/image-url';
import { escapeHTML, toHTML } from '@portabletext/to-html';

const projectId = import.meta.env.SANITY_PROJECT_ID;
const dataset = import.meta.env.SANITY_DATASET || 'production';
const imageBuilder = projectId ? createImageUrlBuilder({ projectId, dataset }) : undefined;

type ArticleImage = {
  asset?: { _ref?: string };
  alt?: string;
  caption?: string;
  credit?: string;
};

type InstagramPost = { url?: string; caption?: string };

function renderImage(value: ArticleImage): string {
  if (!imageBuilder || !value.asset?._ref || !value.alt?.trim()) return '';
  const url = imageBuilder.image(value).width(1200).fit('max').auto('format').url();
  const details = [value.caption, value.credit].filter(Boolean).map((part) => escapeHTML(part!)).join(' · ');
  return `<figure class="article-media"><img src="${escapeHTML(url)}" alt="${escapeHTML(value.alt)}" loading="lazy" decoding="async" />${details ? `<figcaption>${details}</figcaption>` : ''}</figure>`;
}

function renderInstagram(value: InstagramPost): string {
  if (!value.url) return '';
  let url: URL;
  try { url = new URL(value.url); } catch { return ''; }
  if (url.protocol !== 'https:' || !['instagram.com', 'www.instagram.com'].includes(url.hostname)
    || !/^\/(p|reel|tv)\/[A-Za-z0-9_-]+\/?$/.test(url.pathname)) return '';
  const permalink = `https://www.instagram.com${url.pathname}`;
  const caption = value.caption?.trim();
  return `<aside class="article-instagram"><span>Instagram</span>${caption ? `<p>${escapeHTML(caption)}</p>` : ''}<a href="${escapeHTML(permalink)}" target="_blank" rel="noopener noreferrer">Ver publicação no Instagram ↗</a></aside>`;
}

export function renderBody(body: Parameters<typeof toHTML>[0]): string {
  return toHTML(body, {
    components: {
      types: {
        articleImage: ({ value }) => renderImage(value as ArticleImage),
        instagramPost: ({ value }) => renderInstagram(value as InstagramPost),
      },
    },
  });
}
