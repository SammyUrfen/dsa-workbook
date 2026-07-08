#!/usr/bin/env node
/* Screenshot every rendered figure (.diagram) element per module, one PNG each,
   named <tag>__<figure-id>.png so reviewers can map back to the JSON source.
   Usage: node scripts/figshots.mjs <baseURL> <outDir> */
import { chromium } from 'playwright'
import fs from 'node:fs'

const base = process.argv[2] || 'http://localhost:4173/'
const out = process.argv[3] || '/tmp/dsa-figshots'
fs.mkdirSync(out, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1100, height: 900 } })
await page.goto(base, { waitUntil: 'networkidle' })
await page.waitForSelector('.nav-item')

// figure id lookup: token order per topic — read from the JSON files directly
const topicsDir = new URL('../src/topics/', import.meta.url).pathname
const files = fs.readdirSync(topicsDir).filter((f) => f.endsWith('.json')).sort()
const figIdsByTag = {}
for (const f of files) {
  const t = JSON.parse(fs.readFileSync(topicsDir + f, 'utf8'))
  figIdsByTag[t.tag] = { title: t.title, figs: Object.keys(t.figures || {}) }
}

const navCount = await page.locator('.nav-item').count()
let shot = 0
for (let i = 0; i < navCount; i++) {
  await page.locator('.nav-item').nth(i).click()
  await page.waitForTimeout(200)
  // figures can appear in Learn AND Deep Dives (revealed answers) — do Learn, then reveal all dives
  const tag = Object.keys(figIdsByTag)[0] // placeholder, resolved below
  // resolve tag by matching title
  const title = (await page.locator('h1').textContent()).trim()
  const entry = Object.entries(figIdsByTag).find(([, v]) => title.startsWith(v.title))
  const realTag = entry ? entry[0] : `topic${i}`

  const grab = async () => {
    const diagrams = page.locator('.diagram')
    const n = await diagrams.count()
    for (let d = 0; d < n; d++) {
      const el = diagrams.nth(d)
      // figure id = aria-label is unreliable; use the svg's position in DOM order.
      const svgHtml = await el.locator('svg').first().evaluate((s) => s.getAttribute('aria-label') || '')
      const idx = await el.evaluate((node) => {
        const all = [...document.querySelectorAll('.diagram')]
        return all.indexOf(node)
      })
      const fname = `${realTag}__${String(idx).padStart(2, '0')}__${svgHtml.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50) || 'fig'}.png`
      try {
        await el.screenshot({ path: `${out}/${fname}` })
        shot++
      } catch (e) {
        console.log('shot failed', fname, String(e).slice(0, 120))
      }
    }
  }

  // Learn tab (default)
  await grab()

  // Deep dives: reveal everything, grab any additional diagrams
  const ddTab = page.locator('.tab', { hasText: 'Deep Dives' })
  if (await ddTab.count()) {
    await ddTab.click()
    await page.waitForTimeout(150)
    const reveals = page.locator('.reveal')
    const rn = await reveals.count()
    for (let r = 0; r < rn; r++) {
      await reveals.nth(r).click()
      await page.waitForTimeout(80)
    }
    await grab()
  }
}
await browser.close()
console.log(`captured ${shot} figure screenshots into ${out}`)
