# Portal SciBR

O Portal SciBR é um diretório colaborativo de conteúdos e recomendações sobre ciência. Você pode indicar artigos, leituras, vídeos, podcasts, canais, portais e outros recursos que considere úteis — não precisa ser uma publicação científica nem um conteúdo seu.

As sugestões passam por curadoria antes de aparecerem no portal.

Este repositório contém a aplicação web do Portal SciBR. Para contribuir, consulte [CONTRIBUTING.md](./CONTRIBUTING.md). Para reportar uma vulnerabilidade, consulte [SECURITY.md](./SECURITY.md).

## Notificações de revisão

Novos envios são inseridos no Supabase e geram uma notificação por Gmail SMTP pela função server-side da Vercel. Configure `GMAIL_USER` e `GMAIL_APP_PASSWORD` como variáveis de ambiente da Vercel e mantenha `VITE_PRIVACY_EMAIL` definido como o endereço da equipe. Use uma senha de app do Google, não a senha normal da conta. A função usa SMTP seguro na porta 465.

Se o e-mail falhar, o envio continua salvo para revisão e a página informa que a equipe não foi notificada.
