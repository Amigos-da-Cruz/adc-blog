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
      of: [defineArrayMember({ type: 'block', styles: [{ title: 'Parágrafo', value: 'normal' }, { title: 'Intertítulo', value: 'h2' }, { title: 'Citação', value: 'blockquote' }] })],
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
