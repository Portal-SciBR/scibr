import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import {
  Button,
  Card as MuiCard,
  CardActions,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material'
import type { Card } from '../lib/types'
import { SubmitterInfo } from './SubmitterInfo'

interface Props {
  card: Card
  onTagClick?: (tag: string) => void
}

export function CardItem({ card, onTagClick }: Props) {
  return (
    <MuiCard
      component="article"
      variant="outlined"
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ mb: 1, flexWrap: 'wrap', rowGap: 1 }}
        >
          <Chip size="small" color="primary" label={card.area} />
          <Chip size="small" variant="outlined" label={card.formato} />
        </Stack>
        <Typography variant="h6" component="h2" gutterBottom>
          {card.titulo}
        </Typography>
        {card.instituicao_autor && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {card.instituicao_autor}
          </Typography>
        )}
        <Typography variant="body2" sx={{ mb: 2 }}>
          {card.descricao}
        </Typography>
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
          {card.tags.map((tag) => (
            <Chip
              key={tag}
              size="small"
              label={`#${tag}`}
              onClick={onTagClick ? () => onTagClick(tag) : undefined}
            />
          ))}
        </Stack>
        <SubmitterInfo enviador={card} cardId={card.id} />
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button
          href={card.link_original}
          target="_blank"
          rel="noopener noreferrer"
          endIcon={<OpenInNewIcon />}
          variant="contained"
          size="small"
          aria-label={`Acessar fonte: ${card.titulo}`}
        >
          Acessar fonte
        </Button>
      </CardActions>
    </MuiCard>
  )
}
