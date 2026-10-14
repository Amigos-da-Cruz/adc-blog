import { defineArrayMember, defineField, defineType } from 'sanity';

export const article = defineType({
  name: 'article',
  title: 'Artigo',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Título', type: 'string', validation: (rule) => rule.required().max(120) }),
    defineField({ name: 'slug', title: 'Endereço', type: 'slug', options: { source: 'title', maxLength: 96 }, validation: (rule) => rule.required() }),
    defineField({ name: 'kind', title: 'Tipo', type: 'string', options: { layout: 'radio', list: [{ title: 'Notícia', value: 'noticia' }, { title: 'Comentário', value: 'comentario' }] }, validation: (rule) => rule.required() }),
    defineField({ name: 'category', title: 'Categoria', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'excerpt', title: 'Resumo para listagens', type: 'text', rows: 3, validation: (rule) => rule.required().max(240) }),
    defineField({ name: 'introduction', title: 'Entrada do artigo', type: 'text', rows: 3 }),
    defineField({ name: 'author', title: 'Autor', type: 'reference', to: [{ type: 'author' }], validation: (rule) => rule.required() }),
    defineField({ name: 'publishedAt', title: 'Data de publicação', type: 'datetime', validation: (rule) => rule.required() }),
    defineField({
      name: 'body', title: 'Corpo', type: 'array', validation: (rule) => rule.required().min(1),
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{ title: 'Parágrafo', value: 'normal' }, { title: 'Intertítulo', value: 'h2' }, { title: 'Citação', value: 'blockquote' }],
          marks: {
            annotations: [defineArrayMember({
              name: 'link', title: 'Ligação', type: 'object',
              fields: [defineField({ name: 'href', title: 'URL', type: 'url', validation: (rule) => rule.required().uri({ scheme: ['http', 'https'] }) })],
            })],
          },
        }),
        defineArrayMember({
          type: 'image', name: 'articleImage', title: 'Imagem', options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Descrição da imagem', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'caption', title: 'Legenda', type: 'string' }),
            defineField({ name: 'credit', title: 'Crédito', type: 'string' }),
          ],
        }),
        defineArrayMember({
          type: 'object', name: 'instagramPost', title: 'Publicação do Instagram',
          fields: [
            defineField({
              name: 'url', title: 'Ligação da publicação', type: 'url',
              validation: (rule) => rule.required().custom((value) => {
                if (!value) return true;
                try {
                  const url = new URL(value);
                  return url.protocol === 'https:' && ['instagram.com', 'www.instagram.com'].includes(url.hostname)
                    && /^\/(p|reel|tv)\/[A-Za-z0-9_-]+\/?$/.test(url.pathname)
                    ? true : 'Indica uma ligação HTTPS para uma publicação ou reel do Instagram.';
                } catch { return 'Indica uma ligação válida do Instagram.'; }
              }),
            }),
            defineField({ name: 'caption', title: 'Descrição da ligação', type: 'string' }),
          ],
          preview: { select: { title: 'caption', subtitle: 'url' } },
        }),
      ],
    }),
    defineField({
      name: 'sources', title: 'Fontes', type: 'array',
      description: 'Obrigatórias para notícias. Indicar a fonte primária sempre que possível.',
      of: [defineArrayMember({
        type: 'object', name: 'source', title: 'Fonte',
        fields: [
          defineField({ name: 'title', title: 'Título', type: 'string', validation: (rule) => rule.required() }),
          defineField({ name: 'publisher', title: 'Publicador', type: 'string' }),
          defineField({ name: 'date', title: 'Data', type: 'string' }),
          defineField({ name: 'url', title: 'Ligação', type: 'url' }),
        ],
      })],
      validation: (rule) => rule.custom((sources, context) => {
        if (context.document?.kind === 'noticia' && (!sources || sources.length === 0)) return 'Uma notícia precisa de pelo menos uma fonte.';
        return true;
      }),
    }),
  ],
  preview: {
    select: { title: 'title', kind: 'kind', category: 'category' },
    prepare: ({ title, kind, category }) => ({ title, subtitle: `${kind === 'noticia' ? 'Notícia' : 'Comentário'} · ${category ?? ''}` }),
  },
});
