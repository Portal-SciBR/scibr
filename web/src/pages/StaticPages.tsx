import { Link as MuiLink, Stack, Typography } from '@mui/material'

export function AboutPage() {
  return (
    <Stack spacing={2} sx={{ maxWidth: 720, mx: 'auto' }}>
      <Typography variant="h4" component="h1">
        Sobre o Portal SciBR
      </Typography>
      <Typography>
        O Portal SciBR é uma iniciativa open-source dedicada a mapear, catalogar
        e centralizar projetos, conteúdos e iniciativas de divulgação científica
        em todo o Brasil.
      </Typography>
      <Typography>
        Atuamos como diretório aberto: não hospedamos o conteúdo original,
        apenas facilitamos sua descoberta por meio de busca e filtros por área
        do conhecimento, formato e tema, direcionando o público para os
        criadores e pesquisadores.
      </Typography>
      <Typography variant="h6" component="h2">
        Encontrou algo errado?
      </Typography>
      <Typography>
        Para reportar um link quebrado, impróprio ou desinformação, abra uma{' '}
        <MuiLink
          href="https://github.com/Portal-SciBR/scibr/issues/new?template=reportar-conteudo.yml"
          target="_blank"
          rel="noopener noreferrer"
        >
          Issue de conteúdo
        </MuiLink>
        .
      </Typography>
    </Stack>
  )
}

export function GuidelinesPage() {
  return (
    <Stack spacing={2} sx={{ maxWidth: 720, mx: 'auto' }}>
      <Typography variant="h4" component="h1">
        Diretrizes de curadoria
      </Typography>
      <Typography>Para ser publicada, uma divulgação precisa:</Typography>
      <Typography component="ul" sx={{ pl: 3 }}>
        <li>apontar para uma fonte pública e verificável;</li>
        <li>
          ter relação com ciência e divulgação científica produzida ou voltada
          ao Brasil;
        </li>
        <li>
          basear-se em evidências, sem promover desinformação ou pseudociência;
        </li>
        <li>
          não ter caráter de spam, publicidade enganosa ou conteúdo impróprio.
        </li>
      </Typography>
      <Typography color="text.secondary">
        Todo envio passa por revisão da equipe antes de ficar visível no portal.
      </Typography>
    </Stack>
  )
}
