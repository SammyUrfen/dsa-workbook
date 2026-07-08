#!/usr/bin/env node
/* Validate all topic JSONs against the authoring spec + cross-check the
   problem ladders against the source markdown modules. */
import fs from 'node:fs'
import path from 'node:path'

const SITE = path.resolve(new URL('.', import.meta.url).pathname, '..')
const TOPICS_DIR = path.join(SITE, 'src', 'topics')
const MD_DIR = '/home/SammyUrfen/Codes/dsa-prep'

const ASSIGN = {
  't00.json': { tag: 'm00', md: null },
  't01.json': { tag: 'm01', md: '01-arrays-and-hashing.md' },
  't02.json': { tag: 'm03', md: '03-stack-and-monotonic-stack.md' },
  't03.json': { tag: 'm04', md: '04-binary-search.md' },
  't04.json': { tag: 'm05', md: '05-linked-list.md' },
  't05.json': { tag: 'm02', md: '02-two-pointers-and-sliding-window.md' },
  't06.json': { tag: 'm06', md: '06-trees-and-bst.md' },
  't07.json': { tag: 'm07', md: '07-tries.md' },
  't08.json': { tag: 'm08', md: '08-heaps-priority-queue.md' },
  't09.json': { tag: 'm09', md: '09-backtracking.md' },
  't10.json': { tag: 'm10', md: '10-graphs-traversal-and-union-find.md' },
  't11.json': { tag: 'm11', md: '11-graphs-weighted-dijkstra-mst.md' },
  't12.json': { tag: 'm12', md: '12-dynamic-programming-part1.md' },
  't13.json': { tag: 'm13', md: '13-dynamic-programming-part2.md' },
  't14.json': { tag: 'm14', md: '14-greedy-and-intervals.md' },
  't15.json': { tag: 'm15', md: null }, // ladder is synthesized, no md cross-check
}

const PRIORITIES = new Set(['attack', 'moderate', 'review', 'meta'])
const DIFFS = new Set(['Easy', 'Medium', 'Hard'])
const FIG_RE = /\[\[fig:([a-z0-9-]+)(?:\|[^\]]+)?\]\]/g

const errors = []
const warnings = []
const err = (f, m) => errors.push(`${f}: ${m}`)
const warn = (f, m) => warnings.push(`${f}: ${m}`)

/* Extract ladder URLs from a source md's "## Problem ladder" section */
function ladderUrls(mdFile) {
  const text = fs.readFileSync(path.join(MD_DIR, mdFile), 'utf8')
  const m = text.match(/## Problem ladder\n([\s\S]*?)(\n## |$)/)
  if (!m) return []
  const urls = []
  const re = /\((https:\/\/leetcode\.com\/problems\/[^)]+)\)/g
  let x
  while ((x = re.exec(m[1])) !== null) urls.push(x[1].replace(/\/$/, ''))
  return urls
}

const seenFigIds = new Set()
const seenTags = new Set()
let totals = { topics: 0, notes: 0, problems: 0, dives: 0, quiz: 0, figures: 0 }

for (const [file, meta] of Object.entries(ASSIGN)) {
  const fp = path.join(TOPICS_DIR, file)
  if (!fs.existsSync(fp)) {
    err(file, 'MISSING FILE')
    continue
  }
  let t
  try {
    t = JSON.parse(fs.readFileSync(fp, 'utf8'))
  } catch (e) {
    err(file, `invalid JSON: ${e.message}`)
    continue
  }
  totals.topics++

  // scalar fields
  if (t.tag !== meta.tag) err(file, `tag "${t.tag}" != expected "${meta.tag}"`)
  if (seenTags.has(t.tag)) err(file, `duplicate tag ${t.tag}`)
  seenTags.add(t.tag)
  for (const k of ['week', 'title', 'summary']) {
    if (typeof t[k] !== 'string' || !t[k].trim()) err(file, `missing/empty "${k}"`)
  }
  if (!PRIORITIES.has(t.priority)) err(file, `bad priority "${t.priority}"`)

  // notes
  if (!Array.isArray(t.notes) || t.notes.length < 3) err(file, `needs >=3 notes, has ${t.notes?.length ?? 0}`)
  for (const [i, n] of (t.notes || []).entries()) {
    if (!n.heading || !n.body) err(file, `notes[${i}] missing heading/body`)
  }
  totals.notes += t.notes?.length || 0

  // problems
  if (!Array.isArray(t.problems)) err(file, 'problems must be an array')
  for (const [i, p] of (t.problems || []).entries()) {
    if (!p.name) err(file, `problems[${i}] missing name`)
    if (!p.url || !/^https:\/\//.test(p.url)) err(file, `problems[${i}] bad url ${p.url}`)
    if (!DIFFS.has(p.difficulty)) err(file, `problems[${i}] bad difficulty "${p.difficulty}"`)
  }
  totals.problems += t.problems?.length || 0

  // ladder cross-check vs source md
  if (meta.md) {
    const want = ladderUrls(meta.md)
    const have = new Set((t.problems || []).map((p) => (p.url || '').replace(/\/$/, '')))
    for (const u of want) if (!have.has(u)) err(file, `ladder problem missing from JSON: ${u}`)
    if (want.length === 0) warn(file, `no ladder found in ${meta.md} (check section name)`)
    // 🎯 preservation
    const mdText = fs.readFileSync(path.join(MD_DIR, meta.md), 'utf8')
    for (const p of t.problems || []) {
      const u = (p.url || '').replace(/\/$/, '')
      const line = mdText.split('\n').find((l) => l.includes(u))
      if (line && line.includes('🎯') && !p.oa) err(file, `lost 🎯 flag: ${p.name}`)
    }
  }

  // deep dives
  if (t.tag !== 'm00' && (!Array.isArray(t.deepdives) || t.deepdives.length < 2))
    warn(file, `only ${t.deepdives?.length ?? 0} deep dives`)
  for (const [i, d] of (t.deepdives || []).entries()) {
    if (!d.q || !d.answer) err(file, `deepdives[${i}] missing q/answer`)
  }
  totals.dives += t.deepdives?.length || 0

  // quiz
  if (t.tag !== 'm00' && (!Array.isArray(t.quiz) || t.quiz.length < 5))
    warn(file, `only ${t.quiz?.length ?? 0} quiz questions (want 6-8)`)
  for (const [i, q] of (t.quiz || []).entries()) {
    if (!q.q || !Array.isArray(q.options) || q.options.length < 2)
      err(file, `quiz[${i}] malformed`)
    else if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length)
      err(file, `quiz[${i}] answer index out of range`)
    if (!q.explanation) err(file, `quiz[${i}] missing explanation`)
  }
  totals.quiz += t.quiz?.length || 0

  // figures
  const figs = t.figures || {}
  for (const [id, f] of Object.entries(figs)) {
    if (!id.startsWith(t.tag + '-')) err(file, `figure id "${id}" must start with "${t.tag}-"`)
    if (seenFigIds.has(id)) err(file, `duplicate figure id ${id}`)
    seenFigIds.add(id)
    if (!f.svg || !f.svg.includes('<svg') || !f.svg.includes('viewBox'))
      err(file, `figure ${id} svg missing/no viewBox`)
    if (!f.caption) warn(file, `figure ${id} has no caption`)
    if (/fill="#|stroke="#|fill="[a-z]+"|stroke="[a-z]+"/.test(f.svg || '')) {
      const bad = (f.svg.match(/(?:fill|stroke)="(?!url|none)[^"]*"/g) || []).filter(
        (s) => !/^(fill|stroke)="(none|url\([^)]*\))"$/.test(s)
      )
      if (bad.length) warn(file, `figure ${id} hardcodes colors: ${[...new Set(bad)].slice(0, 4).join(' ')}`)
    }
    if (/width="\d+"\s*height="\d+"[^>]*>/.test((f.svg.match(/<svg[^>]*>/) || [''])[0]))
      warn(file, `figure ${id} <svg> has fixed width/height`)
  }
  totals.figures += Object.keys(figs).length

  // fig token resolution
  const bodies = [
    ...(t.notes || []).map((n) => n.body),
    ...(t.deepdives || []).map((d) => d.answer),
    t.summary || '',
  ].join('\n')
  let m
  FIG_RE.lastIndex = 0
  const referenced = new Set()
  while ((m = FIG_RE.exec(bodies)) !== null) referenced.add(m[1])
  for (const id of referenced) if (!figs[id]) err(file, `[[fig:${id}]] has no definition`)
  for (const id of Object.keys(figs)) if (!referenced.has(id)) warn(file, `figure ${id} defined but never referenced`)
}

console.log('== totals ==')
console.log(totals)
if (warnings.length) {
  console.log(`\n== ${warnings.length} warnings ==`)
  for (const w of warnings) console.log('  WARN', w)
}
if (errors.length) {
  console.log(`\n== ${errors.length} ERRORS ==`)
  for (const e of errors) console.log('  ERR ', e)
  process.exit(1)
}
console.log('\nAll topic files pass.')
