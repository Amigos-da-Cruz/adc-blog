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

No campo **Corpo**, é possível inserir parágrafos, ligações, imagens e blocos **Publicação do Instagram**. Cada imagem exige uma descrição alternativa; legenda e crédito são opcionais. O bloco do Instagram aceita ligações HTTPS para publicações e reels e mostra uma ligação para abrir a publicação original.

## Comentários dos leitores

Os artigos continuam a ser editados no Sanity. As conversas são geridas pelo [Hyvor Talk](https://talk.hyvor.com/), que permite comentários como convidado, respostas entre leitores e respostas da equipa do blogue. O blogue não guarda os comentários nem precisa de um token de escrita do Sanity. A publicação pode ser imediata; manter a pré moderação desligada na configuração do Hyvor Talk. Os filtros de spam podem continuar ativos.

1. Criar um website no [Hyvor Talk Console](https://talk.hyvor.com/console/) para o domínio do blogue e copiar o **Website ID**.
2. Em **Settings → Embed → Configuration**, deixar a **Pre-Moderation** global desligada. Em **Pages**, verificar que não está ativa para artigos individuais. Ativar comentários de convidados em **Settings → Embed → Configuration**, se essa opção estiver desligada.
3. Configurar o idioma do website como **Portuguese (Portugal)**. O embed também pede `pt` por artigo.
4. Definir `PUBLIC_HYVOR_WEBSITE_ID` no `.env` local e nas variáveis de ambiente da Vercel (Production e, se necessário, Preview). Fazer um novo deploy. O Website ID é público; não é uma chave secreta.
5. Para responder a perguntas, iniciar sessão com a conta proprietária no Console → Comments ou no próprio blogue. Configurar **Moderator Alias** e **Moderator Badge** para identificar as respostas oficiais. O Hyvor envia notificações por email aos leitores que tenham indicado um endereço de email.

Cada conversa usa o ID estável do artigo no Sanity; mudar o slug não separa os comentários anteriores. Sem `PUBLIC_HYVOR_WEBSITE_ID`, o blogue mostra apenas uma mensagem de configuração pendente.

O Hyvor Talk tem um período de avaliação e planos pagos; consultar o [preçário atual](https://talk.hyvor.com/pricing) antes de ativar a subscrição. Rever a política de privacidade do blogue para informar os leitores de que nome, email quando fornecido e conteúdo do comentário são tratados pelo Hyvor Talk.

## Vercel

Importar `Amigos-da-Cruz/adc-blog` na Vercel com a diretoria raiz do projeto. A Vercel deteta Astro; manter `npm run build` como comando de build. Definir `SANITY_PROJECT_ID`, `SANITY_DATASET=production` e `PUBLIC_SITE_URL` com o domínio final. A aplicação usa o adaptador `@astrojs/vercel` e renderização no servidor.

Ver [ARCHITECTURE.md](ARCHITECTURE.md) para o desenho técnico e as próximas etapas.
