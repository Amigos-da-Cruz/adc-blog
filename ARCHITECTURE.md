# Arquitetura do blogue ADC

## Objetivo

Reproduzir a identidade editorial dos Amigos da Cruz num blogue de notícias e comentários, com publicação rápida e gestão de conteúdos por editores sem alterar código.

## Fluxo

```text
Editor → Sanity Studio → Sanity Content Lake → Astro (Vercel Function) → leitor
                                       ↘ imagens/CDN (quando necessário)
GitHub adc-design-system → componentes e CSS → build Astro na Vercel
```

## Decisões implementadas

- **Astro 7 + Vercel, `output: server`:** a página inicial, os arquivos e cada artigo consultam os conteúdos publicados no Sanity a cada pedido. Não é necessário webhook para atualizar HTML após uma publicação.
- **Sanity:** Studio independente em `studio/`, com tipos `author` e `article`. O artigo distingue `noticia` de `comentario`; uma notícia precisa de fontes. Rascunhos não são devolvidos ao site público.
- **Design system:** React renderizado pelo Astro sem hidratação no cliente; CSS e fontes do pacote ADC. A dependência aponta para a tag pública Git `v0.1.1`, pois o registo npm do GitHub exige autenticação mesmo para consulta. Quando houver token seguro de leitura na Vercel, pode passar para a versão semântica do GitHub Packages.
- **Páginas:** `/`, `/noticias`, `/comentarios`, `/artigos/[slug]`. Conteúdo em português de Portugal, sem imagens decorativas de notícias. Fontes aparecem no fim das notícias.
- **Segurança:** frontend usa leitura pública do dataset; escrita apenas no Studio com contas Sanity. Variáveis `.env` ficam fora do Git. A data de publicação filtra conteúdos futuros.

## Publicação e operação

1. Criar o projeto Sanity e publicar o Studio; dar acesso aos editores.
2. Definir `SANITY_PROJECT_ID` e `SANITY_DATASET` na Vercel e importar este repositório. Definir `PUBLIC_SITE_URL` depois de atribuir o domínio.
3. Criar um autor, um artigo de teste com fontes e validar o percurso Studio → página pública → arquivo.
4. Configurar o domínio final, redirecionamentos necessários e monitorização de erros na Vercel.

## Evolução prevista

- Paginação no servidor quando o arquivo crescer; a consulta atual devolve todos os artigos de cada tipo.
- Pré-visualização autenticada de rascunhos e revisão editorial antes da publicação.
- RSS e sitemap quando o domínio definitivo estiver escolhido.
- Metadados sociais e imagens documentais com texto alternativo; manter a regra editorial de não usar imagens decorativas em notícias.
- Teste de instalação do pacote pelo GitHub Packages numa pipeline com token de leitura, caso se abandone a dependência Git.

## Limites atuais

Não existe ainda projeto Sanity nem projeto Vercel ligado a este repositório. Sem `SANITY_PROJECT_ID`, o site compila e mostra arquivos vazios. A publicação e as permissões dos editores dependem da criação das contas e dos projetos nesses serviços.
