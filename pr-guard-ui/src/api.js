import { prs } from './data'

// Ask backend teammates for the real URL, then put it here
const API_URL = ''

export async function fetchPrs(repo) {
  if (!API_URL) {
    // fake mode: pretend to wait, then return the fake PRs
    await new Promise((r) => setTimeout(r, 800))
    return prs
  }
  const res = await fetch(`${API_URL}/prs?repo=${encodeURIComponent(repo)}`)
  if (!res.ok) throw new Error('Server returned ' + res.status)
  return await res.json()
}