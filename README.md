# Blogue dos Amigos da Cruz

Blogue em Astro, publicado na Vercel, com artigos geridos no Sanity. Usa o pacote React [`@amigos-da-cruz/adc-design-system`](https://github.com/Amigos-da-Cruz/adc-design-system) para componentes, cores e tipografia.

## Desenvolvimento

Requer Node 22+ e Git. O design system é instalado a partir da tag pública `v0.2.0` no GitHub; esta opção evita guardar um token npm na Vercel. Em futuras versões, atualizar a referência no `package.json`.

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

Os comentários são publicados de imediato. A interface React [`CommentSection`](https://github.com/Amigos-da-Cruz/adc-design-system) é partilhada pelo design system; a API do blogue guarda as conversas no MongoDB Atlas. O Sanity continua apenas com os artigos editoriais. Leitores escrevem o nome e o comentário, podem responder uns aos outros e não precisam de criar conta. A equipa responde e oculta comentários em `/gerir-comentarios`.

Esta implementação usa endpoints HTTP pequenos: `GET/POST /api/comments` e `DELETE /api/comments/:id`. GraphQL acrescentaria configuração sem simplificar estas operações. Os comentários são texto simples, sem HTML, e a interface React escapa o conteúdo. Um comentário oculto perde o nome e o texto; a posição na conversa fica para preservar as respostas. Não há notificações por email nesta primeira versão.

### Configuração gratuita

1. Criar um projeto e um cluster **Free** no [MongoDB Atlas](https://www.mongodb.com/docs/atlas/tutorial/deploy-free-tier-cluster/). Criar um utilizador da base de dados limitado a `readWrite` na base `adc_blog`. Copiar a URI de ligação com o nome e a palavra-passe do utilizador.
2. Em **Network Access** do Atlas, permitir o acesso a partir da Vercel. A integração Atlas/Vercel documenta a permissão `0.0.0.0/0` para funções com IP dinâmico; proteger a ligação com credenciais fortes e um utilizador limitado à base do blogue. Para desenvolvimento local, permitir também a ligação da máquina.
3. Criar um widget gratuito no [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/get-started/widget-management/dashboard/) para o domínio público do blogue. Copiar a site key e a secret key. Adicionar `localhost` ou usar as [chaves de teste](https://developers.cloudflare.com/turnstile/troubleshooting/testing/) para desenvolvimento.
4. Gerar uma chave editorial aleatória com pelo menos 32 bytes, por exemplo `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`. Guardá-la como `COMMENTS_ADMIN_TOKEN`.
5. Definir as variáveis abaixo no `.env` local e na Vercel, em **Settings → Environment Variables**, e fazer um novo deploy:

| Variável | Valor |
| --- | --- |
| `MONGODB_URI` | URI privada do Atlas |
| `MONGODB_DB` | `adc_blog` |
| `COMMENTS_ADMIN_TOKEN` | Chave editorial privada |
| `PUBLIC_TURNSTILE_SITE_KEY` | Chave pública do widget |
| `TURNSTILE_SECRET_KEY` | Chave privada do widget |

A URI, a chave editorial e a chave secreta do Turnstile nunca devem ter prefixo `PUBLIC_`. Sem as cinco variáveis, o envio de comentários fica desativado. Em `/gerir-comentarios`, inserir a chave editorial para ver os últimos 100 comentários, responder ou ocultar. A chave fica apenas na memória da página e desaparece ao fechá-la. Partilhar esta chave apenas com editores autorizados.

O Atlas Free tem **0,5 GB de armazenamento** e pode pausar um cluster sem ligações após 30 dias de inatividade. O Turnstile Free permite desafios sem limite de volume publicado. Rever as condições atuais destes níveis gratuitos antes de ativar o serviço. O blogue guarda comentários e identificadores de rede resumidos em contadores temporários de dez minutos para limitar abuso; atualizar a política de privacidade antes de abrir os comentários ao público.
## Vercel

Importar `Amigos-da-Cruz/adc-blog` na Vercel com a diretoria raiz do projeto. A Vercel deteta Astro; manter `npm run build` como comando de build. Definir `SANITY_PROJECT_ID`, `SANITY_DATASET=production` e `PUBLIC_SITE_URL` com o domínio final. A aplicação usa o adaptador `@astrojs/vercel` e renderização no servidor.

Ver [ARCHITECTURE.md](ARCHITECTURE.md) para o desenho técnico e as próximas etapas.
