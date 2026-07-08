import { useState, useEffect, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'

/* ------------------------------------------------------------------ */
/*  Content: one JSON file per module in src/topics/, sorted by name   */
/* ------------------------------------------------------------------ */
const topicModules = import.meta.glob('./topics/*.json', { eager: true })
const TOPICS = Object.keys(topicModules)
  .sort()
  .map((k) => topicModules[k].default)
const FIGURES = Object.assign({}, ...TOPICS.map((t) => t.figures || {}))

const PRIORITY_META = {
  attack: { label: 'Attack', cls: 'prio-attack', dot: '🔴' },
  moderate: { label: 'Moderate', cls: 'prio-moderate', dot: '🟡' },
  review: { label: 'Review', cls: 'prio-review', dot: '🟢' },
  meta: { label: 'Meta-skill', cls: 'prio-meta', dot: '⭐' },
}

/* ------------------------------------------------------------------ */
/*  Callout support: turn  > [!TYPE] Title  blockquotes into boxes     */
/* ------------------------------------------------------------------ */
const CALLOUT_LABELS = {
  intuition: 'Intuition',
  analogy: 'Analogy',
  key: 'Key idea',
  math: 'The math, in plain words',
  example: 'Worked example',
  warning: 'Watch out',
  pitfall: 'Common pitfall',
  exam: 'OA tip',
  note: 'Note',
}

function remarkCallouts() {
  const walk = (node) => {
    if (!node || !node.children) return
    for (const child of node.children) {
      if (child.type === 'blockquote') {
        const first = child.children?.[0]
        const textNode = first?.type === 'paragraph' ? first.children?.[0] : null
        if (textNode?.type === 'text') {
          const nl = textNode.value.indexOf('\n')
          const firstLine = nl === -1 ? textNode.value : textNode.value.slice(0, nl)
          const m = firstLine.match(/^\s*\[!(\w+)\]\s*(.*)$/)
          if (m) {
            const type = m[1].toLowerCase()
            const title = m[2].trim()
            const base = CALLOUT_LABELS[type] || type
            textNode.value = nl === -1 ? '' : textNode.value.slice(nl + 1)
            child.data = child.data || {}
            child.data.hName = 'div'
            child.data.hProperties = { className: ['callout', 'callout-' + type] }
            child.children.unshift({
              type: 'paragraph',
              data: { hName: 'div', hProperties: { className: ['callout-label'] } },
              children: [{ type: 'text', value: title ? `${base} — ${title}` : base }],
            })
          }
        }
      }
      walk(child)
    }
  }
  return (tree) => walk(tree)
}

const MD_REMARK = [remarkMath, remarkGfm, remarkCallouts]
const MD_REHYPE = [rehypeKatex]

function MD({ children }) {
  return (
    <div className="md">
      <ReactMarkdown remarkPlugins={MD_REMARK} rehypePlugins={MD_REHYPE}>
        {children}
      </ReactMarkdown>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Figure: render an SVG diagram from the merged figure map by id     */
/* ------------------------------------------------------------------ */
function Figure({ id, captionOverride }) {
  const fig = FIGURES[id]
  if (!fig) return <div className="diagram-missing">missing figure: {id}</div>
  const caption = captionOverride || fig.caption
  return (
    <figure className="diagram">
      <div className="dg" dangerouslySetInnerHTML={{ __html: fig.svg }} />
      {caption && (
        <figcaption>
          <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>
            {caption}
          </ReactMarkdown>
        </figcaption>
      )}
    </figure>
  )
}

/* Split a markdown body on  [[fig:id]]  /  [[fig:id|caption]]  tokens */
const FIG_RE = /\[\[fig:([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g
function RichText({ text }) {
  if (!text) return null
  const segments = []
  let last = 0
  let m
  FIG_RE.lastIndex = 0
  while ((m = FIG_RE.exec(text)) !== null) {
    if (m.index > last) segments.push({ t: 'md', v: text.slice(last, m.index) })
    segments.push({ t: 'fig', id: m[1], cap: m[2] })
    last = m.index + m[0].length
  }
  if (last < text.length) segments.push({ t: 'md', v: text.slice(last) })
  return (
    <>
      {segments.map((s, i) =>
        s.t === 'fig' ? (
          <Figure key={i} id={s.id} captionOverride={s.cap} />
        ) : (
          s.v.trim() && <MD key={i}>{s.v}</MD>
        )
      )}
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Persistence                                                        */
/* ------------------------------------------------------------------ */
function usePersist(key, initial) {
  const [val, setVal] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(val))
    } catch {
      /* ignore */
    }
  }, [key, val])
  return [val, setVal]
}

function useTheme() {
  const [theme, setTheme] = usePersist('theme', 'light')
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])
  return [theme, setTheme]
}

/* Read the solved-problems map for a topic straight from storage      */
function readSolved(tag) {
  try {
    const raw = localStorage.getItem(`probs:${tag}`)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

/* ------------------------------------------------------------------ */
/*  Panels                                                             */
/* ------------------------------------------------------------------ */
function Learn({ topic }) {
  return (
    <div className="stack">
      {topic.notes.map((n, i) => (
        <section className="card note" key={i}>
          <h3>
            <span className="note-idx">{i + 1}</span>
            {n.heading}
          </h3>
          <div className="note-body">
            <RichText text={n.body} />
          </div>
        </section>
      ))}
    </div>
  )
}

function Problems({ topic, tag, theme, onProgress }) {
  const [solved, setSolved] = usePersist(`probs:${tag}`, {})
  const [padOpen, setPadOpen] = useState(false)
  const total = topic.problems.length
  const nSolved = topic.problems.reduce((a, p) => a + (solved[p.url] ? 1 : 0), 0)

  useEffect(() => {
    onProgress && onProgress()
  }, [solved])

  const toggle = (url) => {
    const next = { ...solved }
    if (next[url]) delete next[url]
    else next[url] = true
    setSolved(next)
  }

  return (
    <div className="stack">
      <div className="quiz-bar">
        <span>
          Solved <strong>{nSolved}</strong>/{total}
        </span>
        <span className="prob-hint">
          🎯 = OA-critical, do these first · problems open on LeetCode
        </span>
        <span className="score-pill">
          {total ? Math.round((nSolved / total) * 100) : 0}%
        </span>
        <button className="ghost" onClick={() => setPadOpen((o) => !o)}>
          {padOpen ? 'Hide C++ scratchpad' : 'Open C++ scratchpad'}
        </button>
      </div>

      {padOpen && (
        <div className="scratchpad card">
          <div className="scratchpad-head">
            <strong>C++ scratchpad</strong>
            <span className="prob-hint">
              quick experiments — for the real judge, submit on LeetCode
            </span>
            <a
              className="ghost"
              href="https://godbolt.org/"
              target="_blank"
              rel="noreferrer"
            >
              Compiler Explorer ↗
            </a>
          </div>
          <iframe
            title="C++ scratchpad"
            src={`https://onecompiler.com/embed/cpp?hideTitle=true&hideNew=true&hideNewFileOption=true&theme=${theme === 'dark' ? 'dark' : 'light'}`}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      )}

      {topic.problems.map((p, i) => {
        const done = !!solved[p.url]
        return (
          <section className={'card prob-card' + (done ? ' solved' : '')} key={p.url}>
            <div className="prob-row">
              <input
                type="checkbox"
                className="prob-check"
                checked={done}
                onChange={() => toggle(p.url)}
                aria-label={`Mark ${p.name} solved`}
              />
              <span className="prob-name">
                <a href={p.url} target="_blank" rel="noreferrer">
                  {p.name}
                </a>
              </span>
              {p.oa && <span className="oa-badge">🎯 OA</span>}
              <span className={'diff diff-' + (p.difficulty || 'medium').toLowerCase()}>
                {p.difficulty}
              </span>
              <a className="solve-btn" href={p.url} target="_blank" rel="noreferrer">
                Solve ↗
              </a>
            </div>
            {p.note && (
              <div className="prob-note">
                <MD>{p.note}</MD>
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

function DeepDives({ topic, tag }) {
  const [open, setOpen] = usePersist(`dive:${tag}`, {})
  return (
    <div className="stack">
      <div className="quiz-bar">
        <span className="prob-hint">
          Genuinely try each one for 20–30 minutes on LeetCode before revealing the walkthrough —
          the struggle is where the learning happens.
        </span>
      </div>
      {topic.deepdives.map((d, i) => {
        const shown = open[i]
        return (
          <section className="card" key={i}>
            <div className="q-head">
              <span className="q-num">#{i + 1}</span>
              <div className="q-text">
                <MD>{d.q}</MD>
              </div>
              {d.tag && <span className="q-tag">{d.tag}</span>}
            </div>
            {d.url && (
              <a className="solve-btn dive-link" href={d.url} target="_blank" rel="noreferrer">
                Try it on LeetCode ↗
              </a>
            )}
            <button className="ghost reveal" onClick={() => setOpen({ ...open, [i]: !shown })}>
              {shown ? 'Hide the walkthrough' : 'Show the walkthrough'}
            </button>
            {shown && (
              <div className="answer">
                <RichText text={d.answer} />
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

function Quiz({ topic, tag }) {
  const [picks, setPicks] = usePersist(`quiz:${tag}`, {})
  const answered = Object.keys(picks).length
  const correct = topic.quiz.reduce((acc, q, i) => acc + (picks[i] === q.answer ? 1 : 0), 0)

  return (
    <div className="stack">
      <div className="quiz-bar">
        <span>
          Answered <strong>{answered}</strong>/{topic.quiz.length}
        </span>
        <span className="score-pill">
          Score {correct}/{answered || 0}
        </span>
        <button className="ghost" onClick={() => setPicks({})}>
          Reset
        </button>
      </div>

      {topic.quiz.map((q, i) => {
        const pick = picks[i]
        const done = pick !== undefined
        return (
          <section className="card" key={i}>
            <div className="q-head">
              <span className="q-num">Q{i + 1}</span>
              <div className="q-text">
                <MD>{q.q}</MD>
              </div>
              {q.tag && <span className="q-tag">{q.tag}</span>}
            </div>
            <div className="options">
              {q.options.map((opt, oi) => {
                let cls = 'option'
                let mark = ''
                if (done) {
                  if (oi === q.answer) {
                    cls += ' correct'
                    mark = '✓'
                  } else if (oi === pick) {
                    cls += ' wrong'
                    mark = '✗'
                  } else cls += ' dim'
                }
                return (
                  <button
                    key={oi}
                    className={cls}
                    disabled={done}
                    onClick={() => setPicks({ ...picks, [i]: oi })}
                  >
                    <span className="opt-letter">{String.fromCharCode(65 + oi)}</span>
                    <span className="opt-body">
                      <MD>{opt}</MD>
                    </span>
                    {mark && <span className="opt-mark">{mark}</span>}
                  </button>
                )
              })}
            </div>
            {done && (
              <div className={'explain ' + (pick === q.answer ? 'ok' : 'no')}>
                <span className="verdict">
                  {pick === q.answer ? 'Correct. ' : 'Not quite. '}
                </span>
                <MD>{q.explanation}</MD>
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

/* Shared, theme-aware arrowhead markers referenced by every diagram   */
function SvgDefs() {
  const mk = (id, cls) => (
    <marker
      id={id}
      viewBox="0 0 10 10"
      refX="8.4"
      refY="5"
      markerWidth="7"
      markerHeight="7"
      orient="auto-start-reverse"
    >
      <path d="M0,0 L10,5 L0,10 z" className={cls} />
    </marker>
  )
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        {mk('dg-arrow', 'dg-mk-line')}
        {mk('dg-arrow-accent', 'dg-mk-accent')}
        {mk('dg-arrow-accent2', 'dg-mk-accent2')}
        {mk('dg-arrow-ok', 'dg-mk-ok')}
        {mk('dg-arrow-bad', 'dg-mk-bad')}
      </defs>
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  App                                                                */
/* ------------------------------------------------------------------ */
export default function App() {
  const [theme, setTheme] = useTheme()
  const [active, setActive] = useState(TOPICS[0].tag)
  const [tab, setTab] = useState('learn')
  const [navOpen, setNavOpen] = useState(false)
  const [, forceTick] = useState(0)
  const topic = useMemo(() => TOPICS.find((t) => t.tag === active), [active])

  // overall progress = 🎯 problems solved across every module
  const { solvedOA, totalOA, perTopic } = useMemo(() => {
    let solvedOA = 0
    let totalOA = 0
    const perTopic = {}
    for (const t of TOPICS) {
      const probs = t.problems || []
      const oa = probs.filter((p) => p.oa)
      const pool = oa.length ? oa : probs
      if (!pool.length) continue
      const solved = readSolved(t.tag)
      const n = pool.reduce((a, p) => a + (solved[p.url] ? 1 : 0), 0)
      totalOA += pool.length
      solvedOA += n
      perTopic[t.tag] = { n, total: pool.length, done: n === pool.length }
    }
    return { solvedOA, totalOA, perTopic }
    // re-derived on every render tick; cheap (localStorage reads)
  }, [active, tab, forceTick, theme])

  const groups = useMemo(() => {
    const m = new Map()
    for (const t of TOPICS) {
      const week = t.week.split('·')[0].trim()
      if (!m.has(week)) m.set(week, [])
      m.get(week).push(t)
    }
    return [...m.entries()]
  }, [])

  const pct = totalOA ? Math.round((solvedOA / totalOA) * 100) : 0
  const prio = PRIORITY_META[topic.priority]

  const tabs = [
    ['learn', 'Learn', (topic.notes || []).length],
    ['problems', 'Problems', (topic.problems || []).length],
    ['deepdives', 'Deep Dives', (topic.deepdives || []).length],
    ['quiz', 'Quiz', (topic.quiz || []).length],
  ].filter(([, , n]) => n > 0)

  const activeTab = tabs.some(([id]) => id === tab) ? tab : tabs[0][0]

  return (
    <div className="app">
      <SvgDefs />
      <aside className={'sidebar' + (navOpen ? ' open' : '')}>
        <div className="brand">
          <div className="brand-row">
            <div className="brand-mark">{'{}'}</div>
            <div>
              <div className="brand-title">DSA Interview Prep</div>
              <div className="brand-sub">Workbook · {TOPICS.length} modules · C++</div>
            </div>
          </div>
          <div className="progress-wrap">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: pct + '%' }} />
            </div>
            <div className="progress-label">
              <span>🎯 OA problems solved</span>
              <span>
                {solvedOA}/{totalOA}
              </span>
            </div>
          </div>
        </div>
        <nav>
          {groups.map(([week, items]) => (
            <div className="nav-group" key={week}>
              <div className="nav-week">{week}</div>
              {items.map((t) => (
                <button
                  key={t.tag}
                  className={
                    'nav-item' +
                    (t.tag === active ? ' sel' : '') +
                    (perTopic[t.tag]?.done ? ' done' : '')
                  }
                  onClick={() => {
                    setActive(t.tag)
                    setTab('learn')
                    setNavOpen(false)
                    window.scrollTo(0, 0)
                  }}
                >
                  <span className="nav-dot">
                    {t.week.split('·')[1]?.replace(/\D/g, '') || '•'}
                  </span>
                  <span className="nav-name">{t.title}</span>
                  <span className="nav-prio">{PRIORITY_META[t.priority]?.dot}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="src-note">
          Built from the <code>dsa-prep</code> plan — calibrated to Bibek&apos;s own Java/C++
          code and tuned for the Microsoft, Flipkart and Trilogy assessments.
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="hamburger" onClick={() => setNavOpen((o) => !o)} aria-label="Menu">
            ☰
          </button>
          <div>
            <div className="crumb">{topic.week}</div>
          </div>
          <div className="spacer" />
          <button
            className="theme-btn"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </header>

        <h1>
          {topic.title}
          {prio && <span className={'prio ' + prio.cls}>{prio.label}</span>}
        </h1>
        <div className="summary">
          <MD>{topic.summary}</MD>
        </div>

        <div className="tabs">
          {tabs.map(([id, label, n]) => (
            <button
              key={id}
              className={'tab' + (activeTab === id ? ' active' : '')}
              onClick={() => setTab(id)}
            >
              {label} <span className="count">{n}</span>
            </button>
          ))}
        </div>

        <div className="content">
          {activeTab === 'learn' && <Learn topic={topic} />}
          {activeTab === 'problems' && (
            <Problems
              topic={topic}
              tag={topic.tag}
              theme={theme}
              onProgress={() => forceTick((x) => x + 1)}
            />
          )}
          {activeTab === 'deepdives' && <DeepDives topic={topic} tag={topic.tag} />}
          {activeTab === 'quiz' && <Quiz topic={topic} tag={topic.tag} />}
        </div>
      </main>

      {navOpen && <div className="scrim" onClick={() => setNavOpen(false)} />}
    </div>
  )
}
