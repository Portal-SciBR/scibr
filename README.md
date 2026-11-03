# Portal SciBR

O hub open-source da divulgação científica no Brasil. Conecta a sociedade à ciência brasileira por meio de um diretório aberto e colaborativo de cards de divulgação, com busca e filtros.

Qualquer pessoa envia conteúdo pelo site, sem login. Moderadores aprovam cada card no painel `/admin` antes de ele ficar visível.

## Funcionalidades

- Busca full-text em português (sem distinção de acentos) e filtros por tema, formato e tags.
- Envios podem propor novas áreas do conhecimento, disponíveis nos filtros antes da revisão do card.
- Interface disponível em português e inglês, com preferência de idioma salva no navegador.
- Envio de cards com identificação do enviador (nome, relação, redes e contato).
- E-mail e telefone ficam ocultos e só são revelados por ação do visitante, com limite de consultas por IP.
- Moderação: aprovar, rejeitar, editar, excluir e apagar os dados pessoais do enviador.
- LGPD: consentimento registrado com data e versão, e política em `/privacidade`.
- Layout responsivo para celular.

## Stack

Vite + React + TypeScript + MUI · TanStack Query · i18next · Supabase (Postgres, RLS, Auth, busca full-text).

## Estrutura

- `web/`: aplicação front-end.
- `supabase/migrations/`: schema, políticas RLS e funções.
- `supabase/seed.sql`: dados de exemplo.
- `.github/`: CI, ruleset, templates e CODEOWNERS.

## Desenvolvimento

1. Crie um projeto no Supabase e execute no SQL Editor, em ordem, os arquivos de [supabase/migrations](./supabase/migrations). Opcionalmente, execute `supabase/seed.sql`.
2. `cd web && cp .env.example .env` e preencha:
   - `VITE_SUPABASE_URL`: URL base do projeto, sem `/rest/v1`.
   - `VITE_SUPABASE_ANON_KEY`: chave publishable/anon. Nunca use a secret/service role.
   - `VITE_PRIVACY_EMAIL`: canal de contato LGPD exibido em `/privacidade`.
3. `npm install && npm run dev`

Comandos: `npm run lint`, `npm test`, `npm run build`.

## Moderadores

Crie o usuário em Supabase Auth e registre-o: `insert into public.admins (user_id) values ('<uuid>');`

## Governança

Veja [CONTRIBUTING.md](./CONTRIBUTING.md) e [SECURITY.md](./SECURITY.md). O ruleset do `main` está em [.github/rulesets/main-protection.json](./.github/rulesets/main-protection.json) (Settings → Rules → Rulesets → Import). O check obrigatório é o job `build-test` do CI.

## Deploy

Cloudflare Pages ou Vercel: diretório `web`, build `npm run build`, saída `dist`, variáveis `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` e `VITE_PRIVACY_EMAIL`.

## Pendências conhecidas

- Anti-spam: honeypot e cooldown só no cliente. Para proteção real, adicionar Turnstile e rate limit no servidor.
- O limite de consultas de contato depende do header de IP repassado pelo Supabase, que ainda precisa ser validado.
- Link checker semanal exige os secrets `SUPABASE_URL` e `SUPABASE_ANON_KEY`.
- As migrations ainda não foram validadas em um Postgres real de ponta a ponta.
- O texto de `/privacidade` é um modelo e precisa de revisão jurídica.
