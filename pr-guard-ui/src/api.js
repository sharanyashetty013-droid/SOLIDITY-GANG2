import { prs as fakePrs } from './data'

// true = fake demo data, false = real backend
const USE_FAKE = false

function toPr(r) {
  const findings = (r.findings || []).map((f) => ({
    file: f.file,
    lines: String(f.line),
    reason: f.reason,
    weight: f.weight,
    snippet: f.snippet || '',
  }))
  return {
    id: r.number,
    title: r.title,
    author: r.author,
    url: r.url,
    level: r.level,
    score: r.total,
    files: new Set(findings.map((f) => f.file)).size,
    age: '',
    explanation: '',
    findings,
    trust: (r.trust && r.trust.signals) || [],
  }
}

async function readError(res) {
  try {
    const j = await res.json()
    if (j && j.detail) return typeof j.detail === 'string' ? j.detail : 'Request failed'
  } catch (e) { /* ignore */ }
  return 'Server returned ' + res.status
}

export async function fetchPrs(repo) {
  if (USE_FAKE) {
    await new Promise((r) => setTimeout(r, 800))
    return fakePrs
  }
  const [owner, name] = repo.split('/')
  const res = await fetch(`/api/scan/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`)
  if (!res.ok) throw new Error(await readError(res))
  const data = await res.json()
  return (data.results || []).map(toPr)
}

// first call can take 30-90 s (model loading)
export async function explainPr(pr) {
  if (USE_FAKE) {
    await new Promise((r) => setTimeout(r, 1200))
    return pr.explanation
  }
  const res = await fetch('/api/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ level: pr.level, findings: pr.findings }),
  })
  if (!res.ok) throw new Error(await readError(res))
  const data = await res.json()
  return data.text
}

export async function fetchHealth() {
  if (USE_FAKE) return { ok: true, model: 'demo data', ai_running: true }
  const res = await fetch('/api/health')
  if (!res.ok) throw new Error('down')
  return await res.json()
}