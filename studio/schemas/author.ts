import { defineField, defineType } from 'sanity';

export const author = defineType({
  name: 'author',
  title: 'Autor',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Nome', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'biography', title: 'Nota biográfica', type: 'text', rows: 3 }),
  ],
});
