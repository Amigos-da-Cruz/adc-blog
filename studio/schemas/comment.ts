import { defineField, defineType } from 'sanity';

export const comment = defineType({
  name: 'comment',
  title: 'Comentário de leitor',
  type: 'document',
  fields: [
    defineField({ name: 'article', title: 'Artigo', type: 'reference', to: [{ type: 'article' }], validation: (rule) => rule.required() }),
    defineField({ name: 'name', title: 'Nome', type: 'string', validation: (rule) => rule.required().max(80) }),
    defineField({ name: 'message', title: 'Comentário', type: 'text', rows: 6, validation: (rule) => rule.required().max(2000) }),
    defineField({ name: 'submittedAt', title: 'Enviado em', type: 'datetime', validation: (rule) => rule.required() }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'message' },
  },
});
