import { useState, useEffect, useRef } from 'react'
import { LayoutGrid, ShieldCheck, Settings, Search, Bell, X, Download, ArrowLeft } from 'lucide-react'
import { repos } from './data'
import { fetchPrs } from './api'
import { Logo } from './Logo'
import SettingsView from './SettingsView'

const levels = ['High', 'Medium', 'Low']
const label = { High: 'Worth a closer look', Medium: 'Worth a quick check', Low: 'Looks routine' }
const heat = ['var(--high)', 'var(--med)', 'var(--low)', 'var(--blue)']
const scanSteps = [
  'Fetching open pull requests',
  'Detecting first-time contributors',
  'Running code risk rules',
  'Collecting context signals',
  'Writing explanations',
]

export default function Dashboard({ onHome }) {
  const [repo, setRepo] = useState(repos[0])
  const [open, setOpen] = useState(null)
  const [phase, setPhase] = useState('idle') // idle | scanning | done
  const [stepIdx, setStepIdx] = useState(0)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [view, setView] = useState('dash')
  const [repoList, setRepoList] = useState(repos)
  const [url, setUrl] = useState('')
  const [urlErr, setUrlErr] = useState('')
    const [prs, setPrs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const searchRef = useRef(null)
  const count = (l) => prs.filter((p) => p.level === l).length

  const shown = prs.filter(
    (p) =>
      (filter === 'All' || p.level === filter) &&
      (p.title + ' ' + p.author + ' ' + p.id).toLowerCase().includes(query.toLowerCase())
  )

   const startScan = (name) => {
    const target = typeof name === 'string' ? name : repo
    setOpen(null)
    setError('')
    setStepIdx(0)
    setLoading(true)
    setPhase('scanning')
    fetchPrs(target)
      .then(setPrs)
      .catch((e) => { setError(e.message); setPhase('error') })
      .finally(() => setLoading(false))
  }

    const scanUrl = (e) => {
    e.preventDefault()
    const m = url.trim().match(/github\.com\/([^/\s]+)\/([^/\s#?]+)/)
    if (!m) { setUrlErr('Paste a GitHub link like https://github.com/owner/repo'); return }
    const name = m[1] + '/' + m[2].replace(/\.git$/, '')
    setRepoList((l) => (l.includes(name) ? l : [name, ...l]))
    setRepo(name)
    setUrl('')
    setUrlErr('')
    startScan(name)
  }

  useEffect(() => {
    if (phase !== 'scanning') return
    if (stepIdx >= scanSteps.length) {
      if (!loading) setPhase('done')
      return
    }
    const t = setTimeout(() => setStepIdx((i) => i + 1), 700)
    return () => clearTimeout(t)
    }, [phase, stepIdx, loading])

    const goBack = () => {
    if (open) setOpen(null)
    else if (view === 'settings') setView('dash')
    else if (phase === 'done') setPhase('idle')
    else onHome()
  }

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') setOpen(null) }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  const exportMd = () => {
    const lines = [
      `# PRism report: ${repo}`,
      '',
      `Scanned ${new Date().toLocaleString()}. ${prs.length} first-time PRs.`,
      '',
    ]
    prs
      .slice()
      .sort((a, b) => b.score - a.score)
      .forEach((p) => {
        lines.push(`## #${p.id} ${p.title} (${p.level}, score ${p.score})`, `Author: @${p.author}`, '', p.explanation, '')
        if (p.findings.length) {
          lines.push('Evidence:')
          p.findings.forEach((f) => lines.push(`- ${f.file}:${f.lines} - ${f.reason} (+${f.weight})`))
        } else {
          lines.push('No code findings.')
        }
        lines.push('', 'Context: ' + p.trust.join('; '), '')
      })
    lines.push('---', 'Advisory only. A Low score is not a guarantee of safety. The maintainer makes the final call.')
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'prism-report.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="app">
      <aside className="side">
        <button title="Dashboard" className={'ico ' + (view === 'dash' ? 'active' : '')} onClick={() => setView('dash')}><LayoutGrid size={18} /></button>
        <button title="Settings" className={'ico ' + (view === 'settings' ? 'active' : '')} onClick={() => setView('settings')}><Settings size={18} /></button>
      </aside>

      <main>
        <header className="top">
          <button className="home" onClick={onHome}><Logo /></button>
          <div className="actions">
            <select
              className="pill"
              value={repo}
              onChange={(e) => { setRepo(e.target.value); setPhase('idle') }}
            >
              {repoList.map((r) => <option key={r}>{r}</option>)}
            </select>
            <button className="round" onClick={() => searchRef.current && searchRef.current.focus()}><Search size={16} /></button>
            <button className="round"><Bell size={16} /></button>
            <button className="round dark" onClick={startScan} disabled={phase === 'scanning'}>
              {phase === 'scanning' ? 'Scanning...' : phase === 'done' ? 'Scan again' : 'Scan'}
            </button>
          </div>
        </header>
                {phase !== 'scanning' && (
          <button className="back" onClick={goBack}><ArrowLeft size={15} /> Back</button>
        )}
        {view === 'settings' && <SettingsView />}

        {view === 'dash' && phase === 'idle' && (
          <section className="card empty">
            <div className="empty-icon"><ShieldCheck size={30} /></div>
            <h2>Ready to scan {repo}</h2>
            <p>Pick a repo above and press Scan. We will find open PRs from first-time contributors and rank them by risk, with evidence for every flag.</p>
                        <form className="urlbox" onSubmit={scanUrl}>
              <input
                className="search"
                placeholder="Paste a GitHub repo or PR link"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setUrlErr('') }}
              />
              <button className="round dark" type="submit">Scan link</button>
            </form>
            {urlErr && <p className="urlerr">{urlErr}</p>}
            <span className="or">or</span>
            <button className="round dark big" onClick={startScan}>Scan {repo}</button>
          </section>
        )}

        {view === 'dash' && phase === 'scanning' && (
          <section className="card scanner">
            <h2>Scanning {repo}</h2>
            <div className="progress"><i style={{ width: (stepIdx / scanSteps.length) * 100 + '%' }} /></div>
            <ul className="ssteps">
              {scanSteps.map((s, i) => (
                <li key={s} className={i < stepIdx ? 'done' : i === stepIdx ? 'active' : ''}>
                  <span className="dot" />{s}
                </li>
              ))}
            </ul>
          </section>
        )}

        {view === 'dash' && phase === 'done' && (
          <>
            <p className="scanned">Scanned {repo} just now. Found {prs.length} first-time PRs.</p>
            <div className="grid">
              <div className="col">
                <section className="card">
                  <h3>Risk breakdown</h3>
                  <div className="bubbles">
                    {levels.map((l) => (
                      <div key={l} className={'bubble ' + l} style={{ width: 90 + count(l) * 28, height: 90 + count(l) * 28 }}>
                        <b>{l}</b><span>{count(l)} PRs</span>
                      </div>
                    ))}
                  </div>
                </section>
                <section className="card">
                  <h3>Scan activity</h3>
                  <div className="heat">
                    {Array.from({ length: 98 }).map((_, i) => (
                      <i key={i} style={{ background: heat[(i * 7 + (i % 5) * 3) % 4] }} />
                    ))}
                  </div>
                </section>
              </div>

              <div className="col">
                <div className="stats">
                  <div className="card stat"><span>First-time PRs</span><b>{prs.length}</b></div>
                  <div className="card stat"><span>Need a closer look</span><b>{count('High')}</b></div>
                  <div className="card stat"><span>Avg scan time</span><b>4.2s</b></div>
                </div>

                <section className="card">
                  <h3>First-time PRs, ranked by risk</h3>

                  <div className="toolbar">
                    <input
                      ref={searchRef}
                      className="search"
                      placeholder="Search by title, author or number"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="chips">
                      {['All', ...levels].map((l) => (
                        <button key={l} className={'chip ' + (filter === l ? 'on' : '')} onClick={() => setFilter(l)}>{l}</button>
                      ))}
                    </div>
                    <button className="export" onClick={exportMd}><Download size={14} /> Export report</button>
                  </div>

                  {shown.length === 0 && <p className="muted">No PRs match your search.</p>}

                  {levels.map((l) => {
                    const list = shown.filter((p) => p.level === l)
                    if (list.length === 0) return null
                    return (
                      <div key={l} className="group">
                        <h4>{l} <small>{label[l]}</small></h4>
                        <div className="cards">
                          {list.map((p) => (
                            <button key={p.id} className="pr" onClick={() => setOpen(p)}>
                              <span className={'tag ' + p.level}>{p.level}</span>
                              <strong>#{p.id} {p.title}</strong>
                              <em>@{p.author} · {p.age} ago</em>
                              <small>{p.files} files · score {p.score} · {p.findings.length} findings</small>
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </section>
              </div>
            </div>
          </>
        )}
      </main>

      {open && (
        <>
          <div className="overlay" onClick={() => setOpen(null)} />
          <aside className="drawer">
            <button className="close" onClick={() => setOpen(null)}><X size={18} /></button>
            <span className={'tag ' + open.level}>{open.level} · score {open.score}</span>
            <h2>#{open.id} {open.title}</h2>
            <em>@{open.author}</em>

            <h4>Summary</h4>
            <p>{open.explanation}</p>

            <h4>Evidence</h4>
            {open.findings.length === 0 && <p className="muted">No code findings. No evidence means no flag.</p>}
            {open.findings.map((f, i) => (
              <div key={i} className="evid">
                <code>{f.file}:{f.lines}</code>
                <p>{f.reason}</p>
                <small>+{f.weight} points</small>
              </div>
            ))}

            <h4>Context signals</h4>
            <ul>{open.trust.map((t) => <li key={t}>{t}</li>)}</ul>

            <p className="note">Advisory only. A Low score is not a guarantee of safety. The maintainer makes the final call.</p>
          </aside>
        </>
      )}
    </div>
  )
}