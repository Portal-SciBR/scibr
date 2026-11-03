import { describe, expect, it } from 'vitest'
import { parseFilters, serializeFilters } from './filters'
import { parseTags, submissionSchema } from './schemas'

describe('filters', () => {
  it('round-trips through the URL', () => {
    const f = parseFilters(
      new URLSearchParams(
        'q=astro&area=Exatas+%26+Terra&tag=a&tag=b&sort=recent&page=3',
      ),
    )
    expect(f).toMatchObject({
      q: 'astro',
      area: 'Exatas & Terra',
      tags: ['a', 'b'],
      sort: 'recent',
      page: 3,
    })
    expect(parseFilters(serializeFilters(f))).toEqual(f)
  })

  it('preserves custom areas in the URL', () => {
    const f = parseFilters(new URLSearchParams('area=Oceanografia'))
    expect(f.area).toBe('Oceanografia')
    expect(parseFilters(serializeFilters(f)).area).toBe('Oceanografia')
  })

  it('ignores invalid values', () => {
    const f = parseFilters(
      new URLSearchParams(`area=${'x'.repeat(81)}&formato=y&page=-2&sort=zzz`),
    )
    expect(f).toMatchObject({
      area: '',
      formato: '',
      page: 1,
      sort: 'relevance',
    })
  })
})

describe('submission', () => {
  const valid = {
    titulo: 'Astronomia',
    descricao: 'Um portal sobre astrofísica.',
    area: 'Exatas & Terra',
    formato: 'Portal',
    instituicao_autor: '',
    tags: [],
    link_original: 'https://example.org',
    idioma: 'pt-BR',
  }

  it('accepts valid data', () => {
    expect(submissionSchema.safeParse(valid).success).toBe(true)
  })

  it('accepts a custom area and rejects values longer than 80 characters', () => {
    expect(
      submissionSchema.safeParse({ ...valid, area: 'Oceanografia' }).success,
    ).toBe(true)
    expect(
      submissionSchema.safeParse({ ...valid, area: 'x'.repeat(81) }).success,
    ).toBe(false)
  })

  it('rejects non-http links', () => {
    expect(
      submissionSchema.safeParse({
        ...valid,
        link_original: 'javascript:alert(1)',
      }).success,
    ).toBe(false)
  })

  it('normalizes and dedupes tags', () => {
    expect(parseTags(' Física, física ,, Espaço')).toEqual(['física', 'espaço'])
  })
})
