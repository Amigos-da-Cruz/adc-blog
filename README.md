# Blogue dos Amigos da Cruz

Blogue em Astro, publicado na Vercel, com artigos geridos no Sanity. Usa o pacote React [`@amigos-da-cruz/adc-design-system`](https://github.com/Amigos-da-Cruz/adc-design-system) para componentes, cores e tipografia.

## Desenvolvimento

Requer Node 22+ e Git. O design system é instalado a partir da tag pública `v0.1.1` no GitHub; esta opção evita guardar um token npm na Vercel. Em futuras versões, atualizar a referência no `package.json`.

```bash
npm install
cp .env.example .env
npm run dev
```

Sem `SANITY_PROJECT_ID`, o site mostra o estado de arquivo vazio. Não cria notícias de exemplo.

## Ligar o Sanity

1. O projeto Sanity já existe: `6txkocdk`, dataset `production`. Estes valores estão nos ficheiros `.env.example`; definir `SANITY_PROJECT_ID=6txkocdk` e `SANITY_DATASET=production` nas variáveis de ambiente da Vercel.
2. No dataset, permitir leitura pública dos conteúdos publicados. O frontend usa apenas a API de leitura e não inclui credenciais de escrita.
3. Em `studio/`, copiar `.env.example` para `.env`, executar `npm install` e `npm run dev`. Criar um autor e depois artigos. O ID do projeto já está preenchido no exemplo.
4. Publicar o Studio com `npm run deploy` dentro de `studio/`; acrescentar o URL obtido a `PUBLIC_SANITY_STUDIO_URL` se quiseres guardar essa referência no projeto. Configurar as origens CORS no Sanity para os URLs de edição.

Os artigos publicados aparecem no blogue na visita seguinte, sem rebuild. Notícias exigem pelo menos uma fonte no formulário editorial.

## Vercel

Importar `Amigos-da-Cruz/adc-blog` na Vercel com a diretoria raiz do projeto. A Vercel deteta Astro; manter `npm run build` como comando de build. Definir `SANITY_PROJECT_ID`, `SANITY_DATASET=production` e `PUBLIC_SITE_URL` com o domínio final. A aplicação usa o adaptador `@astrojs/vercel` e renderização no servidor.

Ver [ARCHITECTURE.md](ARCHITECTURE.md) para o desenho técnico e as próximas etapas.
