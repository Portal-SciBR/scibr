import { Link as MuiLink, Stack, Typography } from '@mui/material'
import { PRIVACY_EMAIL, PRIVACY_VERSION } from '../lib/privacy'

export function PrivacyPage() {
  return (
    <Stack spacing={2} sx={{ maxWidth: 720, mx: 'auto' }}>
      <Typography variant="h4" component="h1">
        Política de Privacidade
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Versão {PRIVACY_VERSION}
      </Typography>

      <Typography variant="h6" component="h2">
        Quem é o controlador
      </Typography>
      <Typography>
        O Portal SciBR é uma iniciativa open-source mantida por voluntários. Os
        responsáveis pelo tratamento dos dados são os mantenedores do projeto.
      </Typography>

      <Typography variant="h6" component="h2">
        Quais dados coletamos
      </Typography>
      <Typography component="ul" sx={{ pl: 3 }}>
        <li>
          <strong>Obrigatórios:</strong> nome, e-mail e relação com o conteúdo
          enviado.
        </li>
        <li>
          <strong>Opcionais:</strong> telefone/WhatsApp, Instagram, X, YouTube,
          LinkedIn e site/Lattes.
        </li>
        <li>
          Registro do seu consentimento (data e versão desta política) e, de
          forma temporária, um identificador anônimo (hash) do IP de quem
          consulta contatos, apagado em até 24 horas, apenas para limitar abuso.
        </li>
      </Typography>

      <Typography variant="h6" component="h2">
        Para que usamos
      </Typography>
      <Typography>
        Identificar quem enviou a divulgação, permitir que a equipe revise o
        envio e que interessados entrem em contato ou conheçam o trabalho. Base
        legal: seu consentimento (LGPD, art. 7º, I).
      </Typography>

      <Typography variant="h6" component="h2">
        O que fica público
      </Typography>
      <Typography component="ul" sx={{ pl: 3 }}>
        <li>
          Seu nome, relação com o conteúdo e as redes/site informados aparecem
          no card.
        </li>
        <li>
          Seu e-mail e telefone <strong>não</strong> ficam expostos na página:
          só aparecem quando um visitante clica em &quot;Mostrar e-mail e
          telefone&quot;, com limite de consultas por pessoa. Isso reduz, mas
          não elimina, o risco de coleta automatizada.
        </li>
        <li>
          A equipe de moderação tem acesso a todos os dados enviados. Não
          vendemos nem compartilhamos seus dados com terceiros.
        </li>
      </Typography>

      <Typography variant="h6" component="h2">
        Por quanto tempo guardamos
      </Typography>
      <Typography>
        Enquanto o card estiver publicado ou até você pedir a remoção. Envios
        rejeitados podem ser excluídos pela moderação.
      </Typography>

      <Typography variant="h6" component="h2">
        Seus direitos
      </Typography>
      <Typography>
        Você pode, a qualquer momento, pedir confirmação do tratamento, acesso,
        correção, anonimização ou eliminação dos seus dados e revogar o
        consentimento (LGPD, art. 18). Ao revogar, apagamos seus dados pessoais
        do card.
      </Typography>
      <Typography>
        {PRIVACY_EMAIL ? (
          <>
            Para exercer seus direitos, escreva para{' '}
            <MuiLink href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</MuiLink>{' '}
            informando o link do card.
          </>
        ) : (
          'Canal de contato para pedidos de titulares: a ser informado pelos mantenedores.'
        )}
      </Typography>
      <Typography color="text.secondary" variant="body2">
        Não aceitamos envios de menores de 18 anos sem autorização de
        responsável. Nunca publique dados de terceiros sem a autorização deles.
      </Typography>
    </Stack>
  )
}
