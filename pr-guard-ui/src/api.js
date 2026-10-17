const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

function parseRepo(input) {
  const m = input.match(/github\.com\/([^/\s]+)\/([^/\s#?]+)/)
  if (m) return { owner: m[1], repo: m[2].replace(/\.git$/, '') }
  const [owner, repo] = input.trim().split('/')
  return { owner, repo }
}

export async function fetchPrs(input) {
  const { owner, repo } = parseRepo(input)
  const res = await fetch(`${API_URL}/api/scan/${owner}/${repo}`)
  if (!res.ok) throw new Error('Server returned ' + res.status)
  const data = await res.json()
  return data.results.map((r) => ({
    id: r.number,
    title: r.title,
    author: r.author,
    level: r.level,
    score: r.total,
    files: new Set((r.findings || []).map((f) => f.file)).size,
    age: '',
    explanation: 'Flagged by automated rules. Review the evidence below.',
    findings: (r.findings || []).map((f) => ({
      file: f.file,
      lines: f.lines || f.line || '',
      reason: f.reason || f.message || f.rule || '',
      weight: f.weight || f.points || 0,
    })),
    trust: Object.entries(r.trust || {})
      .filter(([k]) => k !== 'points')
      .map(([k, v]) => `${k}: ${v}`),
  }))
}
