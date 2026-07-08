#!/usr/bin/env node
/* End-to-end QA: drive the built site with Playwright.
   - captures console errors / missing figures
   - screenshots every module's Learn tab (full page) for visual review
   - exercises tabs, problem checkboxes, quiz, deep-dive reveal, theme toggle
   Usage: node scripts/qa.mjs <baseURL> <shotDir> */
import { chromium } from 'playwright'
import fs from 'node:fs'

const base = process.argv[2] || 'http://localhost:4173/'
const shotDir = process.argv[3] || '/tmp/dsa-workbook-shots'
fs.mkdirSync(shotDir, { recursive: true })

const problems = []
const note = (m) => {
  problems.push(m)
  console.log('ISSUE:', m)
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } })
page.on('console', (msg) => {
  if (msg.type() === 'error') note(`console error: ${msg.text().slice(0, 300)}`)
})
page.on('pageerror', (e) => note(`page error: ${String(e).slice(0, 300)}`))

await page.goto(base, { waitUntil: 'networkidle' })
await page.waitForSelector('.nav-item')

const navCount = await page.locator('.nav-item').count()
console.log(`nav items: ${navCount}`)
if (navCount !== 16) note(`expected 16 nav items, found ${navCount}`)

for (let i = 0; i < navCount; i++) {
  const nav = page.locator('.nav-item').nth(i)
  const name = (await nav.locator('.nav-name').textContent()).trim()
  await nav.click()
  await page.waitForTimeout(250)

  // missing figure sentinels
  const missing = await page.locator('.diagram-missing').count()
  if (missing) {
    const ids = await page.locator('.diagram-missing').allTextContents()
    note(`[${name}] missing figures: ${ids.join(', ')}`)
  }
  // Learn tab full-page screenshot
  const slug = String(i).padStart(2, '0') + '-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)
  await page.screenshot({ path: `${shotDir}/${slug}-learn.png`, fullPage: true })

  // visit every tab; count cards; screenshot problems tab of a couple modules
  const tabs = await page.locator('.tab').allTextContents()
  for (let t = 0; t < tabs.length; t++) {
    await page.locator('.tab').nth(t).click()
    await page.waitForTimeout(120)
    const cards = await page.locator('.card').count()
    if (!cards) note(`[${name}] tab "${tabs[t].trim()}" renders zero cards`)
  }
  // horizontal overflow check (page must not scroll sideways)
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  )
  if (overflow > 4) note(`[${name}] horizontal overflow of ${overflow}px`)
}

/* ---- interaction spot-checks on module 04 (Binary Search) ---- */
const bs = page.locator('.nav-item', { hasText: 'Binary Search' }).first()
await bs.click()
await page.waitForTimeout(200)

// problems: check first checkbox -> progress must move
await page.locator('.tab', { hasText: 'Problems' }).click()
await page.waitForTimeout(150)
const before = await page.locator('.progress-label span').nth(1).textContent()
await page.locator('.prob-check').first().check()
await page.waitForTimeout(250)
const after = await page.locator('.progress-label span').nth(1).textContent()
console.log(`progress before=${before.trim()} after=${after.trim()}`)
const solvedBar = await page.locator('.quiz-bar strong').first().textContent()
if (solvedBar.trim() === '0') note('checking a problem did not update the solved counter')

// external links open in new tab with correct host
const href = await page.locator('.prob-name a').first().getAttribute('href')
const target = await page.locator('.prob-name a').first().getAttribute('target')
if (!href || !href.startsWith('https://leetcode.com/')) note(`first problem href odd: ${href}`)
if (target !== '_blank') note('problem links must open in a new tab')
await page.screenshot({ path: `${shotDir}/zz-problems-tab.png`, fullPage: false })

// scratchpad toggle
await page.locator('.ghost', { hasText: 'scratchpad' }).first().click()
await page.waitForTimeout(400)
const iframeCount = await page.locator('.scratchpad iframe').count()
if (!iframeCount) note('scratchpad iframe did not appear')
await page.screenshot({ path: `${shotDir}/zz-scratchpad.png` })

// deep dive reveal
await page.locator('.tab', { hasText: 'Deep Dives' }).click()
await page.waitForTimeout(150)
await page.locator('.reveal').first().click()
await page.waitForTimeout(200)
const answerShown = await page.locator('.answer').count()
if (!answerShown) note('deep-dive reveal did not show an answer')

// quiz answer
await page.locator('.tab', { hasText: 'Quiz' }).click()
await page.waitForTimeout(150)
await page.locator('.option').first().click()
await page.waitForTimeout(200)
const explain = await page.locator('.explain').count()
if (!explain) note('quiz explanation did not appear after answering')
await page.screenshot({ path: `${shotDir}/zz-quiz.png`, fullPage: false })

// theme toggle -> dark screenshots
await page.locator('.theme-btn').click()
await page.waitForTimeout(300)
const themeAttr = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
if (themeAttr !== 'dark') note(`theme toggle failed, data-theme=${themeAttr}`)
await page.locator('.tab', { hasText: 'Learn' }).click()
await page.waitForTimeout(200)
await page.screenshot({ path: `${shotDir}/zz-dark-learn.png`, fullPage: true })

// persistence across reload
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(300)
const themeAfter = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
if (themeAfter !== 'dark') note('theme did not persist across reload')

await browser.close()

fs.writeFileSync(`${shotDir}/issues.json`, JSON.stringify(problems, null, 2))
console.log(`\n${problems.length} issues. Screenshots in ${shotDir}`)
process.exit(0)
