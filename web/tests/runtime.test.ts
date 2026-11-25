import { execFileSync } from 'node:child_process'
import { rolldown } from 'rolldown'
import { describe, expect, it } from 'vitest'

describe('privacy configuration', () => {
  it('loads without Vite environment variables in the Node runtime', async () => {
    const bundle = await rolldown({
      input: 'src/lib/privacy.ts',
      platform: 'node',
    })
    const { output } = await bundle.generate({ format: 'esm' })
    await bundle.close()

    expect(() =>
      execFileSync(
        process.execPath,
        ['--input-type=module', '--eval', output[0].code],
        { stdio: 'pipe' },
      ),
    ).not.toThrow()
  })
})
