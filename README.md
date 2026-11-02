# scibr
Portal SciBR — O hub open-source da divulgação científica no Brasil. Conectando a sociedade à ciência brasileira através de um diretório aberto e colaborativo

Diretório de cards de divulgação científica com busca e filtros. Qualquer pessoa envia conteúdo pelo site; moderadores aprovam no painel `/admin` antes de ficar visível.

## Stack

Vite + React + TypeScript + MUI · Supabase (Postgres, RLS, Auth, busca full-text em português).

## Desenvolvimento

1. Crie um projeto no Supabase e aplique, em ordem, os arquivos de [supabase/migrations](./supabase/migrations) (e opcionalmente `supabase/seed.sql`).
2. `cd web && cp .env.example .env` e preencha `VITE_SUPABASE_URL` (sem `/rest/v1`), `VITE_SUPABASE_ANON_KEY` (chave anon/publishable; nunca a secret) e `VITE_PRIVACY_EMAIL` (canal LGPD exibido em `/privacidade`).
3. `npm install && npm run dev`

Comandos: `npm run lint`, `npm test`, `npm run build`.

## Moderadores

Crie o usuário em Supabase Auth e registre-o: `insert into public.admins (user_id) values ('<uuid>');`

## Governança

Veja [CONTRIBUTING.md](./CONTRIBUTING.md) e [SECURITY.md](./SECURITY.md). O ruleset do `main` está em [.github/rulesets/main-protection.json](./.github/rulesets/main-protection.json) (Settings → Rules → Rulesets → Import). Ajuste o `required_status_checks` conforme o nome do job de CI (`build-test`).

## Deploy

Cloudflare Pages/Vercel: diretório `web`, build `npm run build`, saída `dist`, variáveis `VITE_SUPABASE_*`.

## Pendências conhecidas

- Anti-spam: honeypot e cooldown no cliente. Para proteção real, adicionar Turnstile + Edge Function/rate limit.
- Link checker semanal exige os secrets `SUPABASE_URL` e `SUPABASE_ANON_KEY`.
- A migration SQL ainda não foi executada contra um Postgres real.
