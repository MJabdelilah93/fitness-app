/**
 * Alternative icon generator using sharp (faster, no canvas needed).
 * Run once:
 *   npm install -D sharp
 *   node scripts/gen-icons-sharp.mjs
 */
import sharp from 'sharp'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dir = dirname(fileURLToPath(import.meta.url))
const PUBLIC = join(__dir, '..', 'public')
const SVG = join(__dir, '..', 'public', 'favicon.svg')

for (const size of [192, 512]) {
  await sharp(SVG)
    .resize(size, size)
    .png()
    .toFile(join(PUBLIC, `pwa-${size}x${size}.png`))
  console.log(`✓ pwa-${size}x${size}.png`)
}
console.log('Done.')
