/**
 * Quick icon generator – run ONCE after npm install:
 *   node scripts/gen-icons.mjs
 *
 * Requires: npm install -D sharp
 * (sharp is not in the main deps to keep the bundle lean)
 */
import { createCanvas } from 'node:canvas'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dir = dirname(fileURLToPath(import.meta.url))
const PUBLIC = join(__dir, '..', 'public')

function drawIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  const r = size * 0.22           // corner radius
  const s = size                  // shorthand

  // Background
  ctx.fillStyle = '#09090b'
  ctx.beginPath()
  ctx.roundRect(0, 0, s, s, r)
  ctx.fill()

  // Dumbbell (proportional)
  ctx.fillStyle = '#f97316'
  const pad  = s * 0.12
  const barY = s * 0.44
  const barH = s * 0.12
  const barX = s * 0.29
  const barW = s * 0.42

  // Left collar
  ctx.beginPath()
  ctx.roundRect(pad, s * 0.40, s * 0.09, s * 0.20, s * 0.04)
  ctx.fill()

  // Left plate
  ctx.beginPath()
  ctx.roundRect(pad + s * 0.09, s * 0.34, s * 0.08, s * 0.32, s * 0.04)
  ctx.fill()

  // Bar
  ctx.beginPath()
  ctx.roundRect(barX, barY, barW, barH, barH / 2)
  ctx.fill()

  // Right plate
  ctx.beginPath()
  ctx.roundRect(barX + barW, s * 0.34, s * 0.08, s * 0.32, s * 0.04)
  ctx.fill()

  // Right collar
  ctx.beginPath()
  ctx.roundRect(s - pad - s * 0.09, s * 0.40, s * 0.09, s * 0.20, s * 0.04)
  ctx.fill()

  return canvas
}

for (const size of [192, 512]) {
  const canvas = drawIcon(size)
  const buf = canvas.toBuffer('image/png')
  writeFileSync(join(PUBLIC, `pwa-${size}x${size}.png`), buf)
  console.log(`✓ pwa-${size}x${size}.png`)
}
console.log('Icons generated in public/')
