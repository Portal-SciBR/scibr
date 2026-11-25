import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
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

describe('submission function', () => {
  it('starts under Node after TypeScript emits JavaScript modules', () => {
    const tempDir = join(process.cwd(), 'node_modules', '.tmp')
    mkdirSync(tempDir, { recursive: true })
    const output = mkdtempSync(join(tempDir, 'api-test-'))
    try {
      execFileSync(
        process.execPath,
        [
          'node_modules/typescript/bin/tsc',
          '--ignoreConfig',
          '--noCheck',
          '--target',
          'es2023',
          '--module',
          'nodenext',
          '--moduleResolution',
          'nodenext',
          '--rootDir',
          '.',
          '--outDir',
          output,
          'api/submit.ts',
        ],
        { stdio: 'pipe' },
      )

      const entry = pathToFileURL(join(output, 'api', 'submit.js')).href
      execFileSync(
        process.execPath,
        [
          '--input-type=module',
          '--eval',
          `const handler = (await import(${JSON.stringify(entry)})).default;
           const response = await handler.fetch(new Request('https://example.test/api/submit'));
           if (response.status !== 405) throw new Error('Unexpected response');`,
        ],
        { stdio: 'pipe' },
      )
    } finally {
      rmSync(output, { recursive: true, force: true })
    }
  })
})
